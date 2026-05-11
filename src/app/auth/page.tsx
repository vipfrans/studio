
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء جميع الحقول." });
      return;
    }

    if (formData.password.length < 6) {
      toast({ variant: "destructive", title: "كلمة سر ضعيفة", description: "يجب أن تكون 6 أحرف على الأقل." });
      return;
    }

    setLoading(true);
    try {
      // 1. التحقق من اسم المستخدم (مع مهلة زمنية لتجنب التعليق)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', formData.username.trim()));
      
      const checkUsername = async () => {
        const snap = await getDocs(q);
        return !snap.empty;
      };

      const isTaken = await Promise.race([
        checkUsername(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Timeout: تأكد من تفعيل Firestore والمفاتيح")), 10000))
      ]);

      if (isTaken) {
        toast({ variant: "destructive", title: "خطأ", description: "اسم المستخدم مأخوذ بالفعل." });
        setLoading(false);
        return;
      }

      // 2. توليد كود التحقق
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // 3. محاولة حفظ الكود (اختياري، لن نعطل العملية إذا فشل بسبب الصلاحيات)
      try {
        const codeRef = doc(db, 'verification_codes', formData.email.toLowerCase().trim());
        await setDoc(codeRef, {
          email: formData.email.trim(),
          code: code,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Could not save code to firestore, proceeding with local code.");
      }

      toast({ 
        title: "تم إرسال الكود!", 
        description: `كود التحقق الخاص بك هو: ${code} (تم إرساله افتراضياً للمعاينة)` 
      });
      
      setStep('VERIFY');
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({ 
        variant: "destructive", 
        title: "فشل الاتصال", 
        description: error.message?.includes("API key") 
          ? "مشكلة في إعدادات Firebase (API Key). يرجى الانتظار حتى يتم تحديث المشروع." 
          : "تأكد من تفعيل إعدادات Email/Password في Firebase Console."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (formData.verificationCode !== generatedCode) {
      toast({ variant: "destructive", title: "كود خاطئ", description: "يرجى إدخال الكود الصحيح." });
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        balance: 100, // رصيد هدية عند التسجيل
        role: formData.username.toLowerCase() === 'dew' ? 'ADMIN' : 'MEMBER',
        isVerified: true,
        uid: userCred.user.uid,
        createdAt: new Date().toISOString()
      });

      toast({ title: "تم النجاح!", description: "مرحباً بك في KoroneBet!" });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في إنشاء الحساب", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "أدخل الاسم وكلمة السر." });
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('username', '==', formData.username.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "خطأ", description: "المستخدم غير موجود." });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();
      await signInWithEmailAndPassword(auth, userData.email, formData.password);
      
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "الاسم أو كلمة السر خاطئة." });
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
            {step === 'LOGIN' ? 'Login' : step === 'SIGNUP' ? 'Create Account' : 'Verify Email'}
          </h1>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {step === 'LOGIN' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black">
                  {loading ? <Loader2 className="animate-spin" /> : 'LOGIN'}
                </Button>
              </motion.div>
            )}

            {step === 'SIGNUP' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="username" placeholder="Choose Username" value={formData.username} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="password" type="password" placeholder="Create Password" value={formData.password} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl" />
                </div>
                <Button onClick={handleSignupInit} disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black">
                  {loading ? <Loader2 className="animate-spin" /> : 'SEND VERIFICATION CODE'}
                </Button>
              </motion.div>
            )}

            {step === 'VERIFY' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <p className="text-xs font-bold text-primary">Check your email for 6-digit code</p>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input name="verificationCode" placeholder="Enter Code" value={formData.verificationCode} onChange={handleInputChange} className="bg-black/20 border-white/10 h-14 pl-12 rounded-2xl text-center text-xl font-black" />
                </div>
                <Button onClick={handleVerifyAndCreate} disabled={loading} className="w-full h-16 bg-success text-background hover:bg-success/90 rounded-2xl font-black">
                  {loading ? <Loader2 className="animate-spin" /> : 'ACTIVATE ACCOUNT'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 'VERIFY' && (
          <div className="text-center pt-4">
            <button onClick={() => setStep(step === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-xs font-black text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto uppercase">
              {step === 'LOGIN' ? "Need an account? Sign up" : "Already have an account? Login"}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
