
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useRobux } from '@/context/RobuxContext';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const { userProfile, lang } = useRobux();
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdate = async () => {
    if (!auth.currentUser || !userProfile) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "All fields are required." });
      return;
    }

    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "New password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(userProfile.internalEmail, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 2. Update Password
      await updatePassword(auth.currentUser, newPassword);

      toast({
        title: "Success!",
        description: "Your password has been updated safely.",
      });
      router.push('/profile');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Current password is incorrect.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto px-4 py-12 pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <Link href="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${lang === 'AR' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
        <span className="font-bold">{lang === 'EN' ? 'Back to Profile' : 'الرجوع للملف الشخصي'}</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-purple p-8 rounded-[32px] border-2 border-primary/20 space-y-8 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-2xl font-black headline-gradient uppercase">
            {lang === 'EN' ? 'Change Password' : 'تغيير كلمة السر'}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Secure your account</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Current Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary uppercase ml-1">New Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-black/20 border-primary/10 h-12 rounded-xl focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary uppercase ml-1">Confirm New Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black/20 border-primary/10 h-12 rounded-xl focus:border-primary/50"
            />
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-[0_0_20px_rgba(200,153,255,0.3)] mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (lang === 'EN' ? 'UPDATE PASSWORD' : 'تحديث كلمة السر')}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-muted-foreground uppercase pt-2">
          <ShieldCheck className="w-3 h-3 text-success" />
          <span>End-to-end encrypted update</span>
        </div>
      </motion.div>
    </div>
  );
}
