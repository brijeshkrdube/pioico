import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Wallet, Gift, Loader2, TrendingUp, Clock, ChevronRight, Award, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useWallet } from '../contexts/WalletContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Referrals = () => {
    const { address, isConnected, connectWallet, user } = useWallet();
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    const referralLink = user?.referral_code
        ? `${window.location.origin}?ref=${user.referral_code}`
        : '';
    
    useEffect(() => {
        if (address) {
            fetchReferralData();
        }
    }, [address]);
    
    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users/${address}/referrals`);
            setReferralData(response.data);
        } catch (err) {
            console.error('Error fetching referrals:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success('Referral link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };
    
    const levelColors = {
        1: 'text-gold',
        2: 'text-zinc-300',
        3: 'text-zinc-400'
    };
    
    const levelRewards = {
        1: '10%',
        2: '5%',
        3: '3%'
    };

    // Prepare chart data
    const getLevelChartData = () => {
        if (!referralData?.level_stats) return [];
        return [
            { name: 'Level 1', value: referralData.level_stats[1]?.earnings || 0, count: referralData.level_stats[1]?.count || 0, fill: '#D4AF37' },
            { name: 'Level 2', value: referralData.level_stats[2]?.earnings || 0, count: referralData.level_stats[2]?.count || 0, fill: '#A0A0A0' },
            { name: 'Level 3', value: referralData.level_stats[3]?.earnings || 0, count: referralData.level_stats[3]?.count || 0, fill: '#707070' },
        ];
    };

    const getEarningsOverTime = () => {
        if (!referralData?.recent_referrals) return [];
        const grouped = {};
        referralData.recent_referrals.forEach(ref => {
            const date = new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!grouped[date]) grouped[date] = 0;
            grouped[date] += ref.reward_pio || 0;
        });
        return Object.entries(grouped).map(([date, earnings]) => ({ date, earnings: parseFloat(earnings.toFixed(4)) })).reverse().slice(-7);
    };

    const getTeamDistribution = () => {
        if (!referralData?.level_stats) return [];
        const total = (referralData.level_stats[1]?.count || 0) + 
                      (referralData.level_stats[2]?.count || 0) + 
                      (referralData.level_stats[3]?.count || 0);
        if (total === 0) return [];
        return [
            { name: 'Level 1', value: referralData.level_stats[1]?.count || 0, fill: '#D4AF37' },
            { name: 'Level 2', value: referralData.level_stats[2]?.count || 0, fill: '#B8860B' },
            { name: 'Level 3', value: referralData.level_stats[3]?.count || 0, fill: '#8B7500' },
        ];
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-obsidian-light border border-zinc-700 rounded-lg p-3 shadow-lg">
                    <p className="text-zinc-400 text-xs">{label}</p>
                    <p className="text-gold font-bold">{payload[0].value.toFixed(4)} PIO</p>
                </div>
            );
        }
        return null;
    };
    
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-obsidian pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="glass-card border-zinc-800 text-center py-16">
                        <CardContent>
                            <Users className="w-16 h-16 mx-auto text-zinc-600 mb-6" />
                            <h2 className="text-2xl font-serif font-bold text-white mb-4">
                                Connect Your Wallet
                            </h2>
                            <p className="text-zinc-400 mb-6">
                                Connect your wallet to access your referral dashboard and earn rewards.
                            </p>
                            <Button
                                onClick={connectWallet}
                                className="gold-gradient text-black font-semibold"
                                data-testid="connect-wallet-referrals"
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
        <div className="min-h-screen bg-obsidian pt-24 pb-12" data-testid="referrals-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center text-zinc-400 hover:text-gold transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <h1 className="text-3xl font-serif font-bold text-white mb-4 lg:mb-0">
                        Referral <span className="gold-gradient-text">Dashboard</span>
                    </h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchReferralData}
                        disabled={loading}
                        className="text-zinc-400 hover:text-gold self-start"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Refresh Data
                    </Button>
                </div>
                
                {/* Referral Link - Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="glass-card border-gold/30 gold-glow mb-8 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent" />
                        <CardContent className="p-6 relative">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Your Unique Referral Link</h3>
                                    <p className="text-zinc-500 text-sm">Share and earn up to 18% on your network's purchases</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
                                    <Input
                                        value={referralLink}
                                        readOnly
                                        className="bg-zinc-900/50 border-zinc-700 font-mono text-sm flex-1"
                                        data-testid="referral-link-input"
                                    />
                                    <Button
                                        onClick={copyToClipboard}
                                        className={`${copied ? 'bg-green-600' : 'gold-gradient'} text-black font-semibold min-w-[120px]`}
                                        data-testid="copy-referral-btn"
                                    >
                                        {copied ? (
                                            <><Check className="w-4 h-4 mr-2" /> Copied!</>
                                        ) : (
                                            <><Copy className="w-4 h-4 mr-2" /> Copy Link</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Main Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Users className="w-5 h-5 text-gold" />
                                    <span className="text-xs text-zinc-500">Total</span>
                                </div>
                                <p className="text-2xl font-bold text-white" data-testid="total-referrals">
                                    {referralData?.total_referrals || 0}
                                </p>
                                <p className="text-zinc-500 text-xs mt-1">Team Members</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card className="glass-card border-gold/30 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Gift className="w-5 h-5 text-gold" />
                                    <span className="text-xs text-green-500">Earned</span>
                                </div>
                                <p className="text-2xl font-bold text-gold" data-testid="total-earnings">
                                    {referralData?.total_earnings_pio?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-zinc-500 text-xs mt-1">Total PIO</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    <span className="text-xs text-yellow-500">Pending</span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-500" data-testid="pending-earnings">
                                    {referralData?.pending_earnings_pio?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-zinc-500 text-xs mt-1">Awaiting PIO</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Target className="w-5 h-5 text-blue-400" />
                                    <span className="text-xs text-zinc-500">L1</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {referralData?.level_stats?.[1]?.count || 0}
                                </p>
                                <p className="text-zinc-500 text-xs mt-1">Direct Refs</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <Award className="w-5 h-5 text-purple-400" />
                                    <span className="text-xs text-zinc-500">Code</span>
                                </div>
                                <p className="text-xl font-bold text-gold font-mono">
                                    {user?.referral_code || '---'}
                                </p>
                                <p className="text-zinc-500 text-xs mt-1">Your Code</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Earnings Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.35 }}
                        className="lg:col-span-2"
                    >
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="font-serif text-white text-lg flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-gold" />
                                    Earnings Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {getEarningsOverTime().length > 0 ? (
                                    <div className="h-[200px] mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={getEarningsOverTime()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} width={40} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="earnings" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGradient)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-zinc-500 text-sm">No earnings data yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Team Distribution */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="font-serif text-white text-lg flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-gold" />
                                    Team Structure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {getTeamDistribution().length > 0 ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getTeamDistribution()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {getTeamDistribution().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    content={({ payload }) => {
                                                        if (payload && payload.length) {
                                                            return (
                                                                <div className="bg-obsidian-light border border-zinc-700 rounded-lg p-2 shadow-lg">
                                                                    <p className="text-white text-sm">{payload[0].name}: {payload[0].value}</p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-zinc-500 text-sm">Build your team to see distribution</p>
                                    </div>
                                )}
                                <div className="flex justify-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                                        <span className="text-xs text-zinc-400">L1</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#B8860B]" />
                                        <span className="text-xs text-zinc-400">L2</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#8B7500]" />
                                        <span className="text-xs text-zinc-400">L3</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                
                {/* Level Breakdown with Bar Chart */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.45 }}
                    >
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardHeader>
                                <CardTitle className="font-serif text-white flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-gold" />
                                    Earnings by Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[180px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getLevelChartData()} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} width={60} />
                                            <Tooltip 
                                                content={({ payload }) => {
                                                    if (payload && payload.length) {
                                                        return (
                                                            <div className="bg-obsidian-light border border-zinc-700 rounded-lg p-2 shadow-lg">
                                                                <p className="text-gold font-bold">{payload[0].value.toFixed(4)} PIO</p>
                                                                <p className="text-zinc-400 text-xs">{payload[0].payload.count} referrals</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                {getLevelChartData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                {/* Level Details */}
                                <div className="space-y-3 mt-4">
                                    {[1, 2, 3].map((level) => (
                                        <div
                                            key={level}
                                            className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-full ${level === 1 ? 'gold-gradient' : level === 2 ? 'bg-zinc-600' : 'bg-zinc-700'} flex items-center justify-center`}>
                                                    <span className={level === 1 ? 'text-black font-bold text-sm' : 'text-white font-bold text-sm'}>
                                                        {level}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">Level {level}</p>
                                                    <p className="text-zinc-500 text-xs">{referralData?.level_stats?.[level]?.count || 0} members</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${levelColors[level]}`}>{levelRewards[level]}</p>
                                                <p className="text-gold text-xs font-mono">
                                                    {(referralData?.level_stats?.[level]?.earnings || 0).toFixed(4)} PIO
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* How It Works */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="glass-card border-zinc-800 h-full">
                            <CardHeader>
                                <CardTitle className="font-serif text-white">How It Works</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start space-x-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-gold/20 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gold text-sm font-bold">1</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Share Your Link</p>
                                            <p className="text-zinc-400 text-xs mt-0.5">Send your unique referral link to friends interested in PIO.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-gold/20 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gold text-sm font-bold">2</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">They Purchase PIO</p>
                                            <p className="text-zinc-400 text-xs mt-0.5">When they buy PIO using your link, you earn rewards automatically.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-gold/20 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gold text-sm font-bold">3</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Earn Up To 3 Levels Deep</p>
                                            <p className="text-zinc-400 text-xs mt-0.5">
                                                10% (L1) + 5% (L2) + 3% (L3) = Up to 18% total rewards.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-gold/20 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gold text-sm font-bold">4</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Receive PIO Rewards</p>
                                            <p className="text-zinc-400 text-xs mt-0.5">Rewards are calculated on USDT spent and paid in PIO.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-gold/5 border border-gold/20 rounded-lg mt-4">
                                    <p className="text-gold text-xs">
                                        <strong>Pro Tip:</strong> Build a strong Level 1 team - they'll bring in Level 2 & 3 referrals, multiplying your passive earnings!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                
                {/* Recent Activity */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.55 }}
                >
                    <Card className="glass-card border-zinc-800">
                        <CardHeader>
                            <CardTitle className="font-serif text-white flex items-center justify-between">
                                <span className="flex items-center">
                                    <Gift className="w-5 h-5 mr-2 text-gold" />
                                    Recent Referral Activity
                                </span>
                                {referralData?.recent_referrals?.length > 0 && (
                                    <span className="text-xs text-zinc-500 font-normal">
                                        Showing last {Math.min(referralData.recent_referrals.length, 10)} transactions
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
                                </div>
                            ) : referralData?.recent_referrals?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-800">
                                                <th className="text-left py-3 px-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">Date</th>
                                                <th className="text-left py-3 px-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">Level</th>
                                                <th className="text-left py-3 px-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">Base USDT</th>
                                                <th className="text-left py-3 px-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">Reward</th>
                                                <th className="text-left py-3 px-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referralData.recent_referrals.slice(0, 10).map((ref, idx) => (
                                                <motion.tr
                                                    key={ref.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                                                >
                                                    <td className="py-4 px-3 text-white text-sm">
                                                        {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                            ref.level === 1 ? 'bg-gold/20 text-gold' :
                                                            ref.level === 2 ? 'bg-zinc-600/30 text-zinc-300' :
                                                            'bg-zinc-700/30 text-zinc-400'
                                                        }`}>
                                                            L{ref.level}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-3 text-white font-mono text-sm">
                                                        ${ref.usdt_amount?.toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-3 text-gold font-mono text-sm font-medium">
                                                        +{ref.reward_pio?.toFixed(4)} PIO
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${
                                                            ref.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                            ref.status === 'approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                        }`}>
                                                            {ref.status === 'paid' && <Check className="w-3 h-3 mr-1" />}
                                                            {ref.status === 'approved' && <ChevronRight className="w-3 h-3 mr-1" />}
                                                            {ref.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                                            {ref.status}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-400 mb-2 font-medium">No referral rewards yet</p>
                                    <p className="text-zinc-600 text-sm max-w-sm mx-auto">
                                        Share your referral link and start earning when friends purchase PIO.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Referrals;
