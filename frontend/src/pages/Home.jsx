import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Coins, Users, TrendingUp, ChevronRight, FileText, Globe, Lock, Zap, CircleDollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
    const [settings, setSettings] = useState(null);
    
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_URL}/settings/public`);
                setSettings(response.data);
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchSettings();
    }, []);
    
    const features = [
        {
            icon: <Coins className="w-8 h-8" />,
            title: 'Gold-Backed Value',
            description: '1 PIO = 1 gram of gold. Real value, real stability.'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Secure Blockchain',
            description: 'Built on PIOGOLD Mainnet with enterprise security.'
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: '3-Level Referrals',
            description: 'Earn 10%, 5%, and 3% from your network purchases.'
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Bonus Discounts',
            description: 'Up to 20% bonus PIO on larger purchases.'
        }
    ];
    
    return (
        <div className="min-h-screen bg-obsidian">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1643324897599-2a45fd360c8d?crop=entropy&cs=srgb&fm=jpg&q=85')`
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/90 to-obsidian" />
                <div className="absolute inset-0 bg-gold-glow opacity-30" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-gold text-sm font-medium">ICO Now Live</span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                                <span className="text-white">Invest in </span>
                                <span className="gold-gradient-text">Gold-Backed</span>
                                <br />
                                <span className="text-white">Cryptocurrency</span>
                            </h1>
                            
                            <p className="text-lg text-zinc-400 max-w-lg">
                                PIOGOLD (PIO) combines the stability of gold with blockchain technology. 
                                Each PIO represents 1 gram of gold value on our secure mainnet.
                            </p>
                            
                            {settings && (
                                <div className="flex items-center space-x-6 py-4">
                                    <div>
                                        <p className="text-zinc-500 text-sm">Gold Price</p>
                                        <p className="text-3xl font-serif font-bold text-gold">
                                            ${settings.gold_price_per_gram}
                                        </p>
                                        <p className="text-zinc-500 text-xs">per gram / PIO</p>
                                    </div>
                                    <div className="h-16 w-px bg-zinc-800" />
                                    <div>
                                        <p className="text-zinc-500 text-sm">Bonus Up To</p>
                                        <p className="text-3xl font-serif font-bold text-green-500">
                                            +20%
                                        </p>
                                        <p className="text-zinc-500 text-xs">extra PIO</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="gold-gradient text-black font-semibold text-lg h-14 px-8 btn-gold"
                                    data-testid="hero-buy-btn"
                                >
                                    <Link to="/buy">
                                        Buy PIO Now <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                                {settings?.whitepaper_url && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="border-gold/50 text-gold hover:bg-gold/10 h-14 px-8"
                                        data-testid="hero-whitepaper-btn"
                                    >
                                        <a href={settings.whitepaper_url} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 w-5 h-5" /> View Whitepaper
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                        
                        {/* Right Content - Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 gold-gradient opacity-20 blur-3xl rounded-full" />
                                <Card className="glass-card border-gold/20 overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="text-center mb-6">
                                            <img src="/logo.png" alt="PIOGOLD" className="w-20 h-20 mx-auto object-contain mb-4" />
                                            <h3 className="text-2xl font-serif font-bold text-white">PIOGOLD</h3>
                                            <p className="text-zinc-400">Native Coin</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex justify-between py-3 border-b border-zinc-800">
                                                <span className="text-zinc-400">Network</span>
                                                <span className="text-white font-medium">PIOGOLD Mainnet</span>
                                            </div>
                                            <div className="flex justify-between py-3 border-b border-zinc-800">
                                                <span className="text-zinc-400">Chain ID</span>
                                                <span className="text-white font-mono">42357</span>
                                            </div>
                                            <div className="flex justify-between py-3 border-b border-zinc-800">
                                                <span className="text-zinc-400">Symbol</span>
                                                <span className="text-gold font-bold">PIO</span>
                                            </div>
                                            <div className="flex justify-between py-3">
                                                <span className="text-zinc-400">Value Backing</span>
                                                <span className="text-white">1 gram Gold</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                            Why Choose <span className="gold-gradient-text">PIOGOLD</span>?
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            A unique combination of precious metal stability and blockchain innovation.
                        </p>
                    </motion.div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="glass-card border-zinc-800 hover:border-gold/30 transition-all duration-300 h-full group">
                                    <CardContent className="p-6">
                                        <div className="w-14 h-14 rounded-lg bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:bg-gold/20 transition-colors">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                        <p className="text-zinc-400 text-sm">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* PIO – Gold-Backed Native Coin Section */}
            <section className="py-20 bg-obsidian-light relative overflow-hidden">
                <div className="absolute inset-0 bg-gold-glow opacity-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2">
                                <Coins className="w-4 h-4 text-gold" />
                                <span className="text-gold text-sm font-medium">Gold-Backed Asset</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                                PIO – <span className="gold-gradient-text">Gold-Backed</span> Native Coin
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                PIO is the native cryptocurrency of the PIOGOLD Mainnet, uniquely designed to be backed by the value of physical gold. Each PIO token represents the equivalent value of 1 gram of gold, providing holders with a stable, tangible asset in the volatile world of cryptocurrency.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-white font-medium">Real Value</p>
                                        <p className="text-zinc-500 text-sm">Backed by gold prices</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-white font-medium">Stable Growth</p>
                                        <p className="text-zinc-500 text-sm">Less volatility</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 gold-gradient opacity-20 blur-3xl rounded-full" />
                            <Card className="glass-card border-gold/20">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                                            <CircleDollarSign className="w-8 h-8 text-gold" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-400 text-sm">Value Backing</p>
                                            <p className="text-2xl font-serif font-bold text-white">1 PIO = 1g Gold</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-zinc-800" />
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Network</span>
                                            <span className="text-white font-medium">PIOGOLD Mainnet</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Token Type</span>
                                            <span className="text-gold font-medium">Native Coin</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Payment</span>
                                            <span className="text-white font-medium">USDT (BEP20)</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* What Problem Does PIO Solve Section */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                            What Problem Does <span className="gold-gradient-text">PIO Solve?</span>
                        </h2>
                        <p className="text-zinc-400 max-w-3xl mx-auto text-lg">
                            In a market plagued by extreme volatility, PIO offers a solution that bridges the gap between traditional precious metals and modern blockchain technology.
                        </p>
                    </motion.div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card border-zinc-800 hover:border-gold/30 transition-all duration-300 h-full">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 rounded-lg bg-red-500/10 flex items-center justify-center mb-6">
                                        <TrendingUp className="w-7 h-7 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Market Volatility</h3>
                                    <p className="text-zinc-400">
                                        Cryptocurrencies are known for wild price swings. PIO's gold backing provides a stable foundation, protecting your investment from extreme market fluctuations.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card border-zinc-800 hover:border-gold/30 transition-all duration-300 h-full">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                                        <Globe className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Gold Accessibility</h3>
                                    <p className="text-zinc-400">
                                        Physical gold is difficult to store, transport, and divide. PIO makes gold investment accessible to anyone with an internet connection, with no minimum investment barriers.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="glass-card border-zinc-800 hover:border-gold/30 transition-all duration-300 h-full">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
                                        <Lock className="w-7 h-7 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Trust & Transparency</h3>
                                    <p className="text-zinc-400">
                                        All transactions on PIOGOLD Mainnet are verifiable and immutable. The blockchain ensures complete transparency in ownership and transfers.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* Why Is PIO Different Section */}
            <section className="py-20 bg-obsidian-light relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                            Why Is <span className="gold-gradient-text">PIO Different?</span>
                        </h2>
                        <p className="text-zinc-400 max-w-3xl mx-auto text-lg">
                            PIO stands apart from other cryptocurrencies and gold-backed tokens with its unique combination of features.
                        </p>
                    </motion.div>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="flex items-start space-x-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-gold/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Coins className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Native Coin Architecture</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Unlike ERC-20 tokens, PIO is a native coin on its own mainnet, providing faster transactions, lower fees, and enhanced security.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-gold/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Enterprise-Grade Security</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Built with AES-256 encryption and secure smart contract architecture, your assets are protected by industry-leading security standards.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-gold/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Instant Settlement</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Receive your PIO directly to your wallet after USDT payment verification. No waiting periods, no intermediaries.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="flex items-start space-x-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-gold/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Rewarding Community</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Our 3-level referral system rewards you for growing the PIOGOLD ecosystem. Earn up to 10% on your network's purchases.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-gold/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <CircleDollarSign className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Bonus Rewards</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Early investors enjoy up to 20% bonus PIO on their purchases. The more you invest, the greater your rewards.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-gold/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Global Accessibility</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Purchase PIO from anywhere in the world using your Web3 wallet. No bank accounts, no geographic restrictions.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* Discount Tiers Section */}
            {settings?.offers?.length > 0 && (
                <section className="py-20 bg-obsidian-light">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                                Bonus <span className="gold-gradient-text">Discount Tiers</span>
                            </h2>
                            <p className="text-zinc-400">
                                The more you invest, the more bonus PIO you receive.
                            </p>
                        </motion.div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {settings.offers.map((offer, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={`glass-card overflow-hidden ${idx === 0 ? 'border-gold/50 gold-glow' : 'border-zinc-800'}`}>
                                        {idx === 0 && (
                                            <div className="gold-gradient text-black text-center py-1 text-xs font-semibold">
                                                BEST VALUE
                                            </div>
                                        )}
                                        <CardContent className="p-6 text-center">
                                            <p className="text-zinc-400 text-sm mb-2">
                                                ${offer.min_usdt} - ${offer.max_usdt}
                                            </p>
                                            <p className="text-4xl font-serif font-bold text-gold mb-2">
                                                +{offer.discount_percent}%
                                            </p>
                                            <p className="text-zinc-500 text-sm">
                                                Bonus PIO
                                            </p>
                                            <p className="text-zinc-600 text-xs mt-4">
                                                Valid for {offer.validity_days} days
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            {/* Team Section */}
            {settings?.team?.length > 0 && (
                <section className="py-20 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                                Meet Our <span className="gold-gradient-text">Team</span>
                            </h2>
                            <p className="text-zinc-400">
                                The leadership behind PIOGOLD
                            </p>
                        </motion.div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {settings.team.map((member, idx) => (
                                <motion.div
                                    key={member.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="glass-card border-zinc-800 hover:border-gold/30 transition-all duration-300 overflow-hidden">
                                        <CardContent className="p-6 text-center">
                                            {member.photo_url ? (
                                                <img 
                                                    src={member.photo_url} 
                                                    alt={member.name}
                                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gold/30"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gold/20 flex items-center justify-center">
                                                    <Users className="w-10 h-10 text-gold" />
                                                </div>
                                            )}
                                            <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                                            <p className="text-gold text-sm">{member.role}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gold-glow opacity-20" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
                            Ready to Invest in Gold?
                        </h2>
                        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
                            Join the PIOGOLD ecosystem today. Connect your wallet, purchase PIO with USDT, 
                            and receive your gold-backed coins directly.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="gold-gradient text-black font-semibold text-lg h-14 px-12 btn-gold"
                            data-testid="cta-buy-btn"
                        >
                            <Link to="/buy">
                                Start Buying PIO <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
