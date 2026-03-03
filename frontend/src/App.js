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
import LegalPage from './pages/LegalPage';

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
                                    
                                    {/* Dynamic Legal Pages */}
                                    <Route path="/legal/:slug" element={<PublicLayout><LegalPage /></PublicLayout>} />
                                    
                                    {/* Legacy Legal Routes - redirect to dynamic */}
                                    <Route path="/terms" element={<PublicLayout><LegalPage /></PublicLayout>} />
                                    <Route path="/privacy" element={<PublicLayout><LegalPage /></PublicLayout>} />
                                    <Route path="/disclaimer" element={<PublicLayout><LegalPage /></PublicLayout>} />
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

export default App;
