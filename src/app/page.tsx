
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Bomb, Coins, Box, MessageSquare, Gift, TrendingUp, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from "@/hooks/use-toast";

const GAMES = [
  { id: 'rocket', name: 'Rocket', icon: Rocket, color: '#C899FF', href: '/rocket' },
  { id: 'mines', name: 'Mines', icon: Bomb, color: '#FF99E6', href: '/mines' },
  { id: 'coinflip', name: 'Coinflip', icon: Coins, color: '#73FF73', href: '/coinflip' },
  { id: 'cases', name: 'Cases', icon: Box, color: '#FFFFFF', href: '/cases' },
];

export default function Home() {
  const { toast } = useToast();
  const [claimStatus, setClaimStatus] = useState('CLAIM NOW');
  const [chatOnline, setChatOnline] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setChatOnline(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(10, Math.min(20, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    if (claimStatus === 'Error !') return;
    setClaimStatus('Error !');
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Warning</span>
        </div>
      ) as any,
      description: "This Event Was Not Started",
    });
    setTimeout(() => {
      setClaimStatus('CLAIM NOW');
    }, 2000);
  };

  return (
    <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden group"
        >
          <Link href="/chat">
            <div className="glass-purple p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] h-full border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquare className="w-24 h-24 sm:w-32 sm:h-32 text-primary" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-headline text-xl sm:text-2xl font-black headline-gradient">GLOBAL COMMUNITY</h2>
                      <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Connect with players worldwide</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4 max-w-md">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Join the conversation! Share your massive wins, discuss strategies for Mines and Rocket, or just hang out with the community.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full border border-primary/20">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        <span className="text-[10px] sm:text-xs font-black text-primary uppercase">{chatOnline} ONLINE NOW</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-success uppercase">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success animate-pulse" />
                        LIVE CHAT ACTIVE
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex items-center gap-2 text-primary font-black group-hover:gap-4 transition-all text-sm sm:text-base">
                  <span>OPEN COMMUNITY CHAT</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-[24px] sm:rounded-[32px] border-primary/20 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <h2 className="font-headline text-lg sm:text-xl font-bold">Daily Reward</h2>
          </div>
          <div className="mt-4 flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-xs sm:text-sm text-muted-foreground px-4">Your daily chest is ready to be opened!</span>
            <span className="text-xl sm:text-2xl font-headline font-bold text-accent">R$ 50 - 5,000</span>
          </div>
          <button 
            onClick={handleClaim}
            className={`w-full mt-6 py-4 font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all ${
              claimStatus === 'Error !' 
                ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                : 'bg-accent text-accent-foreground hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,153,230,0.3)]'
            }`}
          >
            {claimStatus}
          </button>
        </motion.div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold">Game Selection</h2>
          </div>
          <div className="hidden sm:block h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GAMES.map((game, idx) => {
            const imageData = PlaceHolderImages.find(i => i.id === game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="relative aspect-square rounded-[24px] sm:rounded-[32px] overflow-hidden group cursor-pointer border-2 border-primary/10 hover:border-primary transition-all shadow-lg"
              >
                <Link href={game.href}>
                  <div className="absolute inset-0 z-0">
                    {imageData && (
                      <img 
                        src={imageData.imageUrl} 
                        alt={game.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.7] group-hover:brightness-[0.9]" 
                        data-ai-hint={imageData.imageHint}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  </div>
                  
                  <div className="absolute inset-0 z-10 p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary transition-colors">
                        <game.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      {game.id === 'cases' && (
                        <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-accent/20 backdrop-blur-md rounded-full border border-accent/30">
                          <span className="text-[8px] sm:text-[10px] font-black text-accent uppercase tracking-tighter">Soon</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg sm:text-2xl font-headline font-black text-white drop-shadow-lg">{game.name}</h3>
                      <p className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Play Now</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
