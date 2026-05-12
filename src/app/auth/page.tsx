
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Key, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'LOGIN' | 'SIGNUP';

// 50 Random 12-character Invite Keys
const HARDCODED_INVITE_KEYS = [
  'X9A2B4C6D8E1', 'F2G4H6J8K1L3', 'M5N7P9Q2R4S6', 'T8U1V3W5X7Y9', 'Z2A4C6E8G1J3',
  'L5N7Q9S2U4W6', 'Y8A1C3E5G7J9', 'K2M4P6R8T1V3', 'X5Z7B9D2F4H6', 'J8L1N3P5R7T9',
  'V2X4Z6A8C1E3', 'G5I7K9M2O4Q6', 'S8U1W3Y5A7C9', 'E2G4I6K8M1O3', 'P5R7T9V2X4Z6',
  'B8D1F3H5J7L9', 'N2P4R6T8V1X3', 'Z5B7D9F2H4J6', 'L8N1P3R5T7V9', 'W2Y4A6C8E1G3',
  'I5K7M9O2Q4S6', 'U8W1Y3A5C7E9', 'A2C4E6G8I1K3', 'K5M7O9Q2S4U6', 'E8G1I3K5M7O9',
  'Q2S4U6W8Y1A3', 'C5E7G9I2K4M6', 'O8Q1S3U5W7Y9', 'G2I4K6M8O1Q3', 'S5U7W9Y2A4C6',
  'D8F1H3J5L7N9', 'P2R4T6V8X1Z3', 'B5D7F9H2J4L6', 'N8P1R3T5V7X9', 'Z2B4D6F8H1J3',
  'L5N7P9R2T4V6', 'X8Z1B3D5F7H9', 'J2L4N6P8R1T3', 'V5X7Z9B2D4F6', 'H8J1L3N5P7R9',
  'T2V4X6Z8B1D3', 'F5H7J9L2N4P6', 'R8T1V3X5Z7B9', 'D2F4H6J8L1N3', 'P5R7T9V2X4Z6',
  'A8C1E3G5I7K9', 'M2O4Q6S8U1W3', 'Y5A7C9E2G4I6', 'K8M1O3Q5S7U9', 'W2Y4A6C8E1G3'
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
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateUsername = (name: string) => {
    const regex = /^[a-z0-9]+$/;
    if (name.length < 3) return "Username must be at least 3 characters.";
    if (!regex.test(name)) return "Only lowercase letters and numbers are allowed.";
    
    // Rare 3-letter username rarity
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
      const isValidHardcoded = HARDCODED_INVITE_KEYS.includes(inviteKey);
      const keyRef = doc(db, 'invite_keys', inviteKey);
      const keySnap = await getDoc(keyRef);
      const isValidDB = keySnap.exists() && !keySnap.data().isUsed;

      if (!isValidHardcoded && !isValidDB) {
        toast({ variant: "destructive", title: "Invalid Key", description: "This 12-character invite key is invalid." });
        setLoading(false);
        return;
      }

      // 2. Check Duplicate Username (Strict)
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
      
      const role = username.toLowerCase() === 'dew' ? 'OWNER' : 'MEMBER';

      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: username,
        usernameLowercase: username.toLowerCase(),
        balance: 100,
        role: role,
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

      if (isValidDB) {
        await setDoc(keyRef, { isUsed: true, usedBy: username, usedAt: serverTimestamp() }, { merge: true });
      }

      toast({ title: "Account Created!", description: "Welcome to KoroneBet!" });
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
            {step === 'LOGIN' ? 'Login' : 'Signup'}
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
                  <Input name="inviteKey" placeholder="12-Character Invite Key" value={formData.inviteKey} onChange={handleInputChange} className="bg-accent/5 border-accent/20 h-14 pl-12 rounded-2xl text-accent font-bold" />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="username" placeholder="Username (lowercase/numbers)" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Password (Min 8 chars)" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
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
            {step === 'LOGIN' ? "Need to signup? Click here" : "Already have an account? Login"}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
