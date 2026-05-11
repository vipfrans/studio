
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowLeft, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RocketPage() {
  const { balance, removeRobux, addRobux } = useRobux();
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [isFlying, setIsFlying] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [history, setHistory] = useState<number[]>([1.45, 12.4, 2.1, 1.05, 5.5]);
  const [activeBets, setActiveBets] = useState<{user: string, bet: number}[]>([]);

  const multiplierRef = useRef(1.00);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFlying && !isCrashed) {
      interval = setInterval(() => {
        multiplierRef.current += 0.01 + (multiplierRef.current * 0.005);
        setMultiplier(Number(multiplierRef.current.toFixed(2)));
        
        // Random crash logic
        if (Math.random() < 0.005) {
          setIsCrashed(true);
          setHistory(prev => [multiplierRef.current, ...prev].slice(0, 10));
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isFlying, isCrashed]);

  const startGame = () => {
    if (balance < betAmount) return;
    removeRobux(betAmount);
    
    setIsFlying(true);
    setIsCrashed(false);
    setHasCashedOut(false);
    multiplierRef.current = 1.00;
    setMultiplier(1.00);
    
    setActiveBets(Array.from({ length: 12 }).map((_, i) => ({
      user: `User${Math.floor(Math.random() * 999)}`,
      bet: Math.floor(Math.random() * 1000) + 10
    })));
  };

  const cashOut = () => {
    if (!isFlying || isCrashed || hasCashedOut) return;
    const win = Math.floor(betAmount * multiplier);
    addRobux(win);
    setHasCashedOut(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Lobby
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="glass p-6 rounded-3xl h-fit border-white/5 space-y-6">
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Rocket
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Bet Amount</label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-background/50 border-white/10 h-12 pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
              </div>
            </div>

            {!isFlying || isCrashed ? (
              <Button 
                onClick={startGame}
                className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl glow-purple"
              >
                PLACE BET
              </Button>
            ) : (
              <Button 
                onClick={cashOut}
                disabled={hasCashedOut}
                className={`w-full h-14 text-lg font-black rounded-2xl ${hasCashedOut ? 'bg-white/10 text-muted-foreground' : 'bg-success text-background hover:bg-success/90'}`}
              >
                {hasCashedOut ? 'CASHED OUT' : `CASH OUT (R$ ${Math.floor(betAmount * multiplier)})`}
              </Button>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Active Players
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
              {activeBets.map((player, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{player.user}</span>
                  <span className="font-bold text-primary">R$ {player.bet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graph Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* History */}
          <div className="flex gap-3 overflow-hidden">
            {history.map((h, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl glass text-xs font-bold ${h > 2 ? 'text-success' : 'text-primary'}`}>
                {h.toFixed(2)}x
              </div>
            ))}
          </div>

          <div className="glass-purple h-[500px] rounded-[40px] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[120px] font-headline font-black tracking-tighter transition-colors duration-300 ${isCrashed ? 'text-red-500' : 'text-primary'}`}>
                {multiplier.toFixed(2)}x
              </span>
            </div>

            {/* Simulated Graph Line */}
            <svg className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
              <motion.path
                d={`M 0 500 Q ${isFlying ? 400 : 0} ${isFlying ? 500 - (multiplier * 50) : 500} 1200 ${isFlying ? 500 - (multiplier * 100) : 500}`}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C899FF" />
                  <stop offset="100%" stopColor="#FF99E6" />
                </linearGradient>
              </defs>
            </svg>

            {isCrashed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-20 backdrop-blur-sm bg-background/60 flex flex-col items-center justify-center"
              >
                <h3 className="text-6xl font-headline font-black text-red-500 mb-2">CRASHED!</h3>
                <p className="text-xl text-muted-foreground">The rocket exploded at {multiplier.toFixed(2)}x</p>
                <Button onClick={startGame} className="mt-8 bg-white/10 hover:bg-white/20 border border-white/10">
                  Try Again
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
