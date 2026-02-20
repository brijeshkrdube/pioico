import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Clock } from 'lucide-react';
import PurchaseCard from '../components/PurchaseCard';
import { motion } from 'framer-motion';

const Buy = () => {
    const steps = [
        {
            icon: <Zap className="w-5 h-5" />,
            title: 'Connect Wallet',
            description: 'Use MetaMask, Trust Wallet, or any WalletConnect wallet'
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: 'Enter Amount',
            description: 'Input USDT amount (min. $50). See your PIO calculation.'
        },
        {
            icon: <Clock className="w-5 h-5" />,
            title: 'Receive PIO',
            description: 'Confirm transaction. PIO arrives in your wallet automatically.'
        }
    ];
    
    return (
        <div className="min-h-screen bg-obsidian pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center text-zinc-400 hover:text-gold transition-colors mb-8"
                    data-testid="back-link"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left - Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                                Buy <span className="gold-gradient-text">PIOGOLD</span>
                            </h1>
                            <p className="text-zinc-400">
                                Purchase PIO using USDT (BEP20) on Binance Smart Chain. 
                                Your PIO coins will be sent directly to your connected wallet on PIOGOLD Mainnet.
                            </p>
                        </div>
                        
                        {/* How It Works */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">How It Works</h3>
                            <div className="space-y-4">
                                {steps.map((step, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start space-x-4 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{step.title}</h4>
                                            <p className="text-zinc-400 text-sm">{step.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Network Info */}
                        <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
                            <h3 className="text-lg font-semibold text-white mb-4">Network Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Payment Network</span>
                                    <span className="text-white">BSC (Binance Smart Chain)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Payment Token</span>
                                    <span className="text-white">USDT (BEP20)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Receive Network</span>
                                    <span className="text-gold">PIOGOLD Mainnet</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Receive Token</span>
                                    <span className="text-gold">PIO (Native Coin)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Min. Purchase</span>
                                    <span className="text-white">$50 USDT</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <p className="text-yellow-500 text-sm">
                                <strong>Important:</strong> PIO is a gold-pegged cryptocurrency where 1 PIO = 1 gram of gold value. 
                                Cryptocurrency investments carry risks. Only invest what you can afford to lose.
                            </p>
                        </div>
                    </motion.div>
                    
                    {/* Right - Purchase Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <PurchaseCard />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Buy;
