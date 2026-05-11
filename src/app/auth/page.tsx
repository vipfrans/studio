
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Key, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'LOGIN' | 'SIGNUP';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    inviteKey: ''
  });

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please enter both username and password." });
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('usernameLowercase', '==', formData.username.trim().toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "Error", description: "User not found." });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();
      await signInWithEmailAndPassword(auth, userData.internalEmail, formData.password);
      
      toast({ title: "Welcome Back", description: `Legend ${userData.username} has entered the lobby!` });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const username = formData.username.trim();
    if (!username || !formData.password.trim() || !formData.inviteKey.trim()) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Please fill all required fields." });
      return;
    }

    if (username.length < 4) {
      toast({ variant: "destructive", title: "Username Taken", description: "This username is already occupied or restricted. Try a longer name." });
      return;
    }

    setLoading(true);
    try {
      const keyRef = doc(db, 'invite_keys', formData.inviteKey.trim());
      const keySnap = await getDoc(keyRef);

      const hardcodedKeys = ['KORONE-7777', 'KORONE-8888'];
      if (!keySnap.exists() && !hardcodedKeys.includes(formData.inviteKey.trim())) {
        toast({ variant: "destructive", title: "Invalid Key", description: "This invite key does not exist." });
        setLoading(false);
        return;
      }
      
      if (keySnap.exists() && keySnap.data().isUsed) {
        toast({ variant: "destructive", title: "Key Used", description: "This key has already been consumed by another user." });
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'users'), where('usernameLowercase', '==', username.toLowerCase()));
      const userSnap = await getDocs(q);
      
      if (!userSnap.empty) {
        toast({ variant: "destructive", title: "Username Taken", description: "This username is already taken. Choose another one." });
        setLoading(false);
        return;
      }

      const internalEmail = `${username.toLowerCase()}_${Date.now()}@koronebet.local`;
      const userCred = await createUserWithEmailAndPassword(auth, internalEmail, formData.password);
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: username,
        usernameLowercase: username.toLowerCase(),
        balance: 100,
        role: username.toLowerCase() === 'dew' ? 'OWNER' : 'MEMBER',
        isVerified: true,
        uid: userCred.user.uid,
        internalEmail: internalEmail,
        avatarUrl: `https://picsum.photos/seed/${username}/100/100`,
        hasChangedUsername: false,
        stats: {
          totalGames: 0,
          totalWagered: 0,
          totalDeposited: 100,
          totalWithdrawal: 0
        },
        gamesHistory: [],
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'invite_keys', formData.inviteKey.trim()), {
        key: formData.inviteKey.trim(),
        isUsed: true,
        usedBy: username,
        usedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Account Created!", description: "Welcome to KoroneBet! Your journey begins now." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Signup Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-purple p-8 rounded-[40px] w-full max-w-md border-2 border-primary/20 space-y-8 shadow-2xl relative"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/40 mx-auto mb-4">
            <span className="text-3xl font-black text-primary">K</span>
          </div>
          <h1 className="font-headline text-3xl font-black headline-gradient uppercase">
            {step === 'LOGIN' ? 'Login' : 'Create Account'}
          </h1>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {step === 'LOGIN' ? (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black shadow-[0_0_20px_rgba(200,153,255,0.3)]">
                  {loading ? <Loader2 className="animate-spin" /> : 'ENTER LOBBY'}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <Input name="inviteKey" placeholder="Invite Key (KORONE-XXXX)" value={formData.inviteKey} onChange={handleInputChange} className="bg-accent/5 border-accent/20 h-14 pl-12 rounded-2xl text-accent font-bold" />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="username" placeholder="Choose Username" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Create Password" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <Button onClick={handleSignup} disabled={loading} className="w-full h-16 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-black shadow-[0_0_20px_rgba(255,153,230,0.3)]">
                  {loading ? <Loader2 className="animate-spin" /> : 'CREATE ACCOUNT'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center pt-4">
          <button onClick={() => setStep(step === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-xs font-black text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto uppercase">
            {step === 'LOGIN' ? "Don't have a key? Sign up" : "Already have an account? Login"}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
