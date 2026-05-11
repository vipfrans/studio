
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Bomb, Coins, Box, Trophy, Gift, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Community Jackpot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-purple p-6 rounded-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-headline text-xl font-bold">Community Jackpot</h2>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-headline font-black headline-gradient">R$ 1,245,670</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-muted-foreground">
                <span>PROGRESS TO DRAW</span>
                <span>84%</span>
              </div>
              <Progress value={84} className="h-3 bg-white/5">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(200,153,255,0.5)]" />
              </Progress>
            </div>
          </div>
        </motion.div>

        {/* Daily Reward */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-3xl border-primary/20 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-headline text-xl font-bold">Daily Reward</h2>
          </div>
          <div className="mt-4 flex-1 flex flex-col items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground text-center">Your daily chest is ready to be opened!</span>
            <span className="text-2xl font-headline font-bold text-accent">R$ 50 - 5,000</span>
          </div>
          <button 
            onClick={handleClaim}
            className={`w-full mt-4 py-3 font-bold rounded-xl transition-all ${
              claimStatus === 'Error !' 
                ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                : 'bg-accent text-accent-foreground hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {claimStatus}
          </button>
        </motion.div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-headline text-2xl font-bold">Game Selection</h2>
          </div>
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game, idx) => {
            const imageData = PlaceHolderImages.find(i => i.id === game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="relative aspect-square rounded-[32px] overflow-hidden group cursor-pointer border-2 border-primary/10 hover:border-primary transition-all shadow-lg"
              >
                <Link href={game.href}>
                  <div className="absolute inset-0 z-0">
                    {imageData && (
                      <img 
                        src={imageData.imageUrl} 
                        alt={game.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.8] group-hover:brightness-[1]" 
                        data-ai-hint={imageData.imageHint}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  </div>
                  
                  <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary transition-colors">
                        <game.icon className="w-5 h-5 text-primary" />
                      </div>
                      {game.id === 'cases' && (
                        <div className="px-3 py-1 bg-accent/20 backdrop-blur-md rounded-full border border-accent/30">
                          <span className="text-[10px] font-black text-accent uppercase tracking-tighter">Soon</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-headline font-black text-white drop-shadow-lg">{game.name}</h3>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Play Now</p>
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
