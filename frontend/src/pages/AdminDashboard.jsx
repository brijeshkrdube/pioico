import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Settings, Users, Package, CreditCard, Gift, LogOut, DollarSign,
    Coins, PauseCircle, PlayCircle, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAdmin } from '../contexts/AdminContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated, logout, loading,
        getSettings, updateSettings, pauseICO, resumeICO,
        getOffers, createOffer, updateOffer, deleteOffer,
        getOrders, getTransactions, getReferrals, updateReferralStatus,
        getStats, getUsers
    } = useAdmin();
    
    const [settings, setSettings] = useState(null);
    const [stats, setStats] = useState(null);
    const [offers, setOffers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);
    
    // Settings form
    const [settingsForm, setSettingsForm] = useState({
        gold_price_per_gram: '',
        ico_wallet_address: '',
        encrypted_private_key: ''
    });
    
    // New offer form
    const [offerForm, setOfferForm] = useState({
        min_usdt: '',
        max_usdt: '',
        discount_percent: '',
        validity_days: '',
        is_active: true
    });
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin');
            return;
        }
        loadData();
    }, [isAuthenticated, navigate]);
    
    const loadData = async () => {
        setRefreshing(true);
        try {
            const [settingsData, statsData, offersData, ordersData, txData, refData, usersData] = await Promise.all([
                getSettings(),
                getStats(),
                getOffers(),
                getOrders(),
                getTransactions(),
                getReferrals(),
                getUsers()
            ]);
            
            setSettings(settingsData);
            setStats(statsData);
            setOffers(offersData);
            setOrders(ordersData);
            setTransactions(txData);
            setReferrals(refData);
            setUsers(usersData);
            
            setSettingsForm({
                gold_price_per_gram: settingsData.gold_price_per_gram,
                ico_wallet_address: settingsData.ico_wallet_address,
                encrypted_private_key: ''
            });
        } catch (err) {
            toast.error('Error loading data');
        } finally {
            setRefreshing(false);
        }
    };
    
    const handleSaveSettings = async () => {
        try {
            const updates = {};
            if (settingsForm.gold_price_per_gram) {
                updates.gold_price_per_gram = parseFloat(settingsForm.gold_price_per_gram);
            }
            if (settingsForm.ico_wallet_address) {
                updates.ico_wallet_address = settingsForm.ico_wallet_address;
            }
            if (settingsForm.encrypted_private_key) {
                updates.encrypted_private_key = settingsForm.encrypted_private_key;
            }
            
            await updateSettings(updates);
            toast.success('Settings updated!');
            loadData();
        } catch (err) {
            toast.error('Failed to update settings');
        }
    };
    
    const handleToggleICO = async () => {
        try {
            if (settings?.ico_active) {
                await pauseICO();
                toast.warning('ICO Paused');
            } else {
                await resumeICO();
                toast.success('ICO Resumed');
            }
            loadData();
        } catch (err) {
            toast.error('Failed to toggle ICO');
        }
    };
    
    const handleCreateOffer = async (e) => {
        e.preventDefault();
        try {
            await createOffer({
                min_usdt: parseFloat(offerForm.min_usdt),
                max_usdt: parseFloat(offerForm.max_usdt),
                discount_percent: parseFloat(offerForm.discount_percent),
                validity_days: parseInt(offerForm.validity_days),
                is_active: offerForm.is_active
            });
            toast.success('Offer created!');
            setOfferForm({ min_usdt: '', max_usdt: '', discount_percent: '', validity_days: '', is_active: true });
            loadData();
        } catch (err) {
            toast.error('Failed to create offer');
        }
    };
    
    const handleDeleteOffer = async (id) => {
        if (!window.confirm('Delete this offer?')) return;
        try {
            await deleteOffer(id);
            toast.success('Offer deleted');
            loadData();
        } catch (err) {
            toast.error('Failed to delete offer');
        }
    };
    
    const handleReferralAction = async (id, status) => {
        try {
            await updateReferralStatus(id, status);
            toast.success(`Referral ${status}`);
            loadData();
        } catch (err) {
            toast.error('Failed to update referral');
        }
    };
    
    const handleLogout = () => {
        logout();
        navigate('/admin');
    };
    
    if (!isAuthenticated) {
        return null;
    }
    
    return (
        <div className="min-h-screen bg-obsidian" data-testid="admin-dashboard">
            {/* Admin Navbar */}
            <nav className="bg-obsidian-light border-b border-zinc-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
                                <span className="text-black font-bold text-sm">P</span>
                            </div>
                            <span className="text-lg font-bold font-serif gold-gradient-text">PIOGOLD Admin</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadData}
                            disabled={refreshing}
                            className="text-zinc-400 hover:text-gold"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-zinc-400 hover:text-red-500"
                            data-testid="admin-logout"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>
            
            <div className="p-6">
                {/* Stats Overview */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="glass-card border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Total Users</p>
                                    <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
                                </div>
                                <Users className="w-8 h-8 text-gold" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="glass-card border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">USDT Raised</p>
                                    <p className="text-2xl font-bold text-green-500">${stats?.total_usdt_raised?.toFixed(2) || 0}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="glass-card border-gold/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">PIO Sold</p>
                                    <p className="text-2xl font-bold text-gold">{stats?.total_pio_sold?.toFixed(4) || 0}</p>
                                </div>
                                <Coins className="w-8 h-8 text-gold" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="glass-card border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Pending Referrals</p>
                                    <p className="text-2xl font-bold text-yellow-500">{stats?.pending_referrals || 0}</p>
                                </div>
                                <Gift className="w-8 h-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="offers" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                            <Gift className="w-4 h-4 mr-2" />
                            Offers
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                            <Package className="w-4 h-4 mr-2" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="referrals" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                            <Users className="w-4 h-4 mr-2" />
                            Referrals
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Transactions
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Settings Tab */}
                    <TabsContent value="overview">
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* ICO Control */}
                            <Card className="glass-card border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="font-serif text-white flex items-center justify-between">
                                        ICO Control
                                        <Button
                                            onClick={handleToggleICO}
                                            variant={settings?.ico_active ? 'destructive' : 'default'}
                                            className={settings?.ico_active ? '' : 'gold-gradient text-black'}
                                            data-testid="toggle-ico-btn"
                                        >
                                            {settings?.ico_active ? (
                                                <><PauseCircle className="w-4 h-4 mr-2" /> Pause ICO</>
                                            ) : (
                                                <><PlayCircle className="w-4 h-4 mr-2" /> Resume ICO</>
                                            )}
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                                        <span className="text-zinc-400">ICO Status</span>
                                        <span className={`font-semibold ${settings?.ico_active ? 'text-green-500' : 'text-red-500'}`}>
                                            {settings?.ico_active ? 'ACTIVE' : 'PAUSED'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                                        <span className="text-zinc-400">Private Key</span>
                                        <span className={`font-semibold ${settings?.has_private_key ? 'text-green-500' : 'text-red-500'}`}>
                                            {settings?.has_private_key ? 'Configured' : 'Not Set'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Gold Price */}
                            <Card className="glass-card border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="font-serif text-white">Gold Price Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Gold Price per Gram (USD)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={settingsForm.gold_price_per_gram}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, gold_price_per_gram: e.target.value })}
                                            className="bg-zinc-900/50 border-zinc-800"
                                            data-testid="gold-price-input"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSaveSettings}
                                        className="gold-gradient text-black font-semibold w-full"
                                        data-testid="save-settings-btn"
                                    >
                                        Save Gold Price
                                    </Button>
                                </CardContent>
                            </Card>
                            
                            {/* Wallet Settings */}
                            <Card className="glass-card border-zinc-800 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="font-serif text-white">Wallet Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400">ICO Wallet Address (receives USDT)</Label>
                                            <Input
                                                type="text"
                                                placeholder="0x..."
                                                value={settingsForm.ico_wallet_address}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, ico_wallet_address: e.target.value })}
                                                className="bg-zinc-900/50 border-zinc-800 font-mono text-sm"
                                                data-testid="ico-wallet-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400">Admin Private Key (for PIO transfers)</Label>
                                            <Input
                                                type="password"
                                                placeholder="Enter to update (will be encrypted)"
                                                value={settingsForm.encrypted_private_key}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, encrypted_private_key: e.target.value })}
                                                className="bg-zinc-900/50 border-zinc-800 font-mono text-sm"
                                                data-testid="private-key-input"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                        <div className="flex items-start space-x-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-yellow-500 text-sm">
                                                <strong>Security:</strong> Private key is encrypted with AES-256 before storage. 
                                                Never share your private key. This wallet will be used to send PIO to buyers.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        onClick={handleSaveSettings}
                                        className="gold-gradient text-black font-semibold"
                                    >
                                        Save Wallet Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    {/* Offers Tab */}
                    <TabsContent value="offers">
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Create Offer */}
                            <Card className="glass-card border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="font-serif text-white">Create Offer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateOffer} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-zinc-400">Min USDT</Label>
                                                <Input
                                                    type="number"
                                                    value={offerForm.min_usdt}
                                                    onChange={(e) => setOfferForm({ ...offerForm, min_usdt: e.target.value })}
                                                    className="bg-zinc-900/50 border-zinc-800"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-400">Max USDT</Label>
                                                <Input
                                                    type="number"
                                                    value={offerForm.max_usdt}
                                                    onChange={(e) => setOfferForm({ ...offerForm, max_usdt: e.target.value })}
                                                    className="bg-zinc-900/50 border-zinc-800"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-zinc-400">Discount %</Label>
                                                <Input
                                                    type="number"
                                                    value={offerForm.discount_percent}
                                                    onChange={(e) => setOfferForm({ ...offerForm, discount_percent: e.target.value })}
                                                    className="bg-zinc-900/50 border-zinc-800"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-400">Validity (days)</Label>
                                                <Input
                                                    type="number"
                                                    value={offerForm.validity_days}
                                                    onChange={(e) => setOfferForm({ ...offerForm, validity_days: e.target.value })}
                                                    className="bg-zinc-900/50 border-zinc-800"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={offerForm.is_active}
                                                onCheckedChange={(checked) => setOfferForm({ ...offerForm, is_active: checked })}
                                            />
                                            <Label className="text-zinc-400">Active</Label>
                                        </div>
                                        <Button type="submit" className="w-full gold-gradient text-black font-semibold">
                                            Create Offer
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                            
                            {/* Existing Offers */}
                            <Card className="glass-card border-zinc-800 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="font-serif text-white">Existing Offers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {offers.map((offer) => (
                                            <div
                                                key={offer.id}
                                                className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-3 h-3 rounded-full ${offer.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            ${offer.min_usdt} - ${offer.max_usdt}
                                                        </p>
                                                        <p className="text-zinc-500 text-sm">
                                                            Valid for {offer.validity_days} days
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gold font-bold text-xl">+{offer.discount_percent}%</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteOffer(offer.id)}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {offers.length === 0 && (
                                            <p className="text-zinc-500 text-center py-8">No offers created yet</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <Card className="glass-card border-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-serif text-white">All Orders ({orders.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-800">
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Date</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Wallet</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">USDT</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">PIO</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Bonus</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 50).map((order) => (
                                                <tr key={order.id} className="border-b border-zinc-800/50">
                                                    <td className="py-3 px-2 text-white text-sm">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-zinc-300 font-mono text-sm">
                                                        {order.wallet_address?.slice(0, 8)}...
                                                    </td>
                                                    <td className="py-3 px-2 text-white font-mono text-sm">
                                                        ${order.usdt_amount}
                                                    </td>
                                                    <td className="py-3 px-2 text-gold font-mono text-sm">
                                                        {order.total_pio?.toFixed(4)}
                                                    </td>
                                                    <td className="py-3 px-2 text-green-500 text-sm">
                                                        {order.discount_percent > 0 ? `+${order.discount_percent}%` : '-'}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`text-sm px-2 py-1 rounded ${
                                                            order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                            order.status.includes('failed') ? 'bg-red-500/20 text-red-500' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {orders.length === 0 && (
                                        <p className="text-zinc-500 text-center py-8">No orders yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Referrals Tab */}
                    <TabsContent value="referrals">
                        <Card className="glass-card border-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-serif text-white">Referral Rewards ({referrals.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-800">
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Date</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Level</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">USDT Base</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Reward (PIO)</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Status</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referrals.slice(0, 50).map((ref) => (
                                                <tr key={ref.id} className="border-b border-zinc-800/50">
                                                    <td className="py-3 px-2 text-white text-sm">
                                                        {new Date(ref.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-gold font-semibold">
                                                        Level {ref.level}
                                                    </td>
                                                    <td className="py-3 px-2 text-white font-mono text-sm">
                                                        ${ref.usdt_amount}
                                                    </td>
                                                    <td className="py-3 px-2 text-gold font-mono text-sm">
                                                        {ref.reward_pio?.toFixed(6)}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`text-sm px-2 py-1 rounded ${
                                                            ref.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                                            ref.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                                                            ref.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                            {ref.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 space-x-2">
                                                        {ref.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleReferralAction(ref.id, 'approved')}
                                                                    className="text-green-500 hover:text-green-400 text-xs"
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleReferralAction(ref.id, 'rejected')}
                                                                    className="text-red-500 hover:text-red-400 text-xs"
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {ref.status === 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleReferralAction(ref.id, 'paid')}
                                                                className="text-gold hover:text-gold-light text-xs"
                                                            >
                                                                Mark Paid
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {referrals.length === 0 && (
                                        <p className="text-zinc-500 text-center py-8">No referral rewards yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Transactions Tab */}
                    <TabsContent value="transactions">
                        <Card className="glass-card border-zinc-800">
                            <CardHeader>
                                <CardTitle className="font-serif text-white">All Transactions ({transactions.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-800">
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Date</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Type</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Chain</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Amount</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">TX Hash</th>
                                                <th className="text-left py-3 px-2 text-zinc-400 text-sm">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.slice(0, 50).map((tx) => (
                                                <tr key={tx.id} className="border-b border-zinc-800/50">
                                                    <td className="py-3 px-2 text-white text-sm">
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-zinc-300 text-sm capitalize">
                                                        {tx.type.replace(/_/g, ' ')}
                                                    </td>
                                                    <td className="py-3 px-2 text-sm">
                                                        <span className={tx.chain === 'bsc' ? 'text-yellow-500' : 'text-gold'}>
                                                            {tx.chain.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-white font-mono text-sm">
                                                        {tx.amount}
                                                    </td>
                                                    <td className="py-3 px-2 text-zinc-400 font-mono text-xs">
                                                        {tx.tx_hash?.slice(0, 16)}...
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`text-sm px-2 py-1 rounded ${
                                                            tx.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                            tx.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {transactions.length === 0 && (
                                        <p className="text-zinc-500 text-center py-8">No transactions yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
