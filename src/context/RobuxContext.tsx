
"use client";

import React, { createContext, useContext, useState } from 'react';

interface RobuxContextType {
  balance: number;
  addRobux: (amount: number) => void;
  removeRobux: (amount: number) => void;
  isAdminOpen: boolean;
  toggleAdmin: () => void;
  isVerified: boolean;
  setIsVerified: (val: boolean) => void;
  // Rocket Controls
  nextCrashMultiplier: number | null;
  setNextCrashMultiplier: (val: number | null) => void;
  forceCrashTrigger: number; // Timestamp to trigger immediate crash
  triggerImmediateCrash: () => void;
}

const RobuxContext = createContext<RobuxContextType | undefined>(undefined);

export const RobuxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(1000);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [nextCrashMultiplier, setNextCrashMultiplier] = useState<number | null>(null);
  const [forceCrashTrigger, setForceCrashTrigger] = useState(0);

  const addRobux = (amount: number) => setBalance(prev => prev + amount);
  const removeRobux = (amount: number) => setBalance(prev => Math.max(0, prev - amount));
  const toggleAdmin = () => setIsAdminOpen(prev => !prev);
  const triggerImmediateCrash = () => setForceCrashTrigger(Date.now());

  return (
    <RobuxContext.Provider value={{ 
      balance, 
      addRobux, 
      removeRobux, 
      isAdminOpen, 
      toggleAdmin,
      isVerified,
      setIsVerified,
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
