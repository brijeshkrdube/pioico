import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminContext = createContext(null);

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Create axios instance with auth header
    const authAxios = useCallback(() => {
        return axios.create({
            baseURL: API_URL,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }, [token]);
    
    // Login
    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`${API_URL}/admin/login`, {
                username,
                password
            });
            const { access_token } = response.data;
            localStorage.setItem('admin_token', access_token);
            setToken(access_token);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    // Setup (first admin)
    const setup = async (username, password, email) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`${API_URL}/admin/setup`, {
                username,
                password,
                email
            });
            const { access_token } = response.data;
            localStorage.setItem('admin_token', access_token);
            setToken(access_token);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Setup failed');
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    // Logout
    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setIsAuthenticated(false);
    };
    
    // API Methods
    const getSettings = async () => {
        const response = await authAxios().get('/admin/settings');
        return response.data;
    };
    
    const updateSettings = async (settings) => {
        const response = await authAxios().put('/admin/settings', settings);
        return response.data;
    };
    
    const pauseICO = async () => {
        const response = await authAxios().post('/admin/ico/pause');
        return response.data;
    };
    
    const resumeICO = async () => {
        const response = await authAxios().post('/admin/ico/resume');
        return response.data;
    };
    
    const getOffers = async () => {
        const response = await authAxios().get('/admin/offers');
        return response.data;
    };
    
    const createOffer = async (offer) => {
        const response = await authAxios().post('/admin/offers', offer);
        return response.data;
    };
    
    const updateOffer = async (id, offer) => {
        const response = await authAxios().put(`/admin/offers/${id}`, offer);
        return response.data;
    };
    
    const deleteOffer = async (id) => {
        const response = await authAxios().delete(`/admin/offers/${id}`);
        return response.data;
    };
    
    const getOrders = async (status = null) => {
        const params = status ? `?status=${status}` : '';
        const response = await authAxios().get(`/admin/orders${params}`);
        return response.data;
    };
    
    const getTransactions = async (chain = null) => {
        const params = chain ? `?chain=${chain}` : '';
        const response = await authAxios().get(`/admin/transactions${params}`);
        return response.data;
    };
    
    const getReferrals = async (status = null) => {
        const params = status ? `?status=${status}` : '';
        const response = await authAxios().get(`/admin/referrals${params}`);
        return response.data;
    };
    
    const updateReferralStatus = async (id, status) => {
        const response = await authAxios().put(`/admin/referrals/${id}`, { status });
        return response.data;
    };
    
    const getStats = async () => {
        const response = await authAxios().get('/admin/stats');
        return response.data;
    };
    
    const getUsers = async () => {
        const response = await authAxios().get('/admin/users');
        return response.data;
    };
    
    // Verify token on mount
    useEffect(() => {
        if (token) {
            authAxios().get('/admin/settings')
                .then(() => setIsAuthenticated(true))
                .catch(() => {
                    logout();
                });
        }
    }, [token, authAxios]);
    
    const value = {
        token,
        isAuthenticated,
        loading,
        error,
        login,
        setup,
        logout,
        getSettings,
        updateSettings,
        pauseICO,
        resumeICO,
        getOffers,
        createOffer,
        updateOffer,
        deleteOffer,
        getOrders,
        getTransactions,
        getReferrals,
        updateReferralStatus,
        getStats,
        getUsers,
    };
    
    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContext;
