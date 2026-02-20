import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WalletContext = createContext(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { open } = useWeb3Modal();
    
    const { data: bnbBalance } = useBalance({
        address,
        chainId: bsc.id,
    });
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [needsReferral, setNeedsReferral] = useState(false);
    
    // Register or get user when wallet connects
    const registerUser = useCallback(async (walletAddress, referrerCode = null) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`${API_URL}/users/register`, {
                wallet_address: walletAddress,
                referrer_code: referrerCode
            });
            setUser(response.data);
            setNeedsReferral(false);
            return response.data;
        } catch (err) {
            console.error('Error registering user:', err);
            const errorMsg = err.response?.data?.detail || err.message;
            setError(errorMsg);
            
            if (errorMsg.includes('Referral code is required') || errorMsg.includes('Invalid referral code')) {
                setNeedsReferral(true);
                toast.error('A valid referral code is required to register');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Fetch user data
    const fetchUser = useCallback(async (walletAddress) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users/${walletAddress}`);
            setUser(response.data);
            setNeedsReferral(false);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                // User not found, will need to register with referral
                return null;
            }
            console.error('Error fetching user:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Handle wallet connection
    useEffect(() => {
        if (isConnected && address) {
            // Check for referral code in URL
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');
            
            fetchUser(address).then((existingUser) => {
                if (!existingUser) {
                    registerUser(address, refCode);
                }
            });
        } else {
            setUser(null);
        }
    }, [isConnected, address, fetchUser, registerUser]);
    
    // Switch to BSC if not on it
    const ensureBSC = useCallback(async () => {
        if (chainId !== bsc.id) {
            try {
                await switchChain({ chainId: bsc.id });
                return true;
            } catch (err) {
                console.error('Error switching chain:', err);
                return false;
            }
        }
        return true;
    }, [chainId, switchChain]);
    
    const connectWallet = useCallback(() => {
        open();
    }, [open]);
    
    const disconnectWallet = useCallback(() => {
        disconnect();
        setUser(null);
    }, [disconnect]);
    
    const value = {
        address,
        isConnected,
        chainId,
        user,
        loading,
        error,
        bnbBalance: bnbBalance?.formatted || '0',
        connectWallet,
        disconnectWallet,
        ensureBSC,
        isBSC: chainId === bsc.id,
        fetchUser,
    };
    
    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export default WalletContext;
