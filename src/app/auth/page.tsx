
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

// 50 Hardcoded Invite Keys for the system
const HARDCODED_INVITE_KEYS = [
  'KORONE-1111', 'KORONE-2222', 'KORONE-3333', 'KORONE-4444', 'KORONE-5555',
  'KORONE-6666', 'KORONE-7777', 'KORONE-8888', 'KORONE-9999', 'KORONE-1010',
  'KORONE-2020', 'KORONE-3030', 'KORONE-4040', 'KORONE-5050', 'KORONE-6060',
  'KORONE-7070', 'KORONE-8080', 'KORONE-9090', 'KORONE-A1A1', 'KORONE-B2B2',
  'KORONE-C3C3', 'KORONE-D4D4', 'KORONE-E5E5', 'KORONE-F6F6', 'KORONE-G7G7',
  'KORONE-H8H8', 'KORONE-I9I9', 'KORONE-J1J1', 'KORONE-K2K2', 'KORONE-L3L3',
  'KORONE-M4M4', 'KORONE-N5N5', 'KORONE-O6O6', 'KORONE-P7P7', 'KORONE-Q8Q8',
  'KORONE-R9R9', 'KORONE-S1S1', 'KORONE-T2T2', 'KORONE-U3U3', 'KORONE-V4V4',
  'KORONE-W5W5', 'KORONE-X6X6', 'KORONE-Y7Y7', 'KORONE-Z8Z8', 'KORONE-VIP1',
  'KORONE-VIP2', 'KORONE-VIP3', 'KORONE-CEO1', 'KORONE-OWNR', 'KORONE-DEW1'
];

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

  const validateUsername = (name: string) => {
    // Only lowercase letters and numbers, no special characters
    const regex = /^[a-z0-9]+$/;
    if (name.length < 3) return "Username must be at least 3 characters.";
    if (!regex.test(name)) return "Only lowercase letters and numbers are allowed.";
    
    // 80% chance that a 3-character username is "taken"
    if (name.length === 3) {
      const isTaken = Math.random() < 0.8;
      if (isTaken) return "This rare 3-letter username is already taken.";
    }
    
    return null;
  };

  const handleLogin = async () => {
    const usernameTrimmed = formData.username.trim();
    if (!usernameTrimmed || !formData.password) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please enter both username and password." });
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('usernameLowercase', '==', usernameTrimmed.toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "User Not Found", description: "No account exists with this username." });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();
      await signInWithEmailAndPassword(auth, userData.internalEmail, formData.password);
      
      toast({ title: "Welcome Back", description: `Legend ${userData.username} has entered the lobby!` });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const username = formData.username.trim();
    const password = formData.password.trim();
    const inviteKey = formData.inviteKey.trim().toUpperCase();

    if (!username || !password || !inviteKey) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "All fields are required to proceed." });
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      toast({ variant: "destructive", title: "Validation Error", description: usernameError });
      return;
    }

    if (password.length < 8) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    try {
      // 1. Check Invite Key
      const keyRef = doc(db, 'invite_keys', inviteKey);
      const keySnap = await getDoc(keyRef);

      const isValidHardcoded = HARDCODED_INVITE_KEYS.includes(inviteKey);
      const isValidDB = keySnap.exists() && !keySnap.data().isUsed;

      if (!isValidHardcoded && !isValidDB) {
        toast({ variant: "destructive", title: "Invalid Key", description: "This invite key is invalid or already used." });
        setLoading(false);
        return;
      }

      // 2. Check Duplicate Username in DB
      const q = query(collection(db, 'users'), where('usernameLowercase', '==', username.toLowerCase()));
      const userSnap = await getDocs(q);
      
      if (!userSnap.empty) {
        toast({ variant: "destructive", title: "Username Taken", description: "This username is already registered." });
        setLoading(false);
        return;
      }

      // 3. Create Account
      const internalEmail = `${username.toLowerCase()}_${Date.now()}@koronebet.local`;
      const userCred = await createUserWithEmailAndPassword(auth, internalEmail, password);
      
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

      // 4. Mark Key as Used (if it exists in DB)
      if (isValidDB) {
        await setDoc(doc(db, 'invite_keys', inviteKey), {
          key: inviteKey,
          isUsed: true,
          usedBy: username,
          usedAt: serverTimestamp()
        }, { merge: true });
      }

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
                  <Input name="username" placeholder="Lowercase letters and numbers only" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Password (Min 8 characters)" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
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
