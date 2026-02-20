import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Clock, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useWallet } from '../contexts/WalletContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
    const { address, isConnected, connectWallet, user } = useWallet();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (address) {
            fetchOrders();
        }
    }, [address]);
    
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users/${address}/orders`);
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'pending_verification':
            case 'processing':
                return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
            default:
                return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-500';
            case 'pending_verification':
            case 'processing':
                return 'text-yellow-500';
            default:
                return 'text-red-500';
        }
    };
    
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };
    
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-obsidian pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="glass-card border-zinc-800 text-center py-16">
                        <CardContent>
                            <Wallet className="w-16 h-16 mx-auto text-zinc-600 mb-6" />
                            <h2 className="text-2xl font-serif font-bold text-white mb-4">
                                Connect Your Wallet
                            </h2>
                            <p className="text-zinc-400 mb-6">
                                Connect your wallet to view your purchase history and PIO balance.
                            </p>
                            <Button
                                onClick={connectWallet}
                                className="gold-gradient text-black font-semibold"
                                data-testid="connect-wallet-dashboard"
                            >
                                Connect Wallet
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-obsidian pt-24 pb-12" data-testid="dashboard-page">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center text-zinc-400 hover:text-gold transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                
                <h1 className="text-3xl font-serif font-bold text-white mb-8">
                    My <span className="gold-gradient-text">Dashboard</span>
                </h1>
                
                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="glass-card border-zinc-800">
                            <CardContent className="p-6">
                                <p className="text-zinc-400 text-sm mb-1">Connected Wallet</p>
                                <p className="text-white font-mono text-sm truncate" data-testid="wallet-address">
                                    {address}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass-card border-zinc-800">
                            <CardContent className="p-6">
                                <p className="text-zinc-400 text-sm mb-1">Total USDT Spent</p>
                                <p className="text-2xl font-bold text-white" data-testid="total-usdt">
                                    ${user?.total_purchased_usdt?.toFixed(2) || '0.00'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="glass-card border-gold/30">
                            <CardContent className="p-6">
                                <p className="text-zinc-400 text-sm mb-1">Total PIO Received</p>
                                <p className="text-2xl font-bold text-gold" data-testid="total-pio">
                                    {user?.total_pio_received?.toFixed(4) || '0.0000'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="glass-card border-zinc-800">
                            <CardContent className="p-6">
                                <p className="text-zinc-400 text-sm mb-1">Your Referral Code</p>
                                <p className="text-xl font-bold text-gold font-mono" data-testid="referral-code">
                                    {user?.referral_code || '---'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                
                {/* Orders List */}
                <Card className="glass-card border-zinc-800">
                    <CardHeader>
                        <CardTitle className="font-serif text-white flex items-center justify-between">
                            Purchase History
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchOrders}
                                disabled={loading}
                                className="text-zinc-400 hover:text-gold"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zinc-500 mb-4">No purchases yet</p>
                                <Button asChild className="gold-gradient text-black font-semibold">
                                    <Link to="/buy">Buy PIO Now</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Date</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">USDT</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">PIO</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Bonus</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Status</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">TX</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-zinc-800/50 hover:bg-zinc-900/30"
                                                data-testid={`order-${order.id}`}
                                            >
                                                <td className="py-4 px-2 text-white text-sm">
                                                    {formatDate(order.created_at)}
                                                </td>
                                                <td className="py-4 px-2 text-white font-mono text-sm">
                                                    ${order.usdt_amount}
                                                </td>
                                                <td className="py-4 px-2 text-gold font-mono text-sm">
                                                    {order.total_pio?.toFixed(4)}
                                                </td>
                                                <td className="py-4 px-2 text-green-500 text-sm">
                                                    {order.discount_percent > 0 ? `+${order.discount_percent}%` : '-'}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(order.status)}
                                                        <span className={`text-sm ${getStatusColor(order.status)}`}>
                                                            {order.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2">
                                                    {order.pio_tx_hash ? (
                                                        <a
                                                            href={`https://pioscan.com/tx/${order.pio_tx_hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gold hover:underline flex items-center text-sm"
                                                        >
                                                            View <ExternalLink className="w-3 h-3 ml-1" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-zinc-500 text-sm">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
