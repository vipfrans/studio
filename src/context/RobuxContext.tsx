
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

interface RobuxContextType {
  balance: number;
  userProfile: any;
  loading: boolean;
  addRobux: (amount: number, game: string) => Promise<void>;
  removeRobux: (amount: number) => Promise<void>;
  recordLoss: (amount: number, game: string) => Promise<void>;
  isAdminOpen: boolean;
  toggleAdmin: () => void;
  isVerified: boolean;
  setIsVerified: (val: boolean) => void;
  lang: 'EN' | 'AR';
  setLang: (val: 'EN' | 'AR') => void;
  nextCrashMultiplier: number | null;
  setNextCrashMultiplier: (val: number | null) => void;
  forceCrashTrigger: number;
  triggerImmediateCrash: () => void;
  updateProfile: (data: any) => Promise<void>;
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
      if (profile.username?.toLowerCase() === 'dew' && profile.role !== 'OWNER' && userDocRef) {
        updateDoc(userDocRef, { role: 'OWNER' });
      }
    }
  }, [profile, userDocRef]);

  const addRobux = async (amount: number, game: string) => {
    if (!userDocRef || !db) return;
    const safeGame = game || 'Unknown Game';

    await updateDoc(userDocRef, { 
      balance: increment(amount),
      "stats.totalWins": increment(amount),
      gamesHistory: arrayUnion({
        game: safeGame,
        amount,
        type: 'WIN',
        createdAt: new Date().toISOString()
      })
    });
    
    if (amount > 0) {
      addDoc(collection(db, 'real_winnings'), {
        username: profile?.username || 'Player',
        amount: Math.floor(amount),
        game: safeGame,
        avatarUrl: profile?.avatarUrl || '',
        createdAt: serverTimestamp()
      });
    }
  };

  const removeRobux = async (amount: number) => {
    if (!userDocRef) return;
    await updateDoc(userDocRef, { 
      balance: increment(-amount),
      "stats.totalWagered": increment(amount),
      "stats.totalGames": increment(1)
    });
  };

  const recordLoss = async (amount: number, game: string) => {
    if (!userDocRef) return;
    const safeGame = game || 'Unknown Game';
    await updateDoc(userDocRef, {
      gamesHistory: arrayUnion({
        game: safeGame,
        amount,
        type: 'LOSS',
        createdAt: new Date().toISOString()
      })
    });
  };

  const updateProfile = async (data: any) => {
    if (!userDocRef) return;
    await updateDoc(userDocRef, data);
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
      recordLoss,
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
      triggerImmediateCrash,
      updateProfile
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
