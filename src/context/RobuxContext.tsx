
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface RobuxContextType {
  balance: number;
  userProfile: any;
  loading: boolean;
  addRobux: (amount: number, game: string) => void;
  removeRobux: (amount: number) => void;
  isAdminOpen: boolean;
  toggleAdmin: () => void;
  isVerified: boolean;
  setIsVerified: (val: boolean) => void;
  lang: 'EN' | 'AR';
  setLang: (val: 'EN' | 'AR') => void;
  // Rocket Controls
  nextCrashMultiplier: number | null;
  setNextCrashMultiplier: (val: number | null) => void;
  forceCrashTrigger: number;
  triggerImmediateCrash: () => void;
}

const RobuxContext = createContext<RobuxContextType | undefined>(undefined);

export const RobuxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const db = useFirestore();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemo(() => {
    if (!db || !currentUser) return null;
    return doc(db, 'users', currentUser.uid);
  }, [db, currentUser]);

  const { data: profile, loading } = useDoc(userDocRef);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [nextCrashMultiplier, setNextCrashMultiplier] = useState<number | null>(null);
  const [forceCrashTrigger, setForceCrashTrigger] = useState(0);

  useEffect(() => {
    if (profile) {
      setIsVerified(profile.isVerified || false);
    }
  }, [profile]);

  const addRobux = (amount: number, game: string) => {
    if (!userDocRef || !db) return;
    updateDoc(userDocRef, { balance: increment(amount) });
    
    // تسجيل الفوز ليظهر للآخرين (نستخدم مجموعة افتراضية للانتصارات الحقيقية)
    if (amount > 0) {
      addDoc(collection(db, 'real_winnings'), {
        username: profile?.username || 'Player',
        amount: amount,
        game: game,
        createdAt: serverTimestamp()
      });
    }
  };

  const removeRobux = (amount: number) => {
    if (!userDocRef) return;
    updateDoc(userDocRef, { balance: increment(-amount) });
  };

  const toggleAdmin = () => setIsAdminOpen(prev => !prev);
  const triggerImmediateCrash = () => setForceCrashTrigger(Date.now());

  const balance = profile?.balance ?? 0;

  return (
    <RobuxContext.Provider value={{ 
      balance, 
      userProfile: profile,
      loading,
      addRobux, 
      removeRobux, 
      isAdminOpen, 
      toggleAdmin,
      isVerified,
      setIsVerified: (val: boolean) => {
        setIsVerified(val);
        if (userDocRef) updateDoc(userDocRef, { isVerified: val });
      },
      lang,
      setLang,
      nextCrashMultiplier,
      setNextCrashMultiplier,
      forceCrashTrigger,
      triggerImmediateCrash
    }}>
      {children}
    </RobuxContext.Provider>
  );
};

export const useRobux = () => {
  const context = useContext(RobuxContext);
  if (!context) throw new Error('useRobux must be used within RobuxProvider');
  return context;
};
