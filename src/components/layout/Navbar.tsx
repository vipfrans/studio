
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
      <nav className="sticky top-0 z-50 px-2 sm:px-6 py-3 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-background/70 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-base sm:text-xl">⚒️</span>
            </div>
            <span className="font-headline text-xs sm:text-xl md:text-2xl font-bold tracking-tighter headline-gradient whitespace-nowrap">
              KoroneBet.xyz
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAdmin}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shrink-0"
          >
            <Hammer className="w-3.5 h-3.5 sm:w-5 h-5 text-primary" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 relative shrink-0">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsBalanceMenuOpen(!isBalanceMenuOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 glass-purple rounded-full cursor-pointer hover:bg-primary/10 transition-colors border border-primary/20 shrink-0"
            >
              <div className="w-3.5 h-3.5 sm:w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[8px] sm:text-[10px] font-bold text-primary">R$</span>
              </div>
              <span className="font-headline font-bold text-primary text-[11px] sm:text-base whitespace-nowrap">
                {balance.toLocaleString()}
              </span>
              <ChevronDown className={`w-3 h-3 sm:w-4 h-4 text-primary transition-transform duration-300 shrink-0 ${isBalanceMenuOpen ? 'rotate-180' : ''}`} />
            </motion.div>

            <AnimatePresence>
              {isBalanceMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-3 right-0 w-40 sm:w-64 bg-background/95 backdrop-blur-2xl border-2 border-primary/30 rounded-2xl p-1 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[60]"
                >
                  <button
                    onClick={() => { handleDeposit(); setIsBalanceMenuOpen(false); }}
                    className="w-full flex items-center gap-2 sm:gap-3 px-2 py-3 sm:py-4 hover:bg-primary/10 rounded-xl transition-all text-[9px] sm:text-sm font-black text-primary group"
                  >
                    <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 h-4" />
                    </div>
                    DEPOSIT
                  </button>
                  <div className="h-px bg-primary/10 mx-2" />
                  <button
                    onClick={() => { handleWithdraw(); setIsBalanceMenuOpen(false); }}
                    className="w-full flex items-center gap-2 sm:gap-3 px-2 py-3 sm:py-4 hover:bg-accent/10 rounded-xl transition-all text-[9px] sm:text-sm font-black text-accent group"
                  >
                    <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 h-4" />
                    </div>
                    WITHDRAWAL
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[1px] sm:p-[2px] shrink-0">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/seed/user123/100/100" alt="Avatar" className="w-full h-full object-cover" />
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
