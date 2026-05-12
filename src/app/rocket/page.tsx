
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
  const { balance, removeRobux, addRobux, recordLoss, nextCrashMultiplier, setNextCrashMultiplier, userProfile, lang, simSettings, totalOnline } = useRobux();
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

    // Dynamic Bot Count - Balanced with total online count
    // If totalOnline is high, we can have more bots.
    const onlineBase = Math.floor(totalOnline / 200); // 1 extra bot per 200 online
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
    gameIntervalRef.current = setInterval(() => {
      multiplierRef.current += 0.01 + (multiplierRef.current * 0.005);
      const currentMult = Number(multiplierRef.current.toFixed(2));
      setMultiplier(currentMult);

      setActiveBets(prev => prev.map(p => {
        if (p.avatarUrl?.includes('picsum') && !p.cashedOut && currentMult >= p.targetMultiplier) {
          return { ...p, cashedOut: true, cashedOutAt: currentMult };
        }
        return p;
      }));

      if (nextCrashMultiplier && currentMult >= nextCrashMultiplier) {
        crashGame();
      } else if (Math.random() < 0.005 + (multiplierRef.current * 0.003)) {
        crashGame();
      }
    }, 100);
  };

  const crashGame = () => {
    stopAllIntervals();
    setGameState('crashed');
    setNextCrashMultiplier(null);
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
            <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-black/20" disabled={isUserInRound} />
            <Button onClick={gameState === 'waiting' ? handlePlaceBet : handleUserCashOut} disabled={(gameState === 'waiting' && isUserInRound) || (gameState === 'flying' && hasCashedOut) || gameState === 'crashed'} className="w-full h-14 font-black">
              {gameState === 'waiting' ? (isUserInRound ? 'WAITING...' : 'PLACE BET') : (hasCashedOut ? 'CASHED OUT' : 'CASH OUT')}
            </Button>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4">Players ({activeBets.length})</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {activeBets.map((player, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-xl ${player.user === userProfile?.username ? 'bg-primary/20 border border-primary/20' : 'bg-white/5'}`}>
                  <div className="flex items-center gap-2">
                    <img src={player.avatarUrl} className="w-6 h-6 rounded-lg object-cover" />
                    <span className="text-xs font-bold truncate max-w-[80px]">{player.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/40">R$ {player.bet}</span>
                    {player.cashedOut && <span className="text-[10px] font-black text-primary">{player.cashedOutAt?.toFixed(2)}x</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2">
            {history.map((h, i) => <div key={i} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold">{h}x</div>)}
          </div>
          <div className="glass-purple h-[500px] rounded-[40px] relative flex items-center justify-center border-2 border-primary/20 overflow-hidden">
            <div className={`text-8xl font-black ${gameState === 'crashed' ? 'text-red-500' : 'text-primary'}`}>
              {multiplier.toFixed(2)}x
            </div>
            {gameState === 'waiting' && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Next Round In</p>
                <p className="text-6xl font-black text-primary">{countdown}s</p>
              </div>
            )}
            {gameState === 'crashed' && (
              <div className="absolute inset-0 bg-red-500/10 backdrop-blur-md flex flex-col items-center justify-center">
                <p className="text-8xl font-black text-red-500 mb-2">CRASHED!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
