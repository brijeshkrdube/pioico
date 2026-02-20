import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-zinc-800 bg-obsidian">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                                <span className="text-black font-bold text-lg font-serif">P</span>
                            </div>
                            <span className="text-xl font-bold font-serif gold-gradient-text">PIOGOLD</span>
                        </div>
                        <p className="text-zinc-500 text-sm max-w-md mb-4">
                            PIOGOLD (PIO) is a gold-backed cryptocurrency on the PIOGOLD Mainnet. 
                            Each PIO represents 1 gram of gold value, providing stability and transparency.
                        </p>
                        <div className="flex items-center space-x-4">
                            <a
                                href="https://pioscan.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-gold transition-colors flex items-center text-sm"
                            >
                                Explorer <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>
                    
                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/buy" className="text-zinc-400 hover:text-gold text-sm transition-colors">
                                    Buy PIO
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-zinc-400 hover:text-gold text-sm transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/referrals" className="text-zinc-400 hover:text-gold text-sm transition-colors">
                                    Referrals
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/terms" className="text-zinc-400 hover:text-gold text-sm transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-zinc-400 hover:text-gold text-sm transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="text-zinc-400 hover:text-gold text-sm transition-colors">
                                    Risk Disclaimer
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Disclaimer */}
                <div className="mt-8 pt-8 border-t border-zinc-800">
                    <p className="text-zinc-600 text-xs leading-relaxed">
                        <strong className="text-zinc-500">Disclaimer:</strong> PIO is a gold-pegged cryptocurrency where each coin represents 1 gram of gold value. 
                        Gold prices may fluctuate based on market conditions. This ICO does not guarantee returns. 
                        Cryptocurrency investments carry inherent risks. Please conduct your own research before investing.
                    </p>
                </div>
                
                {/* Copyright */}
                <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-zinc-500 text-sm">
                        &copy; {new Date().getFullYear()} PIOGOLD. All rights reserved.
                    </p>
                    <p className="text-zinc-600 text-xs mt-2 sm:mt-0">
                        Chain ID: 42357 | Native Coin: PIO
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
