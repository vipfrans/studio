
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, arrayUnion, onSnapshot, setDoc, query, where, Timestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

interface SimSettings {
  onlinePlayers: number;
  chatMode: 'N' | 'S' | 'M' | 'T'; 
  winningsMode: 'N' | 'S' | 'M' | 'T'; 
  minRocketBots: number;
  maxRocketBots: number;
}

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
  simSettings: SimSettings;
  updateSimSettings: (data: Partial<SimSettings>) => Promise<void>;
  totalOnline: number;
}

const DEFAULT_SIM_SETTINGS: SimSettings = {
  onlinePlayers: 3142,
  chatMode: 'M',
  winningsMode: 'M',
  minRocketBots: 4,
  maxRocketBots: 14
};

const RobuxContext = createContext<RobuxContextType | undefined>(undefined);

export const RobuxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');
  const [simSettings, setSimSettings] = useState<SimSettings>(DEFAULT_SIM_SETTINGS);
  const [realOnlineCount, setRealOnlineCount] = useState(1);
  const [nextCrashMultiplier, setNextCrashMultiplier] = useState<number | null>(null);
  const [forceCrashTrigger, setForceCrashTrigger] = useState(0);
  const lastProcessedTransferRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // Ensure settings exist in Firestore
  useEffect(() => {
    if (!db) return;
    
    const initSettings = async () => {
      // Simulation Settings
      const simRef = doc(db, 'settings', 'simulation');
      const simSnap = await getDoc(simRef);
      if (!simSnap.exists()) {
        await setDoc(simRef, DEFAULT_SIM_SETTINGS);
      }

      // Rocket Game Initial State
      const rocketRef = doc(db, 'settings', 'rocket_game');
      const rocketSnap = await getDoc(rocketRef);
      if (!rocketSnap.exists()) {
        await setDoc(rocketRef, {
          status: 'waiting',
          startTime: serverTimestamp(),
          crashMultiplier: 2.5,
          roundId: Date.now().toString(),
          history: [1.2, 5.4, 2.1, 1.05, 12.0]
        });
      }
    };

    initSettings();

    // Listen to sim settings
    const simRef = doc(db, 'settings', 'simulation');
    const unsubSim = onSnapshot(simRef, (docSnap) => {
      if (docSnap.exists()) {
        setSimSettings(docSnap.data() as SimSettings);
      }
    });

    return () => unsubSim();
  }, [db]);

  const userDocRef = useMemo(() => {
    if (!db || !currentUser) return null;
    return doc(db, 'users', currentUser.uid);
  }, [db, currentUser]);

  const { data: profile, loading } = useDoc(userDocRef);

  // Global Sync Listener for Rocket Game Result Handling
  useEffect(() => {
    if (!db || !userDocRef || !profile?.activeRocketBet) return;

    const gameRef = doc(db, 'settings', 'rocket_game');
    const unsub = onSnapshot(gameRef, (snap) => {
      const gameData = snap.data();
      if (!gameData) return;

      if (gameData.status === 'crashed' && 
          profile.activeRocketBet.roundId === gameData.roundId && 
          !profile.activeRocketBet.cashedOut) {
        
        const startTime = gameData.startTime?.toMillis() || 0;
        if (Date.now() - startTime < 3000) {
          recordLoss(profile.activeRocketBet.amount, 'Rocket');
          updateDoc(userDocRef, { activeRocketBet: null });
        }
      }
      
      if (gameData.status === 'waiting' && profile.activeRocketBet.roundId !== gameData.roundId) {
         updateDoc(userDocRef, { activeRocketBet: null });
      }
    });

    return () => unsub();
  }, [db, userDocRef, profile?.activeRocketBet]);

  useEffect(() => {
    if (profile?.lastTransfer && profile.lastTransfer.timestamp) {
      const transfer = profile.lastTransfer;
      const ts = transfer.timestamp?.seconds || 0;
      
      if (!lastProcessedTransferRef.current || ts > lastProcessedTransferRef.current) {
        lastProcessedTransferRef.current = ts;
        
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-success font-black">SUCCESSFUL TRANSFER</span>
            </div>
          ) as any,
          description: (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-white">
                <span className="text-primary font-bold">@{transfer.sender}</span> has Transferred
              </span>
              <div className="flex items-center gap-2">
                <span className="text-success font-black text-lg">R$ {transfer.amount.toLocaleString()}</span>
                <span className="text-white/60 font-bold uppercase text-[10px]">To You</span>
              </div>
            </div>
          ) as any,
        });
      }
    }
  }, [profile?.lastTransfer, toast]);

  useEffect(() => {
    if (!db) return;

    const updateActivity = () => {
      if (userDocRef) {
        updateDoc(userDocRef, { lastSeen: serverTimestamp() });
      }
    };
    updateActivity();
    const activityInterval = setInterval(updateActivity, 120000);

    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineQuery = query(collection(db, 'users'), where('lastSeen', '>=', Timestamp.fromDate(fiveMinsAgo)));
    
    const unsubOnline = onSnapshot(onlineQuery, (snap) => {
      setRealOnlineCount(Math.max(1, snap.size));
    });

    return () => {
      clearInterval(activityInterval);
      unsubOnline();
    };
  }, [db, userDocRef]);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsVerified(profile.isVerified || false);
      if (profile.usernameLowercase === 'dew' && profile.role !== 'OWNER' && userDocRef) {
        updateDoc(userDocRef, { role: 'OWNER' });
      }
    }
  }, [profile, userDocRef]);

  const addRobux = async (amount: number, game: string) => {
    if (!userDocRef || !db) return;
    const safeGame = game || 'Game';

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
    const safeGame = game || 'Game';
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

  const updateSimSettings = async (data: Partial<SimSettings>) => {
    if (!db) return;
    const settingsRef = doc(db, 'settings', 'simulation');
    await updateDoc(settingsRef, data);
  };

  const toggleAdmin = () => setIsAdminOpen(prev => !prev);
  const triggerImmediateCrash = () => setForceCrashTrigger(Date.now());

  const balance = profile?.balance ?? 0;
  const totalOnline = (simSettings.onlinePlayers || 0) + realOnlineCount;

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
      updateProfile,
      simSettings,
      updateSimSettings,
      totalOnline
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
