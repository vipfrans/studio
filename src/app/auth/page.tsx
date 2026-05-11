
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Key, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

  // نظام معالجة تسجيل الدخول باليوزر فقط
  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "أدخل الاسم وكلمة السر." });
      return;
    }

    setLoading(true);
    try {
      // البحث عن المستخدم بواسطة اليوزرنيم
      const q = query(collection(db, 'users'), where('username', '==', formData.username.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "خطأ", description: "المستخدم غير موجود." });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();
      // تسجيل الدخول باستخدام الإيميل الداخلي المخزن
      await signInWithEmailAndPassword(auth, userData.internalEmail, formData.password);
      
      toast({ title: "تم الدخول بنجاح", description: `مرحباً بعودتك ${formData.username}` });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "الاسم أو كلمة السر خاطئة." });
    } finally {
      setLoading(false);
    }
  };

  // نظام التسجيل بمفتاح الدعوة
  const handleSignup = async () => {
    if (!formData.username.trim() || !formData.password.trim() || !formData.inviteKey.trim()) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء جميع الحقول بما في ذلك مفتاح الدعوة." });
      return;
    }

    setLoading(true);
    try {
      // 1. التحقق من مفتاح الدعوة
      // ملاحظة: المفاتيح التجريبية هي KORONE-7777 و KORONE-8888
      const keyRef = doc(db, 'invite_keys', formData.inviteKey.trim());
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) {
        // إذا لم يكن المفتاح موجوداً في القاعدة، نتحقق من المفاتيح الصلبة للتجربة الأولية
        const hardcodedKeys = ['KORONE-7777', 'KORONE-8888'];
        if (!hardcodedKeys.includes(formData.inviteKey.trim())) {
          toast({ variant: "destructive", title: "مفتاح خاطئ", description: "مفتاح الدعوة الذي أدخلته غير صحيح." });
          setLoading(false);
          return;
        }
      } else if (keySnap.data().isUsed) {
        toast({ variant: "destructive", title: "مفتاح مستخدم", description: "هذا المفتاح تم استخدامه من قبل لاعب آخر." });
        setLoading(false);
        return;
      }

      // 2. التحقق من أن اليوزرنيم غير مأخوذ
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', formData.username.trim()));
      const userSnap = await getDocs(q);
      
      if (!userSnap.empty) {
        toast({ variant: "destructive", title: "اسم مستخدم مأخوذ", description: "هذا الاسم مسجل مسبقاً، اختر اسماً آخر." });
        setLoading(false);
        return;
      }

      // 3. إنشاء الحساب في Firebase Auth (نستخدم إيميل وهمي داخلي)
      const internalEmail = `${formData.username.trim().toLowerCase()}@koronebet.local`;
      const userCred = await createUserWithEmailAndPassword(auth, internalEmail, formData.password);
      
      // 4. حفظ بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: formData.username.trim(),
        balance: 100, // رصيد هدية
        role: formData.username.toLowerCase() === 'dew' ? 'ADMIN' : 'MEMBER',
        isVerified: true,
        uid: userCred.user.uid,
        internalEmail: internalEmail,
        createdAt: serverTimestamp()
      });

      // 5. تحديث حالة المفتاح ليصبح مستخدماً
      await setDoc(doc(db, 'invite_keys', formData.inviteKey.trim()), {
        key: formData.inviteKey.trim(),
        isUsed: true,
        usedBy: formData.username.trim(),
        usedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "تم إنشاء الحساب!", description: "مرحباً بك في KoroneBet!" });
      router.push('/');
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({ variant: "destructive", title: "خطأ", description: error.message });
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
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
            {step === 'LOGIN' ? 'Welcome back legend' : 'Join the elite community'}
          </p>
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
                  <Input name="inviteKey" placeholder="Invite Key (KORONE-XXXX)" value={formData.inviteKey} onChange={handleInputChange} className="bg-accent/5 border-accent/20 h-14 pl-12 rounded-2xl text-accent font-bold placeholder:text-accent/30" />
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
            {step === 'LOGIN' ? "Don't have a key? Request one" : "Already have an account? Login"}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
