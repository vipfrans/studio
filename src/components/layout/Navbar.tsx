
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, ChevronDown, Hammer, LogOut, User, Languages } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const { balance, toggleAdmin, isAdminOpen, userProfile, loading, lang, setLang } = useRobux();
  const auth = useAuth();
  const router = useRouter();
  const [isBalanceMenuOpen, setIsBalanceMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/auth');
  };

  const isOwner = userProfile?.username?.toLowerCase() === 'dew';

  return (
    <>
      <nav className={`sticky top-0 z-50 px-3 sm:px-6 py-3 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-background/70 ${lang === 'AR' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 sm:gap-4 ${lang === 'AR' ? 'flex-row-reverse' : ''}`}>
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/40">
              <span className="font-headline font-black text-primary text-xl">K</span>
            </div>
            <span className="font-headline text-lg font-black headline-gradient hidden xs:block">KoroneBet</span>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLang(lang === 'EN' ? 'AR' : 'EN')}
            className="rounded-full bg-white/5 border border-white/10"
          >
            <Languages className="w-4 h-4 text-primary" />
            <span className="text-[10px] ml-2">{lang === 'EN' ? 'AR' : 'EN'}</span>
          </Button>

          {isOwner && (
            <Button variant="ghost" size="icon" onClick={toggleAdmin} className="h-9 w-9 rounded-xl bg-primary/10">
              <Hammer className="w-5 h-5 text-primary" />
            </Button>
          )}
        </div>

        <div className={`flex items-center gap-2 sm:gap-4 ${lang === 'AR' ? 'flex-row-reverse' : ''}`}>
          {!userProfile && !loading ? (
            <Link href="/auth">
              <Button className="bg-primary text-primary-foreground font-black px-6 rounded-xl">LOGIN</Button>
            </Link>
          ) : (
            <div className={`flex items-center gap-2 ${lang === 'AR' ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <motion.div 
                  onClick={() => setIsBalanceMenuOpen(!isBalanceMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 glass-purple rounded-full cursor-pointer border border-primary/20"
                >
                  <span className="text-xs font-bold text-primary">R$</span>
                  <span className="font-headline font-bold text-primary">{balance.toLocaleString()}</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isBalanceMenuOpen ? 'rotate-180' : ''}`} />
                </motion.div>

                <AnimatePresence>
                  {isBalanceMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 right-0 w-48 bg-background border-2 border-primary/30 rounded-2xl p-1 z-50">
                      <Link href="/profile" className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-xl text-sm font-bold">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 rounded-xl text-red-500 text-sm font-bold border-t border-white/5">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Link href="/profile" className="w-10 h-10 rounded-full border-2 border-primary/40 overflow-hidden bg-white/5">
                <img src={userProfile?.avatarUrl || `https://picsum.photos/seed/${userProfile?.username}/40/40`} alt="Avatar" className="w-full h-full object-cover" />
              </Link>
            </div>
          )}
        </div>
      </nav>
      <AnimatePresence>{isAdminOpen && <AdminPanel />}</AnimatePresence>
    </>
  );
};
