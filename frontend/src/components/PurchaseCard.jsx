import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Loader2, Check, AlertCircle, Coins, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useWallet } from '../contexts/WalletContext';
import { useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits } from 'ethers';
import { bsc } from 'wagmi/chains';
import { USDT_ADDRESS, USDT_ABI } from '../config/wagmi';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PurchaseCard = () => {
    const { address, isConnected, connectWallet, isBSC, ensureBSC, user, needsReferral, registerUser } = useWallet();
    const { switchChain } = useSwitchChain();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    
    const [usdtAmount, setUsdtAmount] = useState('');
    const [calculation, setCalculation] = useState(null);
    const [settings, setSettings] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [loadingCalc, setLoadingCalc] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [registeringWithRef, setRegisteringWithRef] = useState(false);
    
    // Fetch public settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_URL}/settings/public`);
                setSettings(response.data);
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };
        fetchSettings();
    }, []);
    
    // Handle registration with referral code
    const handleRegisterWithReferral = async () => {
        if (!referralCode.trim()) {
            toast.error('Please enter a referral code');
            return;
        }
        setRegisteringWithRef(true);
        const result = await registerUser(address, referralCode.trim());
        setRegisteringWithRef(false);
        if (result) {
            toast.success('Registration successful!');
        }
    };
    
    // Calculate PIO when amount changes
    const calculatePurchase = useCallback(async (amount) => {
        if (!amount || parseFloat(amount) <= 0) {
            setCalculation(null);
            return;
        }
        
        try {
            setLoadingCalc(true);
            const response = await axios.post(`${API_URL}/calculate-purchase`, {
                usdt_amount: parseFloat(amount)
            });
            setCalculation(response.data);
        } catch (err) {
            console.error('Error calculating:', err);
        } finally {
            setLoadingCalc(false);
        }
    }, []);
    
    useEffect(() => {
        const debounce = setTimeout(() => {
            calculatePurchase(usdtAmount);
        }, 300);
        return () => clearTimeout(debounce);
    }, [usdtAmount, calculatePurchase]);
    
    // Handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && hash && address) {
            // Create order in backend
            const createOrder = async () => {
                try {
                    const response = await axios.post(`${API_URL}/orders/create`, {
                        wallet_address: address,
                        usdt_amount: parseFloat(usdtAmount),
                        tx_hash: hash
                    });
                    setOrderStatus({
                        status: 'processing',
                        orderId: response.data.order_id,
                        totalPio: response.data.total_pio
                    });
                    toast.success('Payment confirmed! Processing your PIO...');
                    
                    // Poll for order status
                    pollOrderStatus(response.data.order_id);
                } catch (err) {
                    toast.error(err.response?.data?.detail || 'Error creating order');
                    setOrderStatus({ status: 'error', message: err.response?.data?.detail || 'Error' });
                }
            };
            createOrder();
        }
    }, [isConfirmed, hash, address, usdtAmount]);
    
    const pollOrderStatus = async (orderId) => {
        const maxAttempts = 30;
        let attempts = 0;
        
        const poll = async () => {
            try {
                const response = await axios.get(`${API_URL}/orders/${orderId}/status`);
                const status = response.data.status;
                
                if (status === 'completed') {
                    setOrderStatus({
                        status: 'completed',
                        orderId,
                        pioTxHash: response.data.pio_tx_hash,
                        totalPio: response.data.total_pio
                    });
                    toast.success('PIO sent to your wallet!');
                    return;
                } else if (status.includes('failed')) {
                    setOrderStatus({
                        status: 'failed',
                        orderId,
                        message: response.data.error || 'Transaction failed'
                    });
                    toast.error('Order failed: ' + (response.data.error || 'Unknown error'));
                    return;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000);
                }
            } catch (err) {
                console.error('Error polling status:', err);
            }
        };
        
        setTimeout(poll, 5000);
    };
    
    const handleBuy = async () => {
        if (!isConnected) {
            connectWallet();
            return;
        }
        
        if (!isBSC) {
            try {
                await switchChain({ chainId: bsc.id });
            } catch (err) {
                toast.error('Please switch to BSC network');
            }
            return;
        }
        
        if (!settings?.ico_active) {
            toast.error('ICO is currently paused');
            return;
        }
        
        if (!settings?.ico_wallet_address) {
            toast.error('ICO wallet not configured');
            return;
        }
        
        if (!usdtAmount || parseFloat(usdtAmount) < 50) {
            toast.error('Minimum purchase is $50 USDT');
            return;
        }
        
        try {
            const amountWei = parseUnits(usdtAmount, 18);
            
            writeContract({
                address: USDT_ADDRESS,
                abi: USDT_ABI,
                functionName: 'transfer',
                args: [settings.ico_wallet_address, amountWei]
            });
        } catch (err) {
            toast.error(err.message || 'Transaction failed');
        }
    };
    
    const resetForm = () => {
        setUsdtAmount('');
        setCalculation(null);
        setOrderStatus(null);
    };
    
    if (orderStatus?.status === 'completed') {
        return (
            <Card className="glass-card border-gold/20 gold-glow overflow-hidden">
                <CardContent className="p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 mx-auto rounded-full gold-gradient flex items-center justify-center mb-6"
                    >
                        <Check className="w-10 h-10 text-black" />
                    </motion.div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Purchase Complete!</h3>
                    <p className="text-zinc-400 mb-4">
                        You received <span className="text-gold font-semibold">{orderStatus.totalPio} PIO</span>
                    </p>
                    {orderStatus.pioTxHash && (
                        <a
                            href={`https://pioscan.com/tx/${orderStatus.pioTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold hover:underline text-sm"
                        >
                            View on PioScan
                        </a>
                    )}
                    <Button
                        onClick={resetForm}
                        className="mt-6 w-full gold-gradient text-black font-semibold"
                        data-testid="buy-more-btn"
                    >
                        Buy More PIO
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="glass-card border-gold/20 gold-glow overflow-hidden tracing-beam" data-testid="purchase-card">
            <CardHeader className="border-b border-zinc-800 pb-6">
                <CardTitle className="flex items-center justify-between">
                    <span className="font-serif text-xl text-white">Buy PIO</span>
                    {settings && (
                        <div className="flex items-center space-x-2">
                            <Coins className="w-5 h-5 text-gold" />
                            <span className="text-gold font-mono text-lg">${settings.gold_price_per_gram}</span>
                            <span className="text-zinc-500 text-sm">/gram</span>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
                {/* USDT Input */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Pay with USDT (BEP20)</label>
                    <div className="relative">
                        <Input
                            type="number"
                            placeholder="Enter amount (min. $50)"
                            value={usdtAmount}
                            onChange={(e) => setUsdtAmount(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 h-14 text-lg pr-16 focus:border-gold"
                            min="50"
                            step="1"
                            data-testid="usdt-input"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">
                            USDT
                        </span>
                    </div>
                </div>
                
                {/* Arrow */}
                <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-gold transform rotate-90" />
                    </div>
                </div>
                
                {/* PIO Output */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400">You will receive</label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={loadingCalc ? 'Calculating...' : (calculation?.total_pio?.toFixed(8) || '0.00000000')}
                            readOnly
                            className="bg-zinc-900/50 border-zinc-800 h-14 text-lg pr-16 text-gold font-mono"
                            data-testid="pio-output"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold font-semibold">
                            PIO
                        </span>
                    </div>
                </div>
                
                {/* Calculation Details */}
                {calculation && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/50 rounded-lg p-4 space-y-2"
                    >
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Base PIO</span>
                            <span className="text-zinc-300 font-mono">{calculation.base_pio?.toFixed(8)}</span>
                        </div>
                        {calculation.discount_percent > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-500">Bonus ({calculation.discount_percent}%)</span>
                                <span className="text-green-400 font-mono">+{calculation.bonus_pio?.toFixed(8)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                            <span className="text-zinc-400">Total PIO</span>
                            <span className="text-gold font-mono font-semibold">{calculation.total_pio?.toFixed(8)}</span>
                        </div>
                        {calculation.discount_tier && (
                            <p className="text-xs text-green-500 mt-2">
                                {calculation.discount_tier}
                            </p>
                        )}
                    </motion.div>
                )}
                
                {/* Discount Tiers */}
                {settings?.offers?.length > 0 && (
                    <div className="bg-zinc-900/30 rounded-lg p-4">
                        <p className="text-xs text-zinc-500 mb-2">Active Bonus Tiers:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {settings.offers.slice(0, 4).map((offer, idx) => (
                                <div
                                    key={idx}
                                    className={`text-xs p-2 rounded border ${
                                        calculation?.discount_percent === offer.discount_percent
                                            ? 'border-gold/50 bg-gold/10 text-gold'
                                            : 'border-zinc-800 text-zinc-500'
                                    }`}
                                >
                                    ${offer.min_usdt}-${offer.max_usdt}: +{offer.discount_percent}%
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Error Display */}
                {writeError && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{writeError.message?.split('\n')[0] || 'Transaction failed'}</span>
                    </div>
                )}
                
                {/* Status Messages */}
                {orderStatus?.status === 'processing' && (
                    <div className="flex items-center space-x-2 text-gold text-sm bg-gold/10 p-3 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing... Your PIO will arrive shortly.</span>
                    </div>
                )}
                
                {orderStatus?.status === 'failed' && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{orderStatus.message}</span>
                    </div>
                )}
                
                {/* Buy Button */}
                <Button
                    onClick={handleBuy}
                    disabled={isPending || isConfirming || !settings?.ico_active || orderStatus?.status === 'processing'}
                    className="w-full h-14 gold-gradient text-black font-semibold text-lg btn-gold disabled:opacity-50"
                    data-testid="buy-pio-btn"
                >
                    {!isConnected ? (
                        'Connect Wallet'
                    ) : !isBSC ? (
                        'Switch to BSC'
                    ) : isPending ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Confirm in Wallet</>
                    ) : isConfirming ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Confirming...</>
                    ) : !settings?.ico_active ? (
                        'ICO Paused'
                    ) : (
                        'Buy PIO'
                    )}
                </Button>
                
                {/* Network Info */}
                <p className="text-xs text-zinc-600 text-center">
                    Payment: BSC (BEP20 USDT) → Receive: PIOGOLD Chain (PIO)
                </p>
            </CardContent>
        </Card>
    );
};

export default PurchaseCard;
