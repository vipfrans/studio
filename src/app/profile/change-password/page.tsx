
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
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

    // 1. Basic Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields." });
      return;
    }

    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "New passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      // 2. Re-authenticate user to verify current password
      const credential = EmailAuthProvider.credential(userProfile.internalEmail, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 3. Update to new password
      await updatePassword(auth.currentUser, newPassword);

      // 4. Success feedback
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span>Successfully Password Changed</span>
          </div>
        ) as any,
        description: "Your account is now more secure.",
      });

      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (error: any) {
      console.error(error);
      let errorMsg = "Failed to update password. Check your current password.";
      if (error.code === 'auth/wrong-password') errorMsg = "The current password you entered is incorrect.";
      
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Authentication Failed</span>
          </div>
        ) as any,
        description: errorMsg,
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
        className="glass-purple p-8 rounded-[32px] border-2 border-primary/20 space-y-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-2xl font-black headline-gradient uppercase">
            {lang === 'EN' ? 'Secure Account' : 'تأمين الحساب'}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Update your access key</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Current Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-primary/50 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary uppercase ml-1">New Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-black/20 border-primary/10 h-12 rounded-xl focus:border-primary/50 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary uppercase ml-1">Confirm New Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black/20 border-primary/10 h-12 rounded-xl focus:border-primary/50 text-white"
            />
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-[0_0_20px_rgba(200,153,255,0.3)] mt-4 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (lang === 'EN' ? 'CHANGE PASSWORD' : 'تغيير كلمة السر')}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase pt-2 opacity-50">
          <ShieldCheck className="w-3 h-3 text-success" />
          <span>Encrypted Security Update</span>
        </div>
      </motion.div>
    </div>
  );
}
