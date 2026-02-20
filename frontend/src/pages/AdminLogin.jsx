import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAdmin } from '../contexts/AdminContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, setup, loading, error } = useAdmin();
    
    const [isSetup, setIsSetup] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let success;
        if (isSetup) {
            success = await setup(formData.username, formData.password, formData.email);
        } else {
            success = await login(formData.username, formData.password);
        }
        
        if (success) {
            toast.success(isSetup ? 'Admin created successfully!' : 'Login successful!');
            navigate('/admin/dashboard');
        } else {
            toast.error(error || 'Authentication failed');
        }
    };
    
    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="glass-card border-zinc-800">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full gold-gradient flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-black" />
                        </div>
                        <CardTitle className="font-serif text-2xl text-white">
                            Admin {isSetup ? 'Setup' : 'Login'}
                        </CardTitle>
                        <p className="text-zinc-400 text-sm mt-2">
                            {isSetup ? 'Create your admin account' : 'Access the admin dashboard'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-zinc-400">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-gold"
                                    required
                                    data-testid="admin-username"
                                />
                            </div>
                            
                            {isSetup && (
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-400">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-zinc-900/50 border-zinc-800 focus:border-gold"
                                        required
                                        data-testid="admin-email"
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-400">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-gold"
                                    required
                                    data-testid="admin-password"
                                />
                            </div>
                            
                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}
                            
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full gold-gradient text-black font-semibold"
                                data-testid="admin-submit"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    isSetup ? 'Create Admin' : 'Login'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
