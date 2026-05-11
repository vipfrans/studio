
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'LOGIN' | 'SIGNUP' | 'VERIFY';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    verificationCode: ''
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupInit = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all fields." });
      return;
    }
    
    setLoading(true);
    try {
      // Check if username taken
      const q = query(collection(db, 'users'), where('username', '==', formData.username.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast({ variant: "destructive", title: "Username Taken", description: "This username is already registered." });
        setLoading(false);
        return;
      }

      // Generate a mock 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // Store in firestore temporarily
      await setDoc(doc(db, 'verification_codes', formData.email.toLowerCase()), {
        email: formData.email,
        code: code,
        createdAt: serverTimestamp()
      });

      // Simulate sending email
      console.log(`Verification code for ${formData.email}: ${code}`);
      toast({ 
        title: "Code Sent!", 
        description: `We've "sent" a 6-digit code to ${formData.email}. Check your console/toast for testing.` 
      });
      
      setStep('VERIFY');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (formData.verificationCode !== generatedCode) {
      toast({ variant: "destructive", title: "Invalid Code", description: "The code you entered is incorrect." });
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const isOwner = formData.username.toLowerCase() === 'dew';
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: formData.username.trim(),
        email: formData.email.toLowerCase(),
        balance: 0,
        role: isOwner ? 'ADMIN' : 'MEMBER',
        isVerified: isOwner,
        uid: userCred.user.uid,
        createdAt: new Date().toISOString()
      });

      await deleteDoc(doc(db, 'verification_codes', formData.email.toLowerCase()));
      
      toast({ title: "Account Verified!", description: "Welcome to KoroneBet!" });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Username and password required." });
      return;
    }

    setLoading(true);
    try {
      // Find email by username
      const q = query(collection(db, 'users'), where('username', '==', formData.username.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "User Not Found", description: "No user with this username exists." });
        setLoading(false);
        return;
      }

      const userEmail = snap.docs[0].data().email;
      await signInWithEmailAndPassword(auth, userEmail, formData.password);
      
      toast({ title: "Welcome back!", description: `Logged in as ${formData.username}` });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid username or password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-purple p-8 rounded-[40px] w-full max-w-md border-2 border-primary/20 space-y-8 shadow-[0_0_80px_rgba(200,153,255,0.15)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/20 rounded-[28px] flex items-center justify-center border-2 border-primary/40 mx-auto mb-4 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
            <span className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(200,153,255,0.8)]">K</span>
          </div>
          <h1 className="font-headline text-4xl font-black headline-gradient tracking-tight">
            {step === 'LOGIN' ? 'WELCOME BACK' : step === 'SIGNUP' ? 'JOIN THE ARENA' : 'VERIFY IDENTITY'}
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-bold opacity-60">
            {step === 'LOGIN' ? 'Log in with your username' : step === 'SIGNUP' ? 'Start your journey today' : `Sent to ${formData.email}`}
          </p>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {step === 'LOGIN' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <Input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl focus-visible:ring-primary focus-visible:bg-black/40 transition-all" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl focus-visible:ring-primary focus-visible:bg-black/40 transition-all" />
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_10px_20px_rgba(200,153,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : 'LOGIN TO LOBBY'}
                </Button>
              </motion.div>
            )}

            {step === 'SIGNUP' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="username" placeholder="Choose Username" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Password (min. 6 chars)" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <Button onClick={handleSignupInit} disabled={loading} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_10px_20px_rgba(200,153,255,0.2)]">
                  {loading ? <Loader2 className="animate-spin" /> : 'SEND VERIFICATION CODE'}
                </Button>
              </motion.div>
            )}

            {step === 'VERIFY' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center">
                  <p className="text-sm font-bold text-primary mb-1">Check your inbox!</p>
                  <p className="text-[10px] text-muted-foreground">We've sent a 6-digit code. (Prototype: {generatedCode})</p>
                </div>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="verificationCode" placeholder="Enter 6-digit code" value={formData.verificationCode} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl text-center text-xl font-black tracking-[0.5em]" maxLength={6} />
                </div>
                <Button onClick={handleVerifyAndCreate} disabled={loading} className="w-full h-16 text-lg font-black bg-success hover:bg-success/90 text-background rounded-2xl">
                  {loading ? <Loader2 className="animate-spin" /> : 'ACTIVATE ACCOUNT'}
                </Button>
                <button onClick={() => setStep('SIGNUP')} className="w-full text-xs font-bold text-muted-foreground uppercase hover:text-primary transition-colors">Wrong email? Go back</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 'VERIFY' && (
          <div className="text-center pt-4">
            <button 
              onClick={() => setStep(step === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
              className="text-xs font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2 mx-auto group"
            >
              {step === 'LOGIN' ? "Need an account? Sign up" : "Already registered? Login"}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 'SIGNUP' && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Your safety is our priority. By registering, you confirm that you are of legal age and agree to our terms of service.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
