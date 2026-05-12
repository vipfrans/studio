
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket as RocketIcon, ArrowLeft, Users, Zap, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REALISTIC_NAMES = ['Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 'Valk_Queen', 'Neon_Player', 'Rex_Bet', 'Kone_Pro', 'Silent_Ace', 'Storm_Rider', 'Pixel_Warrior', 'Cyber_Punk', 'Robo_Gamer', 'Elite_King', 'Vortex', 'Pulse', 'Shadow', 'Azure', 'Cinder', 'Mystic', 'Blaze', 'Glitch', 'Static'];

// Sound Assets
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

const GlowingRocket = ({ multiplier, isFlying, isCrashed }: { multiplier: number, isFlying: boolean, isCrashed: boolean }) => {
  return (
    <motion.div
      initial={{ y: 200, opacity: 0, scale: 0.5 }}
      animate={{ 
        y: isCrashed ? -100 : (isFlying ? -Math.min(multiplier * 15, 180) : 0),
        opacity: 1, 
        scale: isCrashed ? 1.5 : 1,
        rotate: isFlying ? [0, -2, 2, 0] : 0
      }}
      transition={{ 
        y: { type: "spring", stiffness: 50, damping: 20 },
        rotate: { repeat: Infinity, duration: 0.1 }
      }}
      className="absolute z-0 flex flex-col items-center pointer-events-none"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-[40px] opacity-40 animate-pulse" />
        <svg width="120" height="180" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_30px_rgba(200,153,255,0.6)]">
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
          <circle cx="56" cy="66" r="4" fill="white" fillOpacity="0.4" />
        </svg>

        {isFlying && (
          <motion.div 
            animate={{ 
              scaleY: [1, 1.5, 1.2, 1.8, 1.3],
              opacity: [0.8, 1, 0.9, 1, 0.8]
            }}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-12 flex flex-col items-center"
          >
            <div className="w-8 h-20 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 blur-md rounded-full" />
            <div className="w-4 h-12 bg-white blur-sm rounded-full -mt-16 opacity-70" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

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

  // Countdown Sounds
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
    playSound(SOUNDS.START);
    const currentLimit = nextCrashMultiplier;

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

      if (currentLimit !== null && currentMult >= currentLimit) {
        crashGame();
        return;
      }

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
    playSound(SOUNDS.TICK);
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
              <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                {activeBets.map((player, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                    player.cashedOut 
                      ? 'bg-success/5 border-success/20' 
                      : player.user === userProfile?.username 
                        ? 'bg-primary/10 border-primary/40' 
                        : 'bg-white/5 border-white/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <img src={player.avatarUrl} className="w-8 h-8 rounded-xl object-cover border border-white/10" alt="Avatar" />
                      <span className={`text-[12px] font-bold truncate max-w-[90px] ${player.cashedOut ? 'text-success' : 'text-white'}`}>{player.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white/40">R$ {player.bet}</span>
                      {player.cashedOut && (
                        <div className="px-2 py-0.5 bg-success/20 rounded-lg border border-success/30">
                          <span className="text-[10px] font-black text-success">{player.cashedOutAt?.toFixed(2)}x</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {history.map((h, i) => (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                key={i} 
                className={`px-6 py-2 rounded-xl text-sm font-black shrink-0 border-b-4 transition-all ${
                  h >= 2 
                    ? 'bg-primary/20 text-primary border-primary/40' 
                    : 'bg-white/5 text-muted-foreground border-white/10'
                }`}
              >
                {h.toFixed(2)}x
              </motion.div>
            ))}
          </div>
          
          <div className="glass-purple h-[550px] rounded-[48px] relative flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-[0_0_100px_rgba(200,153,255,0.1)]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <GlowingRocket multiplier={multiplier} isFlying={gameState === 'flying'} isCrashed={gameState === 'crashed'} />

            <motion.div 
              key={multiplier}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: gameState === 'crashed' ? 1.2 : 1,
                opacity: 1
              }}
              className={`text-8xl sm:text-[10rem] font-black transition-colors duration-300 relative z-10 select-none drop-shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
                gameState === 'crashed' ? 'text-red-500' : 'text-white'
              }`}
            >
              {multiplier.toFixed(2)}<span className="text-4xl sm:text-6xl opacity-40 ml-1">x</span>
            </motion.div>

            <AnimatePresence>
              {gameState === 'waiting' && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center z-30"
                >
                  <motion.div
                    animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 bg-primary/20 rounded-[32px] flex items-center justify-center border-2 border-primary/40 mb-8 shadow-[0_0_50px_rgba(200,153,255,0.4)]"
                  >
                    <RocketIcon className="w-12 h-12 text-primary" />
                  </motion.div>
                  <p className="text-sm font-black uppercase tracking-[0.5em] text-primary/80 mb-4">LOBBY OPEN - PREPARING LAUNCH</p>
                  <div className="flex items-center gap-4">
                    <span className="text-8xl font-black text-white">{countdown}</span>
                    <span className="text-2xl font-black text-primary animate-pulse">SECONDS</span>
                  </div>
                </motion.div>
              )}

              {gameState === 'crashed' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-red-500/10 backdrop-blur-2xl flex flex-col items-center justify-center z-30"
                >
                  <div className="relative text-center">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [-2, 2, -2, 2, 0]
                      }} 
                      transition={{ duration: 0.4 }}
                      className="text-7xl sm:text-9xl font-black text-red-500 mb-4 drop-shadow-[0_0_60px_rgba(239,68,68,0.7)]"
                    >
                      CRASHED!
                    </motion.div>
                    <div className="inline-flex items-center gap-3 px-8 py-3 bg-red-500 text-white font-black rounded-full text-2xl shadow-2xl border-4 border-white/20">
                      <Zap className="w-8 h-8 fill-current" />
                      {multiplier.toFixed(2)}x
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {gameState === 'flying' && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 25 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: "110%", y: Math.random() * 100 + "%" }}
                    animate={{ x: "-10%" }}
                    transition={{ duration: Math.random() * 0.8 + 0.3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]"
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
