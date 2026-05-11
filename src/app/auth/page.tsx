
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please enter both username and password."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setLoading(true);
    
    // Create a virtual email for Firebase Auth
    const email = `${username.toLowerCase().trim().replace(/\s+/g, '')}@koronebet.xyz`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: `Logged in as ${username}` });
        router.push('/');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Initial balance is 0 and role is MEMBER unless the user is 'Dew'
        const isOwner = username.toLowerCase() === 'dew';
        
        await setDoc(doc(db, 'users', userCred.user.uid), {
          username: username,
          balance: 0,
          role: isOwner ? 'ADMIN' : 'MEMBER',
          isVerified: isOwner,
          uid: userCred.user.uid,
          createdAt: new Date().toISOString()
        });
        
        toast({ title: "Account created!", description: "Welcome to KoroneBet! You started with 0 Robux." });
        router.push('/');
      }
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      let errorMessage = "An unexpected error occurred.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Username is already taken. Try logging in.";
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = "Invalid username or password.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Login method not enabled. Please enable Email/Password in Firebase Console.";
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = "Firebase API Key is missing or invalid. Please connect your Firebase project.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: errorMessage 
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
        className="glass-purple p-8 rounded-[32px] w-full max-w-md border-2 border-primary/20 space-y-6 shadow-[0_0_50px_rgba(200,153,255,0.1)]"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/40 mx-auto mb-4">
            <span className="text-3xl font-black text-primary">K</span>
          </div>
          <h1 className="font-headline text-3xl font-black headline-gradient">
            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
            {isLogin ? 'Enter your details to play' : 'Join the community'}
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
          className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_0_20px_rgba(200,153,255,0.3)] transition-all hover:scale-[1.02]"
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

        {!isLogin && (
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              New players start with 0 Robux. By registering, you agree to our terms.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
