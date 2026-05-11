
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!username || !password) return;
    setLoading(true);
    
    // تحويل اليوزر لنظام إيميل ليعمل مع Firebase
    const email = `${username.toLowerCase()}@koronebet.xyz`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: `Logged in as ${username}` });
        router.push('/');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          username: username,
          balance: 0,
          role: username.toLowerCase() === 'dew' ? 'ADMIN' : 'MEMBER',
          isVerified: username.toLowerCase() === 'dew',
          uid: userCred.user.uid
        });
        toast({ title: "Account created!", description: "Welcome to KoroneBet!" });
        router.push('/');
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Auth Error", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-purple p-8 rounded-[32px] w-full max-w-md border-2 border-primary/20 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/40 mx-auto mb-4">
            <span className="text-3xl font-black text-primary">K</span>
          </div>
          <h1 className="font-headline text-3xl font-black headline-gradient">
            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
            {isLogin ? 'Enter your details to play' : 'Join the elite community'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
            <Input 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl focus-visible:ring-primary"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
            <Input 
              type="password"
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl focus-visible:ring-primary"
            />
          </div>
        </div>

        <Button 
          onClick={handleAuth}
          disabled={loading}
          className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_0_20px_rgba(200,153,255,0.3)]"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <div className="flex items-center gap-2">
              {isLogin ? 'LOGIN' : 'REGISTER'}
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
