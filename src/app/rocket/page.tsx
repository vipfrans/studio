
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket as RocketIcon, ArrowLeft, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REALISTIC_NAMES = [
  'Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 
  'Rex_Official', 'Kone_Ko', 'Valk_Queen', 'Sniper_Elite', 'Shadow_King',
  'Neon_Ninja', 'Hyper_Active', 'Cool_Cat', 'Diamond_Hand', 'Roblox_Pro',
  'Dev_Master', 'Pixel_Art', 'Gaming_God', 'Crypto_King', 'Star_Dust',
  'X_Darkness_X', 'RobuxMaster', 'Legend_007', 'SkyWalker', 'NoobDestroyer',
  'Elite_One', 'MasterBuilder', 'BloxStar', 'KingOfRobux', 'VoidWalker'
];

interface PlayerBet {
  user: string;
  bet: number;
  targetMultiplier: number;
  cashedOut: boolean;
  cashedOutAt?: number;
}

export default function RocketPage() {
  const { balance, removeRobux, addRobux, nextCrashMultiplier, setNextCrashMultiplier, forceCrashTrigger, userProfile, lang } = useRobux();
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
  const playerJoinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeCrashTargetRef = useRef<number | null>(null);

  const stopAllIntervals = () => {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (playerJoinIntervalRef.current) clearInterval(playerJoinIntervalRef.current);
    gameIntervalRef.current = null;
    countdownIntervalRef.current = null;
    playerJoinIntervalRef.current = null;
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

  const initWaitingPhase = () => {
    stopAllIntervals();
    setGameState('waiting');
    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    setCountdown(5);
    setActiveBets([]);
    setHasCashedOut(false);
    setIsUserInRound(false);
    
    activeCrashTargetRef.current = nextCrashMultiplier;
    
    // عدد واقعي من اللاعبين الوهميين (بين 15 إلى 45) ليعكس نشاطاً معقولاً
    const targetCount = Math.floor(Math.random() * 30) + 15;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          startFlying();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    playerJoinIntervalRef.current = setInterval(() => {
      setActiveBets(prev => {
        if (prev.length >= targetCount) return prev;
        const availableNames = REALISTIC_NAMES.filter(name => !prev.some(p => p.user === name));
        if (availableNames.length === 0) return prev;
        
        const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
        const isWhale = Math.random() < 0.1;
        const bet = isWhale 
          ? Math.floor(Math.random() * 7000) + 3000 
          : Math.floor(Math.random() * 800) + 10;

        const newPlayer: PlayerBet = {
          user: randomName,
          bet: bet,
          targetMultiplier: 1.1 + (Math.random() * 4),
          cashedOut: false
        };
        return [...prev, newPlayer];
      });
    }, 150);
  };

  const startFlying = () => {
    stopAllIntervals();
    setGameState('flying');
    setNextCrashMultiplier(null);

    gameIntervalRef.current = setInterval(() => {
      const increment = 0.005 + (multiplierRef.current * 0.007);
      multiplierRef.current += increment;
      const currentMult = Number(multiplierRef.current.toFixed(2));
      setMultiplier(currentMult);

      setActiveBets(prev => prev.map(p => {
        // لا نسحب اللاعب الحقيقي تلقائياً
        if (p.user !== userProfile?.username && !p.cashedOut && currentMult >= p.targetMultiplier) {
          return { ...p, cashedOut: true, cashedOutAt: currentMult };
        }
        return p;
      }));

      if (activeCrashTargetRef.current && currentMult >= activeCrashTargetRef.current) {
        crashGame();
        return;
      }

      const crashChance = 0.002 + (multiplierRef.current * 0.002);
      if (Math.random() < crashChance && !activeCrashTargetRef.current) {
        crashGame();
      }
    }, 70);
  };

  const crashGame = () => {
    stopAllIntervals();
    setGameState('crashed');
    activeCrashTargetRef.current = null;
    const finalMult = Number(multiplierRef.current.toFixed(2));
    setHistory(prev => [finalMult, ...prev].slice(0, 10));
    
    setTimeout(() => {
      initWaitingPhase();
    }, 4000);
  };

  const handlePlaceBet = () => {
    if (gameState !== 'waiting' || balance < betAmount || isUserInRound || !userProfile) return;
    removeRobux(betAmount);
    setIsUserInRound(true);
    
    const userBet: PlayerBet = {
      user: userProfile.username,
      bet: betAmount,
      targetMultiplier: 999,
      cashedOut: false
    };
    setActiveBets(prev => [userBet, ...prev]);
  };

  const handleUserCashOut = () => {
    if (gameState !== 'flying' || hasCashedOut || !isUserInRound) return;
    const win = Math.floor(betAmount * multiplier);
    addRobux(win, 'Rocket');
    setHasCashedOut(true);
    setActiveBets(prev => prev.map(p => {
      if (p.user === userProfile?.username) return { ...p, cashedOut: true, cashedOutAt: multiplier };
      return p;
    }));
  };

  const t = {
    back: lang === 'EN' ? 'Back to Lobby' : 'الرجوع للرئيسية',
    bet: lang === 'EN' ? 'Bet Amount' : 'مبلغ الرهان',
    placeBet: lang === 'EN' ? 'PLACE BET' : 'تأكيد الرهان',
    betPlaced: lang === 'EN' ? 'BET PLACED' : 'تم الرهان',
    cashOut: lang === 'EN' ? 'CASH OUT' : 'سحب الأرباح',
    crashed: lang === 'EN' ? 'CRASHED!' : 'انفجار!',
    players: lang === 'EN' ? 'Players' : 'اللاعبين',
    repairing: lang === 'EN' ? 'REPAIRING NEW LAUNCH...' : 'تجهيز الإطلاق القادم...',
    exploded: lang === 'EN' ? 'Exploded at' : 'انفجر عند'
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 sm:mb-8 transition-colors text-sm sm:text-base">
        <ArrowLeft className={`w-4 h-4 ${lang === 'AR' ? 'rotate-180' : ''}`} />
        {t.back}
      </Link>

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 ${lang === 'AR' ? 'lg:flex lg:flex-row-reverse lg:gap-8' : ''}`}>
        <div className="lg:w-1/4 glass p-4 sm:p-6 rounded-2xl sm:rounded-3xl h-fit border-white/5 space-y-6">
          <h2 className="font-headline text-xl sm:text-2xl font-bold flex items-center gap-2">
            <RocketIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Rocket
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">{t.bet}</label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-background/50 border-white/10 h-10 sm:h-12 pl-10 text-sm sm:text-base"
                  disabled={gameState !== 'waiting' || isUserInRound}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm sm:text-base">R$</span>
              </div>
            </div>

            {gameState === 'waiting' ? (
              <Button 
                onClick={handlePlaceBet}
                disabled={isUserInRound}
                className={`w-full h-12 sm:h-14 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl transition-all ${
                  isUserInRound 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground glow-purple'
                }`}
              >
                {isUserInRound ? t.betPlaced : t.placeBet}
              </Button>
            ) : gameState === 'flying' ? (
              <Button 
                onClick={handleUserCashOut}
                disabled={hasCashedOut || !isUserInRound}
                className={`w-full h-12 sm:h-14 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl transition-all ${
                  hasCashedOut || !isUserInRound
                    ? 'bg-white/10 text-muted-foreground' 
                    : 'bg-success text-background hover:bg-success/90 hover:scale-[1.02]'
                }`}
              >
                {!isUserInRound ? 'FLYING...' : hasCashedOut ? 'CASHED OUT' : `${t.cashOut} (R$ ${Math.floor(betAmount * multiplier)})`}
              </Button>
            ) : (
              <Button disabled className="w-full h-12 sm:h-14 text-base sm:text-lg font-black bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl sm:rounded-2xl">
                {lang === 'EN' ? 'CRASHED' : 'انفجر'}
              </Button>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> {t.players} ({activeBets.length})
            </h3>
            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto no-scrollbar">
              <AnimatePresence mode="popLayout">
                {[...activeBets].sort((a,b) => (a.user === userProfile?.username ? -1 : 1)).map((player, i) => (
                  <motion.div 
                    key={`${player.user}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex justify-between items-center text-[11px] sm:text-sm p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${player.user === userProfile?.username ? 'bg-primary/10 border border-primary/30' : 'bg-white/5'}`}
                  >
                    <span className={`font-medium truncate max-w-[80px] sm:max-w-none ${player.user === userProfile?.username ? 'text-primary font-black' : 'text-muted-foreground'}`}>
                      {player.user}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-white/40">R$ {player.bet.toLocaleString()}</span>
                      {player.cashedOut && (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-primary font-black text-[10px] sm:text-xs drop-shadow-[0_0_10px_rgba(200,153,255,0.8)] px-1.5 py-0.5 rounded-md bg-primary/20 border border-primary/20"
                        >
                          {player.cashedOutAt?.toFixed(2)}x
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="lg:flex-1 space-y-4 sm:space-y-6">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
            {history.map((h, i) => (
              <div key={i} className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl glass text-[10px] sm:text-xs font-bold ${h > 2 ? 'text-success border-success/20' : 'text-primary border-primary/20'}`}>
                {h.toFixed(2)}x
              </div>
            ))}
          </div>

          <div className="glass-purple h-[300px] sm:h-[400px] lg:h-[500px] rounded-[24px] sm:rounded-[40px] relative overflow-hidden flex items-center justify-center border-2 border-primary/20 shadow-2xl">
            {/* Flying Rocket Animation behind the text */}
            <AnimatePresence>
              {gameState === 'flying' && (
                <motion.div
                  initial={{ y: 300, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: [300, 0, -10, 10, 0], 
                    opacity: 0.4,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
                  transition={{ 
                    y: { duration: 1.5, times: [0, 0.6, 0.7, 0.85, 1], ease: "easeOut" },
                    opacity: { duration: 0.8 }
                  }}
                  className="absolute pointer-events-none z-0"
                >
                  <div className="relative">
                    <RocketIcon className="w-56 h-56 sm:w-80 sm:h-80 text-primary fill-primary/10 drop-shadow-[0_0_60px_rgba(200,153,255,0.3)]" />
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 blur-[60px] rounded-full animate-pulse" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {gameState === 'waiting' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md px-4 text-center">
                <div className="text-muted-foreground font-bold mb-1 sm:mb-2 uppercase tracking-widest text-[10px] sm:text-sm">
                  {lang === 'EN' ? 'Next Round Starting In' : 'تبدأ الجولة القادمة خلال'}
                </div>
                <motion.div 
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl sm:text-7xl font-headline font-black text-primary drop-shadow-[0_0_30px_rgba(200,153,255,0.6)]"
                >
                  {countdown}s
                </motion.div>
                <div className="mt-2 sm:mt-4 flex items-center gap-2 text-[10px] sm:text-xs text-white/40">
                  <Users className="w-3 h-3 sm:w-4 h-4" />
                  <span>{activeBets.length} {lang === 'EN' ? 'Players Waiting' : 'لاعب ينتظر'}</span>
                </div>
              </div>
            )}

            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4">
              <span className={`text-[60px] sm:text-[100px] lg:text-[130px] font-headline font-black tracking-tighter transition-colors duration-300 ${gameState === 'crashed' ? 'text-red-500' : 'text-primary'} drop-shadow-2xl`}>
                {multiplier.toFixed(2)}x
              </span>
            </div>

            <svg className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-5">
              <motion.path
                d={`M 0 500 Q ${gameState === 'flying' ? 400 : 0} ${gameState === 'flying' ? 500 - (multiplier * 20) : 500} 1200 ${gameState === 'flying' ? 500 - (multiplier * 40) : 500}`}
                fill="none"
                stroke="url(#rocketGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.1 }}
              />
              <defs>
                <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C899FF" />
                  <stop offset="100%" stopColor="#FF99E6" />
                </linearGradient>
              </defs>
            </svg>

            <AnimatePresence>
              {gameState === 'crashed' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 z-40 backdrop-blur-lg bg-background/70 flex flex-col items-center justify-center p-4 text-center"
                >
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    className="w-20 h-20 sm:w-28 sm:h-28 bg-red-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-red-500/50 shadow-[0_0_50px_rgba(255,0,0,0.4)]"
                  >
                    <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-red-500 fill-red-500" />
                  </motion.div>
                  <h3 className="text-5xl sm:text-8xl font-headline font-black text-red-500 mb-1 sm:mb-2 drop-shadow-[0_0_40px_rgba(255,0,0,0.6)]">{t.crashed}</h3>
                  <p className="text-xl sm:text-3xl text-muted-foreground">{t.exploded} <span className="text-white font-bold">{multiplier.toFixed(2)}x</span></p>
                  <div className="mt-4 sm:mt-8 text-primary font-bold animate-pulse text-xs sm:text-base">{t.repairing}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
