
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket as RocketIcon, ArrowLeft, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REALISTIC_NAMES = ['Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 'Valk_Queen', 'Neon_Player', 'Rex_Bet', 'Kone_Pro', 'Silent_Ace', 'Storm_Rider', 'Pixel_Warrior', 'Cyber_Punk', 'Robo_Gamer', 'Elite_King', 'Vortex', 'Pulse', 'Shadow', 'Azure', 'Cinder', 'Mystic', 'Blaze', 'Glitch', 'Static'];

interface PlayerBet {
  user: string;
  bet: number;
  avatarUrl?: string;
  targetMultiplier: number;
  cashedOut: boolean;
  cashedOutAt?: number;
}

export default function RocketPage() {
  const { balance, removeRobux, addRobux, recordLoss, nextCrashMultiplier, setNextCrashMultiplier, userProfile, lang, simSettings, totalOnline, forceCrashTrigger } = useRobux();
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [isUserInRound, setIsUserInRound] = useState(false);
  const [history, setHistory] = useState<number[]>([1.45, 12.4, 2.1, 1.05, 5.5]);
  const [activeBets, setActiveBets] = useState<PlayerBet[]>([]);
  const [countdown, setCountdown] = useState(5);

  const multiplierRef = useRef(1.00);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopAllIntervals = () => {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // Watch for immediate crash trigger from Admin
  useEffect(() => {
    if (gameState === 'flying' && forceCrashTrigger > 0) {
      crashGame();
    }
  }, [forceCrashTrigger]);

  useEffect(() => {
    initWaitingPhase();
    return () => stopAllIntervals();
  }, []);

  const initWaitingPhase = () => {
    stopAllIntervals();
    setGameState('waiting');
    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    setCountdown(5);
    setActiveBets([]);
    setHasCashedOut(false);
    setIsUserInRound(false);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          startFlying();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const onlineBase = Math.floor(totalOnline / 200);
    const min = (simSettings.minRocketBots || 4) + onlineBase;
    const max = (simSettings.maxRocketBots || 14) + (onlineBase * 2);
    
    const botCount = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffledNames = [...REALISTIC_NAMES].sort(() => 0.5 - Math.random());
    const bots = shuffledNames.slice(0, Math.min(botCount, REALISTIC_NAMES.length)).map(name => ({
      user: name,
      bet: Math.floor(Math.random() * 800) + 50,
      avatarUrl: `https://picsum.photos/seed/${name}/40/40`,
      targetMultiplier: 1.1 + (Math.random() * 4),
      cashedOut: false
    }));
    setActiveBets(bots);
  };

  const startFlying = () => {
    stopAllIntervals();
    setGameState('flying');

    // Capture the limit from context at the moment of takeoff
    const currentLimit = nextCrashMultiplier;

    gameIntervalRef.current = setInterval(() => {
      // Calculation of growth
      multiplierRef.current += 0.01 + (multiplierRef.current * 0.005);
      const currentMult = Number(multiplierRef.current.toFixed(2));
      setMultiplier(currentMult);

      // Bot cashouts
      setActiveBets(prev => prev.map(p => {
        if (p.avatarUrl?.includes('picsum') && !p.cashedOut && currentMult >= p.targetMultiplier) {
          return { ...p, cashedOut: true, cashedOutAt: currentMult };
        }
        return p;
      }));

      // 1. Mandatory Crash (Admin Set)
      if (currentLimit !== null && currentMult >= currentLimit) {
        crashGame();
        return;
      }

      // 2. Natural Crash (Random)
      // If admin limit is set, we don't allow natural crash before it to ensure "Set at" works
      if (currentLimit === null) {
        if (Math.random() < 0.005 + (multiplierRef.current * 0.003)) {
          crashGame();
        }
      }
    }, 100);
  };

  const crashGame = () => {
    stopAllIntervals();
    setGameState('crashed');
    setNextCrashMultiplier(null); // Reset the admin multiplier in context
    const finalMult = Number(multiplierRef.current.toFixed(2));
    setHistory(prev => [finalMult, ...prev].slice(0, 10));

    if (isUserInRound && !hasCashedOut) {
      recordLoss(betAmount, 'Rocket');
    }

    setTimeout(initWaitingPhase, 4000);
  };

  const handlePlaceBet = async () => {
    if (gameState !== 'waiting' || balance < betAmount || isUserInRound || !userProfile) return;
    await removeRobux(betAmount);
    setIsUserInRound(true);
    setActiveBets(prev => [{
      user: userProfile.username,
      bet: betAmount,
      avatarUrl: userProfile.avatarUrl,
      targetMultiplier: 999,
      cashedOut: false
    }, ...prev]);
  };

  const handleUserCashOut = async () => {
    if (gameState !== 'flying' || hasCashedOut || !isUserInRound) return;
    const win = Math.floor(betAmount * multiplier);
    await addRobux(win, 'Rocket');
    setHasCashedOut(true);
    setActiveBets(prev => prev.map(p => {
      if (p.user === userProfile?.username) return { ...p, cashedOut: true, cashedOutAt: multiplier };
      return p;
    }));
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 py-12 pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className={`w-4 h-4 ${lang === 'AR' ? 'rotate-180' : ''}`} />
        {lang === 'EN' ? 'Back' : 'الرجوع'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 glass p-6 rounded-3xl h-fit border-white/5 space-y-6">
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <RocketIcon className="w-6 h-6 text-primary" /> Rocket
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-black/20 h-12 font-bold pl-10" disabled={isUserInRound} />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
            </div>
            <Button onClick={gameState === 'waiting' ? handlePlaceBet : handleUserCashOut} disabled={(gameState === 'waiting' && isUserInRound) || (gameState === 'flying' && hasCashedOut) || gameState === 'crashed'} className={`w-full h-14 font-black text-lg transition-all ${gameState === 'flying' && !hasCashedOut && isUserInRound ? 'bg-success hover:bg-success/90 shadow-[0_0_20px_rgba(115,255,115,0.4)]' : ''}`}>
              {gameState === 'waiting' ? (isUserInRound ? 'WAITING...' : 'PLACE BET') : (hasCashedOut ? 'CASHED OUT' : 'CASH OUT')}
            </Button>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Active Players</p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                <Users className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] font-black text-primary">{activeBets.length}</span>
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {activeBets.map((player, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${player.cashedOut ? 'bg-success/5 border border-success/20' : player.user === userProfile?.username ? 'bg-primary/20 border border-primary/40' : 'bg-white/5'}`}>
                  <div className="flex items-center gap-2">
                    <img src={player.avatarUrl} className="w-7 h-7 rounded-lg object-cover border border-white/10" alt="Avatar" />
                    <span className={`text-[11px] font-bold truncate max-w-[80px] ${player.cashedOut ? 'text-success' : 'text-white'}`}>{player.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/40">R$ {player.bet}</span>
                    {player.cashedOut && (
                      <div className="px-1.5 py-0.5 bg-success/20 rounded border border-success/30">
                        <span className="text-[9px] font-black text-success">{player.cashedOutAt?.toFixed(2)}x</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {history.map((h, i) => (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                key={i} 
                className={`px-4 py-1.5 rounded-lg text-xs font-black shrink-0 border-b-2 ${h >= 2 ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-muted-foreground border-white/10'}`}
              >
                {h.toFixed(2)}x
              </motion.div>
            ))}
          </div>
          
          <div className="glass-purple h-[500px] rounded-[40px] relative flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-2xl">
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <motion.div 
              key={multiplier}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`text-8xl sm:text-9xl font-black transition-colors duration-300 drop-shadow-[0_0_30px_rgba(200,153,255,0.3)] ${gameState === 'crashed' ? 'text-red-500 scale-110' : 'text-primary'}`}
            >
              {multiplier.toFixed(2)}x
            </motion.div>

            <AnimatePresence>
              {gameState === 'waiting' && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center z-30"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center border-2 border-primary/40 mb-6"
                  >
                    <RocketIcon className="w-10 h-10 text-primary" />
                  </motion.div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Preparing Launch</p>
                  <p className="text-7xl font-black text-white">{countdown}s</p>
                </motion.div>
              )}

              {gameState === 'crashed' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-red-500/10 backdrop-blur-md flex flex-col items-center justify-center z-30"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ duration: 0.5, repeat: 3 }}
                      className="text-8xl sm:text-9xl font-black text-red-500 mb-2 drop-shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                    >
                      CRASHED!
                    </motion.div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2 bg-red-500 text-white font-black rounded-full text-xl shadow-xl">
                      <Zap className="w-6 h-6 fill-current" />
                      {multiplier.toFixed(2)}x
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flying Stars Effect */}
            {gameState === 'flying' && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: "110%", y: Math.random() * 100 + "%" }}
                    animate={{ x: "-10%" }}
                    transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
