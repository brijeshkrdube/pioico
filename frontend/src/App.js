import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Config
import { config } from './config/wagmi';

// Contexts
import { WalletProvider } from './contexts/WalletContext';
import { AdminProvider } from './contexts/AdminContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Buy from './pages/Buy';
import Dashboard from './pages/Dashboard';
import Referrals from './pages/Referrals';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Styles
import './App.css';

const queryClient = new QueryClient();

// Layout wrapper for public pages
const PublicLayout = ({ children }) => (
    <>
        <Navbar />
        <main className="pt-0">
            {children}
        </main>
        <Footer />
    </>
);

// Layout wrapper for admin pages (no navbar/footer)
const AdminLayout = ({ children }) => (
    <main>{children}</main>
);

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <AdminProvider>
                    <WalletProvider>
                        <BrowserRouter>
                            <div className="App min-h-screen bg-obsidian noise-overlay">
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                                    <Route path="/buy" element={<PublicLayout><Buy /></PublicLayout>} />
                                    <Route path="/dashboard" element={<PublicLayout><Dashboard /></PublicLayout>} />
                                    <Route path="/referrals" element={<PublicLayout><Referrals /></PublicLayout>} />
                                    
                                    {/* Admin Routes */}
                                    <Route path="/admin" element={<AdminLayout><AdminLogin /></AdminLayout>} />
                                    <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                                    
                                    {/* Legal Pages (placeholder) */}
                                    <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
                                    <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
                                    <Route path="/disclaimer" element={<PublicLayout><DisclaimerPage /></PublicLayout>} />
                                </Routes>
                                
                                {/* Toast Notifications */}
                                <Toaster 
                                    position="top-right" 
                                    toastOptions={{
                                        style: {
                                            background: '#0a0a0a',
                                            border: '1px solid #27272a',
                                            color: '#fafafa',
                                        },
                                    }}
                                />
                            </div>
                        </BrowserRouter>
                    </WalletProvider>
                </AdminProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Simple Legal Pages
const TermsPage = () => (
    <div className="min-h-screen bg-obsidian pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-8">Terms of Service</h1>
            <div className="prose prose-invert prose-zinc max-w-none">
                <div className="glass-card border-zinc-800 p-8 space-y-6 text-zinc-300">
                    <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                    <p>By accessing and using the PIOGOLD ICO Platform, you accept and agree to be bound by these Terms of Service.</p>
                    
                    <h2 className="text-xl font-semibold text-white">2. ICO Participation</h2>
                    <p>Participation in the PIOGOLD ICO is subject to availability and applicable laws. Users must ensure compliance with their local regulations regarding cryptocurrency investments.</p>
                    
                    <h2 className="text-xl font-semibold text-white">3. Risk Acknowledgment</h2>
                    <p>Cryptocurrency investments carry inherent risks. The value of PIO may fluctuate based on market conditions. Past performance does not guarantee future results.</p>
                    
                    <h2 className="text-xl font-semibold text-white">4. No Guaranteed Returns</h2>
                    <p>PIOGOLD does not guarantee any returns on investment. Users should only invest what they can afford to lose.</p>
                    
                    <h2 className="text-xl font-semibold text-white">5. Gold-Backed Value</h2>
                    <p>While PIO is pegged to gold value, the actual price is admin-controlled and may not reflect real-time gold market prices.</p>
                </div>
            </div>
        </div>
    </div>
);

const PrivacyPage = () => (
    <div className="min-h-screen bg-obsidian pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-8">Privacy Policy</h1>
            <div className="glass-card border-zinc-800 p-8 space-y-6 text-zinc-300">
                <h2 className="text-xl font-semibold text-white">Data Collection</h2>
                <p>We collect wallet addresses and transaction data necessary for ICO operations. No personal identification information is required.</p>
                
                <h2 className="text-xl font-semibold text-white">Data Usage</h2>
                <p>Collected data is used solely for processing transactions, calculating referral rewards, and platform operations.</p>
                
                <h2 className="text-xl font-semibold text-white">Blockchain Data</h2>
                <p>All transactions are recorded on public blockchains (BSC and PIOGOLD) and are permanently visible.</p>
                
                <h2 className="text-xl font-semibold text-white">Security</h2>
                <p>We implement industry-standard security measures including AES-256 encryption for sensitive data.</p>
            </div>
        </div>
    </div>
);

const DisclaimerPage = () => (
    <div className="min-h-screen bg-obsidian pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-8">Risk Disclaimer</h1>
            <div className="glass-card border-zinc-800 p-8 space-y-6 text-zinc-300">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-red-400 mb-4">Important Warning</h2>
                    <p className="text-red-300">Cryptocurrency investments are highly speculative and involve substantial risk. You may lose all of your invested capital.</p>
                </div>
                
                <h2 className="text-xl font-semibold text-white">Price Volatility</h2>
                <p>While PIO is pegged to gold value, cryptocurrency markets are volatile. Gold prices also fluctuate based on global market conditions.</p>
                
                <h2 className="text-xl font-semibold text-white">Admin-Controlled Pricing</h2>
                <p>PIO price is manually set by platform administrators and may not reflect real-time gold market prices at all times.</p>
                
                <h2 className="text-xl font-semibold text-white">No Investment Advice</h2>
                <p>Information on this platform does not constitute financial advice. Consult with qualified professionals before investing.</p>
                
                <h2 className="text-xl font-semibold text-white">Regulatory Compliance</h2>
                <p>Users are responsible for ensuring compliance with their local laws and regulations regarding cryptocurrency investments.</p>
                
                <h2 className="text-xl font-semibold text-white">Technical Risks</h2>
                <p>Blockchain technology involves technical risks including smart contract vulnerabilities, network congestion, and potential loss of funds due to user error.</p>
            </div>
        </div>
    </div>
);

export default App;
