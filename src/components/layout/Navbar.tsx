
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Hammer, CreditCard, ArrowDownToLine, ChevronDown } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const { balance, toggleAdmin, isAdminOpen } = useRobux();
  const { toast } = useToast();
  const [isBalanceMenuOpen, setIsBalanceMenuOpen] = useState(false);

  const handleDeposit = () => {
    toast({
      title: "Deposit System",
      description: "Deposit soon … until we get access in korone for this webite",
    });
  };

  const handleWithdraw = () => {
    toast({
      title: "Withdrawal System",
      description: "Withdraw soon … this site now just for fun",
    });
  };

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

        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsBalanceMenuOpen(!isBalanceMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 glass-purple rounded-full cursor-pointer hover:bg-primary/10 transition-colors border border-primary/20"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">R$</span>
              </div>
              <span className="font-headline font-bold text-primary">
                {balance.toLocaleString()}
              </span>
              <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isBalanceMenuOpen ? 'rotate-180' : ''}`} />
            </motion.div>

            <AnimatePresence>
              {isBalanceMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full mt-3 right-0 w-56 glass-purple border-primary/20 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                >
                  <button
                    onClick={() => { handleDeposit(); setIsBalanceMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-xl transition-colors text-sm font-bold text-primary"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    Deposit
                  </button>
                  <div className="h-px bg-primary/10 mx-2 my-1" />
                  <button
                    onClick={() => { handleWithdraw(); setIsBalanceMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-xl transition-colors text-sm font-bold text-accent"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <ArrowDownToLine className="w-4 h-4" />
                    </div>
                    Withdrawal
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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
