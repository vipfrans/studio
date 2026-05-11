
"use client";

import React from 'react';
import Link from 'next/link';
import { Hammer, Wallet } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { balance, toggleAdmin, isAdminOpen } = useRobux();

  return (
    <>
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-background/50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
              <span className="text-xl">⚒️</span>
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter headline-gradient">
              KoroneBet.xyz
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAdmin}
            className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Hammer className="w-5 h-5 text-primary" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <motion.div 
            key={balance}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 glass-purple rounded-full"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">R$</span>
            </div>
            <span className="font-headline font-bold text-primary">
              {balance.toLocaleString()}
            </span>
          </motion.div>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[url('https://picsum.photos/seed/user123/100/100')] bg-cover" />
            </div>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {isAdminOpen && <AdminPanel />}
      </AnimatePresence>
    </>
  );
};
