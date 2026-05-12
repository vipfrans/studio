"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket as RocketIcon, ArrowLeft, Users, Zap, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REALISTIC_NAMES = ['Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 'Valk_Queen', 'Neon_Player', 'Rex_Bet', 'Kone_Pro', 'Silent_Ace', 'Storm_Rider', 'Pixel_Warrior', 'Cyber_Punk', 'Robo_Gamer', 'Elite_King', 'Vortex', 'Pulse', 'Shadow', 'Azure', 'Cinder', 'Mystic', 'Blaze', 'Glitch', 'Static'];

const SOUNDS = {
  TICK: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  START: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  WIN: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  CRASH: "https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3"
};

const playSound = (url: string, volume = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
};

interface PlayerBet {
  user: string;
  bet: number;
  avatarUrl?: string;
  targetMultiplier: number;
  cashedOut: boolean;
  cashedOutAt?: number;
}

const GlowingRocket = memo(({ multiplier, isFlying, isCrashed }: { multiplier: number, isFlying: boolean, isCrashed: boolean }) => {
  // استخدام CSS transform للتحريك السلس وتقليل الـ Lag
  const yOffset = isCrashed ? -100 : (isFlying ? -Math.min(multiplier * 12, 160) : 0);
  
  return (
    <div
      style={{
        transform: `translate3d(-50%, ${yOffset}px, 0) scale(${isCrashed ? 1.3 : 1})`,
        transition: isCrashed ? 'all 0.3s ease-out' : 'transform 0.1s linear',
        position: 'absolute',
        left: '50%',
        bottom: '40%',
        willChange: 'transform',
        zIndex: 0
      }}
      className="flex flex-col items-center pointer-events-none"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-[30px] opacity-30 animate-pulse" />
        <svg width="100" height="150" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(200,153,255,0.5)]">
          <defs>
            <linearGradient id="rocketBody" x1="60" y1="20" x2="60" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D8B4FE" />
              <stop offset="50%" stopColor="#C899FF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          <path d="M60 10C60 10 30 50 30 100C30 140 60 160 60 160C60 160 90 140 90 100C90 50 60 10 60 10Z" fill="url(#rocketBody)" stroke="#E9D5FF" strokeWidth="2" />
          <path d="M30 120L10 155C10 155 30 160 40 145" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1" />
          <path d="M90 120L110 155C110 155 90 160 80 145" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1" />
          <circle cx="60" cy="70" r="12" fill="#1E1B4B" stroke="#E9D5FF" strokeWidth="2" />
        </svg>

        {isFlying && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-10 flex flex-col items-center">
            <div className="w-6 h-16 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 blur-sm rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
});

GlowingRocket.displayName = "GlowingRocket";

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

  useEffect(() => {
    if (gameState === 'flying' && forceCrashTrigger > 0) {
      crashGame();
    }
  }, [forceCrashTrigger]);

  useEffect(() => {
    initWaitingPhase();
    return () => stopAllIntervals();
  }, []);

  useEffect(() => {
    if (gameState === 'waiting' && countdown > 0) {
      playSound(SOUNDS.TICK, 0.3);
    }
  }, [countdown, gameState]);

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

    const botCount = Math.floor(Math.random() * 8) + 4;
    const shuffledNames = [...REALISTIC_NAMES].sort(() => 0.5 - Math.random());
    const bots = shuffledNames.slice(0, botCount).map(name => ({
      user: name,
      bet: Math.floor(Math.random() * 500) + 50,
      avatarUrl: `https://picsum.photos/seed/${name}/40/40`,
      targetMultiplier: 1.1 + (Math.random() * 3),
      cashedOut: false
    }));
    setActiveBets(bots);
  };

  const startFlying = () => {
    stopAllIntervals();
    setGameState('flying');
    playSound(SOUNDS.START);
    const currentLimit = nextCrashMultiplier;

    gameIntervalRef.current = setInterval(() => {
      // تسريع تدريجي للمضاعف
      multiplierRef.current += 0.01 + (multiplierRef.current * 0.003);
      const currentMult = Number(multiplierRef.current.toFixed(2));
      
      // تقليل عدد مرات تحديث الـ State إذا كانت القيمة لم تتغير
      setMultiplier(currentMult);

      // تحديث البوتات فقط كل 200ms لتحسين الأداء
      if (Math.random() > 0.5) {
        setActiveBets(prev => prev.map(p => {
          if (p.avatarUrl?.includes('picsum') && !p.cashedOut && currentMult >= p.targetMultiplier) {
            return { ...p, cashedOut: true, cashedOutAt: currentMult };
          }
          return p;
        }));
      }

      if (currentLimit !== null && currentMult >= currentLimit) {
        crashGame();
        return;
      }

      if (currentLimit === null) {
        if (Math.random() < 0.004 + (multiplierRef.current * 0.002)) {
          crashGame();
        }
      }
    }, 100);
  };

  const crashGame = () => {
    stopAllIntervals();
    setGameState('crashed');
    playSound(SOUNDS.CRASH);
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
    playSound(SOUNDS.WIN);
    await addRobux(win, 'Rocket');
    setHasCashedOut(true);
    setActiveBets(prev => prev.map(p => {
      if (p.user === userProfile?.username) return { ...p, cashedOut: true, cashedOutAt: multiplier };
      return p;
    }));
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 py-12 pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${lang === 'AR' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
        <span className="font-bold">{lang === 'EN' ? 'Back to Lobby' : 'الرجوع للرئيسية'}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-[32px] border-white/5 space-y-6">
            <h2 className="font-headline text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <RocketIcon className="w-6 h-6 text-primary" />
              </div>
              Rocket
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Bet Amount</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={betAmount} 
                    onChange={e => setBetAmount(Number(e.target.value))} 
                    className="bg-black/20 border-white/10 h-14 font-black text-lg pl-12 rounded-2xl" 
                    disabled={isUserInRound} 
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">R$</span>
                </div>
              </div>

              <Button 
                onClick={gameState === 'waiting' ? handlePlaceBet : handleUserCashOut} 
                disabled={(gameState === 'waiting' && isUserInRound) || (gameState === 'flying' && hasCashedOut) || gameState === 'crashed'} 
                className={`w-full h-16 font-black text-xl rounded-2xl transition-all shadow-xl ${
                  gameState === 'flying' && !hasCashedOut && isUserInRound 
                    ? 'bg-success hover:bg-success/90 text-background shadow-[0_0_30px_rgba(115,255,115,0.4)]' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {gameState === 'waiting' ? (isUserInRound ? 'WAITING...' : 'PLACE BET') : (hasCashedOut ? 'CASHED OUT' : 'CASH OUT')}
              </Button>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Active Players</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  <Users className="w-3 h-3 text-primary" />
                  <span className="text-[11px] font-black text-primary">{activeBets.length}</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {activeBets.map((player, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                    player.cashedOut 
                      ? 'bg-success/5 border-success/20' 
                      : player.user === userProfile?.username 
                        ? 'bg-primary/10 border-primary/40' 
                        : 'bg-white/5 border-white/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <img src={player.avatarUrl} className="w-7 h-7 rounded-lg object-cover" alt="Avatar" />
                      <span className={`text-[11px] font-bold truncate max-w-[80px] ${player.cashedOut ? 'text-success' : 'text-white'}`}>{player.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/40">R$ {player.bet}</span>
                      {player.cashedOut && (
                        <span className="text-[10px] font-black text-success">{player.cashedOutAt?.toFixed(2)}x</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`px-4 py-1.5 rounded-lg text-xs font-black shrink-0 border-b-2 ${
                  h >= 2 
                    ? 'bg-primary/10 text-primary border-primary/30' 
                    : 'bg-white/5 text-muted-foreground border-white/10'
                }`}
              >
                {h.toFixed(2)}x
              </div>
            ))}
          </div>
          
          <div className="glass-purple h-[500px] rounded-[40px] relative flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <GlowingRocket multiplier={multiplier} isFlying={gameState === 'flying'} isCrashed={gameState === 'crashed'} />

            <div 
              className={`text-7xl sm:text-9xl font-black transition-transform duration-200 relative z-10 select-none ${
                gameState === 'crashed' ? 'text-red-500 scale-110' : 'text-white'
              }`}
              style={{ textShadow: '0 0 30px rgba(0,0,0,0.5)' }}
            >
              {multiplier.toFixed(2)}<span className="text-3xl sm:text-5xl opacity-30 ml-1">x</span>
            </div>

            <AnimatePresence>
              {gameState === 'waiting' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-30"
                >
                  <div className="text-sm font-black uppercase tracking-[0.4em] text-primary/70 mb-4">Rocket starts at</div>
                  <div className="flex items-center gap-4">
                    <span className="text-7xl font-black text-white">{countdown}</span>
                    <span className="text-xl font-black text-primary animate-pulse">SECONDS</span>
                  </div>
                </motion.div>
              )}

              {gameState === 'crashed' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-red-500/5 backdrop-blur-md flex flex-col items-center justify-center z-30"
                >
                  <div className="px-6 py-2 bg-red-500 text-white font-black rounded-full text-xl shadow-lg">
                    {multiplier.toFixed(2)}x
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
