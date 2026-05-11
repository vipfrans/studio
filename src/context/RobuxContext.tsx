
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RobuxContextType {
  balance: number;
  addRobux: (amount: number) => void;
  removeRobux: (amount: number) => void;
  isAdminOpen: boolean;
  toggleAdmin: () => void;
}

const RobuxContext = createContext<RobuxContextType | undefined>(undefined);

export const RobuxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(1000);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const addRobux = (amount: number) => setBalance(prev => prev + amount);
  const removeRobux = (amount: number) => setBalance(prev => Math.max(0, prev - amount));
  const toggleAdmin = () => setIsAdminOpen(prev => !prev);

  return (
    <RobuxContext.Provider value={{ balance, addRobux, removeRobux, isAdminOpen, toggleAdmin }}>
      {children}
    </RobuxContext.Provider>
  );
};

export const useRobux = () => {
  const context = useContext(RobuxContext);
  if (!context) throw new Error('useRobux must be used within RobuxProvider');
  return context;
};
