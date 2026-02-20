import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Wallet, Gift, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useWallet } from '../contexts/WalletContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Referrals = () => {
    const { address, isConnected, connectWallet, user } = useWallet();
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    
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
                    Referral <span className="gold-gradient-text">Program</span>
                </h1>
                
                {/* Referral Link */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="glass-card border-gold/20 gold-glow mb-8">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Your Referral Link</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    value={referralLink}
                                    readOnly
                                    className="bg-zinc-900/50 border-zinc-800 font-mono text-sm flex-1"
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
                                        <><Copy className="w-4 h-4 mr-2" /> Copy</>
                                    )}
                                </Button>
                            </div>
                            <p className="text-zinc-500 text-sm mt-3">
                                Share this link to earn rewards when others purchase PIO.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass-card border-zinc-800">
                            <CardContent className="p-6 text-center">
                                <Users className="w-8 h-8 text-gold mx-auto mb-2" />
                                <p className="text-zinc-400 text-sm mb-1">Total Referrals</p>
                                <p className="text-2xl font-bold text-white" data-testid="total-referrals">
                                    {referralData?.total_referrals || 0}
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
                            <CardContent className="p-6 text-center">
                                <Gift className="w-8 h-8 text-gold mx-auto mb-2" />
                                <p className="text-zinc-400 text-sm mb-1">Total Earnings</p>
                                <p className="text-2xl font-bold text-gold" data-testid="total-earnings">
                                    {referralData?.total_earnings_pio?.toFixed(4) || '0.0000'} PIO
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
                            <CardContent className="p-6 text-center">
                                <Wallet className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                <p className="text-zinc-400 text-sm mb-1">Pending</p>
                                <p className="text-2xl font-bold text-yellow-500" data-testid="pending-earnings">
                                    {referralData?.pending_earnings_pio?.toFixed(4) || '0.0000'} PIO
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass-card border-zinc-800">
                            <CardContent className="p-6 text-center">
                                <p className="text-zinc-400 text-sm mb-3">Your Code</p>
                                <p className="text-2xl font-bold text-gold font-mono">
                                    {user?.referral_code || '---'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                
                {/* Referral Levels */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Level Breakdown */}
                    <Card className="glass-card border-zinc-800">
                        <CardHeader>
                            <CardTitle className="font-serif text-white">3-Level Rewards</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((level) => (
                                <div
                                    key={level}
                                    className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full ${level === 1 ? 'gold-gradient' : 'bg-zinc-700'} flex items-center justify-center`}>
                                            <span className={level === 1 ? 'text-black font-bold' : 'text-white font-bold'}>
                                                L{level}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Level {level} Referrals</p>
                                            <p className="text-zinc-500 text-sm">
                                                {level === 1 ? 'Direct referrals' : `Referrals of Level ${level - 1}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${levelColors[level]}`}>
                                            {levelRewards[level]}
                                        </p>
                                        <p className="text-zinc-500 text-sm">
                                            {referralData?.level_stats?.[level]?.count || 0} refs
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                    {/* How It Works */}
                    <Card className="glass-card border-zinc-800">
                        <CardHeader>
                            <CardTitle className="font-serif text-white">How It Works</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-gold text-xs font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Share Your Link</p>
                                        <p className="text-zinc-400">Send your unique referral link to friends.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-gold text-xs font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">They Purchase PIO</p>
                                        <p className="text-zinc-400">When they buy PIO using your link, you earn rewards.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-gold text-xs font-bold">3</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Earn Up To 3 Levels</p>
                                        <p className="text-zinc-400">
                                            Get 10% from Level 1, 5% from Level 2, and 3% from Level 3.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-gold text-xs font-bold">4</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Receive PIO Rewards</p>
                                        <p className="text-zinc-400">Rewards are calculated on USDT spent and paid in PIO.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                                <p className="text-gold text-sm">
                                    <strong>Note:</strong> Bonus PIO from discounts does not affect referral calculations. 
                                    Rewards are based on the original USDT amount.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Recent Referrals */}
                <Card className="glass-card border-zinc-800">
                    <CardHeader>
                        <CardTitle className="font-serif text-white flex items-center justify-between">
                            Recent Referral Rewards
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchReferralData}
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
                        ) : referralData?.recent_referrals?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Date</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Level</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">USDT</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Reward (PIO)</th>
                                            <th className="text-left py-3 px-2 text-zinc-400 text-sm font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralData.recent_referrals.map((ref) => (
                                            <tr
                                                key={ref.id}
                                                className="border-b border-zinc-800/50 hover:bg-zinc-900/30"
                                            >
                                                <td className="py-4 px-2 text-white text-sm">
                                                    {new Date(ref.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className={`font-bold ${levelColors[ref.level]}`}>
                                                        Level {ref.level}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2 text-white font-mono text-sm">
                                                    ${ref.usdt_amount}
                                                </td>
                                                <td className="py-4 px-2 text-gold font-mono text-sm">
                                                    +{ref.reward_pio?.toFixed(6)}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className={`text-sm px-2 py-1 rounded ${
                                                        ref.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                                        ref.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                        {ref.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-500 mb-4">No referral rewards yet</p>
                                <p className="text-zinc-600 text-sm">
                                    Share your link and start earning when friends purchase PIO.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Referrals;
