'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { setCredentials } from '@/lib/redux/features/authSlice';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            const user = {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.full_name,
                enabled_modules: (data.user.enabled_modules || ['hr', 'pm', 'crm']) as any,
            };

            dispatch(setCredentials({
                user,
                token: data.token || ''
            }));
            toast.success('Welcome back!');
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your credentials to access your account and resume your mission."
        >
            <form onSubmit={handleSubmit}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="email" className="text-white/60 text-sm ml-1">Email Address</Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 pl-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all duration-300 placeholder:text-white/20"
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <Label htmlFor="password" className="text-white/60 text-sm">Password</Label>
                            <Link href="#" className="text-xs text-primary/80 hover:text-primary transition-colors">Forgot password?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 pl-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all duration-300 placeholder:text-white/20"
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-bold shadow-xl shadow-white/5 transition-all active:scale-95 text-base group"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-6 border-t border-white/5">
                        <p className="text-center text-sm text-white/40">
                            New here?{' '}
                            <Link href="/auth/register" className="text-white font-semibold hover:text-primary transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </form>
        </AuthLayout>
    );
}
