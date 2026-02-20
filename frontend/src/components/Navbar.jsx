import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useWallet } from '../contexts/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { address, isConnected, connectWallet, disconnectWallet, isBSC } = useWallet();
    
    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Buy PIO', href: '/buy' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Referrals', href: '/referrals' },
    ];
    
    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };
    
    const isActive = (href) => {
        return location.pathname === href;
    };
    
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
                        <img src="/logo.png" alt="PIOGOLD" className="w-10 h-10 object-contain" />
                        <span className="text-xl font-bold font-serif gold-gradient-text hidden sm:block">
                            PIOGOLD
                        </span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive(item.href)
                                        ? 'text-gold bg-gold/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Wallet Button */}
                    <div className="flex items-center space-x-3">
                        {isConnected ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-gold/50 text-gold hover:bg-gold/10 flex items-center space-x-2"
                                        data-testid="wallet-dropdown"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${isBSC ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <span className="font-mono text-sm">{formatAddress(address)}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-obsidian-light border-zinc-800">
                                    <DropdownMenuItem className="text-zinc-400 text-xs">
                                        {isBSC ? 'Connected to BSC' : 'Wrong Network'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="flex items-center cursor-pointer">
                                            <Wallet className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/referrals" className="flex items-center cursor-pointer">
                                            <Wallet className="w-4 h-4 mr-2" />
                                            Referrals
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                    <DropdownMenuItem
                                        onClick={disconnectWallet}
                                        className="text-red-400 focus:text-red-400 cursor-pointer"
                                        data-testid="disconnect-btn"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Disconnect
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={connectWallet}
                                className="gold-gradient text-black font-semibold hover:opacity-90 btn-gold"
                                data-testid="connect-wallet-btn"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                            </Button>
                        )}
                        
                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-zinc-400 hover:text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            data-testid="mobile-menu-btn"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/5 bg-obsidian"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                                        isActive(item.href)
                                            ? 'text-gold bg-gold/10'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
