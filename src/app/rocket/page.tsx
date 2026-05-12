
"use client";

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket as RocketIcon, ArrowLeft, Users, Flame, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';

const REALISTIC_NAMES = ['Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 'Valk_Queen', 'Neon_Player', 'Rex_Bet', 'Kone_Pro', 'Silent_Ace', 'Storm_Rider', 'Pixel_Warrior', 'Cyber_Punk', 'Robo_Gamer', 'Elite_King', 'Vortex', 'Pulse', 'Shadow', 'Azure', 'Cinder', 'Mystic', 'Blaze', 'Glitch', 'Static'];

const SOUNDS = {
  TICK: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  START: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  WIN: "https://cdn.discordapp.com/attachments/1221933758492442756/1503601417271906354/dragon-studio-register-cha-ching-376896.mp3?ex=6a03f171&is=6a029ff1&hm=9291113652cf37a4f315069dfc3af06dc961bd335a3497d2694a36d0a400a1d8&",
  CRASH: "https://cdn.discordapp.com/attachments/1221933758492442756/1503604447782113310/u_xg7ssi08yr-bomb-explosion-2-381970_mp3cut.net.mp3?ex=6a03f443&is=6a02a2c3&hm=e4ad40e2cfb22ec295fd77ca68b31f83918129dc4a3cee430f8d79db243b9265&" 
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
  cashedOut: boolean;
  cashedOutAt?: number;
}

const GlowingRocket = memo(({ isFlying, isCrashed }: { isFlying: boolean, isCrashed: boolean }) => {
  return (
    <div
      className="flex flex-col items-center pointer-events-none"
      style={{
        transform: `scale(${isCrashed ? 1.5 : 1})`,
        transition: 'all 0.3s ease-out',
        zIndex: 10
      }}
    >
      <div className="relative">
        {!isCrashed && <div className="absolute inset-0 bg-primary blur-[40px] opacity-40 animate-pulse" />}
        
        <svg 
          width="140" 
          height="200" 
          viewBox="0 0 120 180" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={`drop-shadow-[0_0_35px_rgba(200,153,255,0.7)] transition-colors duration-200 ${isCrashed ? 'brightness-75 saturate-200' : 'brightness-100'}`}
        >
          <defs>
            <linearGradient id="rocketBody" x1="60" y1="20" x2="60" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isCrashed ? "#F97316" : "#D8B4FE"} />
              <stop offset="50%" stopColor={isCrashed ? "#EA580C" : "#C899FF"} />
              <stop offset="100%" stopColor={isCrashed ? "#9A3412" : "#A855F7"} />
            </linearGradient>
          </defs>
          <path d="M60 10C60 10 30 50 30 100C30 140 60 160 60 160C60 160 90 140 90 100C90 50 60 10 60 10Z" fill="url(#rocketBody)" stroke={isCrashed ? "#FB923C" : "#E9D5FF"} strokeWidth="2" />
          <path d="M30 120L10 155C10 155 30 160 40 145" fill={isCrashed ? "#9A3412" : "#9333EA"} stroke={isCrashed ? "#FB923C" : "#E9D5FF"} strokeWidth="1" />
          <path d="M90 120L110 155C110 155 90 160 80 145" fill={isCrashed ? "#9A3412" : "#9333EA"} stroke={isCrashed ? "#FB923C" : "#E9D5FF"} strokeWidth="1" />
          <circle cx="60" cy="70" r="12" fill="#1E1B4B" stroke={isCrashed ? "#FB923C" : "#E9D5FF"} strokeWidth="2" />
        </svg>

        {isFlying && !isCrashed && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-10 flex flex-col items-center">
            <div className="w-10 h-24 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 blur-lg rounded-full animate-pulse" />
          </div>
        )}
        
        {isCrashed && (
           <motion.div 
            animate={{ x: [-5, 5, -5], y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
           >
             <Flame className="w-20 h-20 text-orange-500 fill-orange-500 blur-[2px]" />
           </motion.div>
        )}
      </div>
    </div>
  );
});

GlowingRocket.displayName = "GlowingRocket";

export default function RocketPage() {
  const db = useFirestore();
  const { balance, removeRobux, addRobux, userProfile, lang } = useRobux();
  
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [activeBets, setActiveBets] = useState<PlayerBet[]>([]);
  const [localCountdown, setLocalCountdown] = useState(0);

  const gameDocRef = useMemo(() => doc(db, 'settings', 'rocket_game'), [db]);
  const { data: gameData } = useDoc(gameDocRef) as any;

  const handleCrashSync = async (finalMult: number) => {
    if (!db || gameData?.status !== 'flying') return;
    try {
      const safeMult = finalMult > 1000 ? 1.00 : Number(finalMult.toFixed(2));
      await updateDoc(gameDocRef, {
        status: 'crashed',
        startTime: serverTimestamp(),
        history: arrayUnion(safeMult)
      });
      playSound(SOUNDS.CRASH);
    } catch (e) {}
  };

  const handleStartFlyingSync = async () => {
    if (!db || gameData?.status !== 'waiting') return;
    try {
      await updateDoc(gameDocRef, {
        status: 'flying',
        startTime: serverTimestamp()
      });
      playSound(SOUNDS.START);
    } catch (e) {}
  };

  const handleWaitCycleSync = async () => {
    if (!db) return;
    try {
      const crashPoint = 1 + (Math.random() * Math.random() * 12);
      await updateDoc(gameDocRef, {
        status: 'waiting',
        startTime: serverTimestamp(),
        crashMultiplier: Number(crashPoint.toFixed(2)),
        roundId: Date.now().toString()
      });
    } catch (e) {}
  };

  // Heartbeat Driver: Checks and transitions state even if nobody is "driving"
  useEffect(() => {
    if (!gameData || !db) return;

    const heartbeat = setInterval(async () => {
      const now = Date.now();
      const startTime = gameData.startTime?.toMillis() || now;
      const elapsed = now - startTime;

      if (gameData.status === 'waiting' && elapsed > 6000) {
        await handleStartFlyingSync();
      } else if (gameData.status === 'crashed' && elapsed > 4000) {
        await handleWaitCycleSync();
      } else if (!gameData.status || elapsed > 600000) {
        await handleWaitCycleSync();
      }
    }, 1000);

    return () => clearInterval(heartbeat);
  }, [gameData, db]);

  // Visual Multiplier / Countdown Loop
  useEffect(() => {
    if (!gameData) return;

    if (gameData.status === 'flying') {
      const interval = setInterval(() => {
        const nowElapsed = Date.now() - (gameData.startTime?.toMillis() || Date.now());
        const seconds = nowElapsed / 1000;
        const currentMult = Math.min(Math.pow(1.065, seconds), 1000);
        const roundedMult = Number(currentMult.toFixed(2));
        
        setMultiplier(roundedMult);

        // Client-side predictive crash for responsiveness
        if (roundedMult >= (gameData.crashMultiplier || 1.1)) {
          handleCrashSync(roundedMult);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }

    if (gameData.status === 'waiting') {
      const interval = setInterval(() => {
        const nowElapsed = Date.now() - (gameData.startTime?.toMillis() || Date.now());
        const remaining = Math.max(0, Math.ceil((5000 - nowElapsed) / 1000));
        setLocalCountdown(remaining);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  const isUserInRound = useMemo(() => {
    return userProfile?.activeRocketBet?.roundId === gameData?.roundId;
  }, [userProfile?.activeRocketBet?.roundId, gameData?.roundId]);

  const hasCashedOut = useMemo(() => {
    return userProfile?.activeRocketBet?.cashedOut === true;
  }, [userProfile?.activeRocketBet?.cashedOut]);

  const handlePlaceBet = async () => {
    if (!userProfile || gameData?.status !== 'waiting' || isUserInRound || balance < betAmount) return;
    
    await removeRobux(betAmount);
    await updateDoc(doc(db, 'users', userProfile.uid), {
      activeRocketBet: {
        amount: betAmount,
        roundId: gameData.roundId,
        cashedOut: false,
        betAt: serverTimestamp()
      }
    });
  };

  const handleUserCashOut = async () => {
    if (gameData?.status !== 'flying' || hasCashedOut || !isUserInRound) return;
    const win = Math.floor(betAmount * multiplier);
    playSound(SOUNDS.WIN);
    
    await addRobux(win, 'Rocket');
    await updateDoc(doc(db, 'users', userProfile.uid), {
      'activeRocketBet.cashedOut': true,
      'activeRocketBet.cashedOutAt': multiplier
    });
  };

  // Bot Simulations
  useEffect(() => {
    if (!gameData?.roundId) return;
    const seed = gameData.roundId.split('').reduce((a: number, b: string) => (a + b.charCodeAt(0)), 0);
    const botCount = (seed % 8) + 6;
    
    const shuffledNames = [...REALISTIC_NAMES].sort((a, b) => {
      const hashA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0) + seed, 0);
      const hashB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0) + seed, 0);
      return hashA - hashB;
    });

    const bots = shuffledNames.slice(0, botCount).map((name, idx) => {
      const botSeed = seed + idx;
      const bet = (botSeed % 500) + 50;
      return {
        user: name,
        bet: bet,
        avatarUrl: `https://picsum.photos/seed/${name}/40/40`,
        cashedOut: false
      };
    });

    setActiveBets(bots);
  }, [gameData?.roundId]);

  useEffect(() => {
    if (gameData?.status === 'flying') {
      const interval = setInterval(() => {
        setActiveBets(prev => prev.map(p => {
          if (!p.cashedOut && Math.random() < 0.1) {
            return { ...p, cashedOut: true, cashedOutAt: multiplier };
          }
          return p;
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameData?.status, multiplier]);

  const displayHistory = useMemo(() => {
    return (gameData?.history || [])
      .filter((h: number) => h < 500)
      .slice(-12)
      .reverse();
  }, [gameData?.history]);

  const renderButton = () => {
    if (!gameData) return <Button disabled className="w-full h-16 rounded-2xl bg-primary/20">INITIALIZING...</Button>;

    if (gameData.status === 'waiting') {
      if (isUserInRound) {
        return <Button disabled className="w-full h-16 rounded-2xl bg-primary/40 font-black text-xl">WAITING...</Button>;
      }
      return (
        <Button 
          onClick={handlePlaceBet}
          disabled={balance < betAmount}
          className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl rounded-2xl shadow-xl"
        >
          PLACE BET
        </Button>
      );
    }

    if (gameData.status === 'flying') {
      if (isUserInRound) {
        if (hasCashedOut) {
          return <Button disabled className="w-full h-16 rounded-2xl bg-success/20 text-success font-black text-xl">CASHED OUT</Button>;
        }
        return (
          <Button 
            onClick={handleUserCashOut}
            className="w-full h-16 bg-success hover:bg-success/90 text-background font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(115,255,115,0.4)] animate-pulse"
          >
            CASH OUT
          </Button>
        );
      }
      return <Button disabled className="w-full h-16 rounded-2xl bg-white/5 text-muted-foreground font-black text-xl uppercase border border-white/10">Game Started</Button>;
    }

    if (gameData.status === 'crashed') {
      return <Button disabled className="w-full h-16 rounded-2xl bg-red-500/20 text-red-500 font-black text-xl">CRASHED</Button>;
    }

    return null;
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 sm:py-12 pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 sm:mb-8 transition-colors group">
        <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${lang === 'AR' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
        <span className="font-bold">{lang === 'EN' ? 'Back to Lobby' : 'الرجوع للرئيسية'}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
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
                    disabled={isUserInRound || (gameData?.status !== 'waiting')} 
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">R$</span>
                </div>
              </div>

              {renderButton()}
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Active Players</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  <Users className="w-3 h-3 text-primary" />
                  <span className="text-[11px] font-black text-primary">{activeBets.length + (isUserInRound ? 1 : 0)}</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {isUserInRound && (
                  <div className={`flex items-center justify-between p-3 rounded-2xl border ${hasCashedOut ? 'bg-success/10 border-success/40 shadow-[0_0_10px_rgba(115,255,115,0.2)]' : (gameData?.status === 'crashed' ? 'bg-red-500/10 border-red-500/40' : 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(200,153,255,0.2)]')}`}>
                    <div className="flex items-center gap-3">
                      <img src={userProfile?.avatarUrl} className="w-7 h-7 rounded-lg object-cover" alt="Avatar" />
                      <span className="text-[11px] font-bold text-white">YOU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/60">R$ {userProfile?.activeRocketBet?.amount}</span>
                      {hasCashedOut ? (
                        <span className="text-[10px] font-black text-success glow-sm">{userProfile?.activeRocketBet?.cashedOutAt?.toFixed(2)}x</span>
                      ) : (
                        gameData?.status === 'crashed' && <span className="text-[10px] font-black text-red-500">LOST</span>
                      )}
                    </div>
                  </div>
                )}
                {activeBets.map((player, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${
                    player.cashedOut ? 'bg-success/5 border-success/20' : (gameData?.status === 'crashed' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5')
                  }`}>
                    <div className="flex items-center gap-3">
                      <img src={player.avatarUrl} className="w-7 h-7 rounded-lg object-cover" alt="Avatar" />
                      <span className={`text-[11px] font-bold truncate max-w-[80px] ${player.cashedOut ? 'text-success' : (gameData?.status === 'crashed' ? 'text-red-500' : 'text-white')}`}>{player.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/40">R$ {player.bet}</span>
                      {player.cashedOut ? (
                        <span className="text-[10px] font-black text-success">{player.cashedOutAt?.toFixed(2)}x</span>
                      ) : (
                        gameData?.status === 'crashed' && <span className="text-[10px] font-black text-red-500">LOST</span>
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
            {displayHistory.map((h, i) => (
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
          
          <div className="glass-purple h-[400px] sm:h-[500px] rounded-[40px] relative flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="relative flex items-center justify-center w-full h-full">
              <div className="relative z-10 flex items-center justify-center">
                <GlowingRocket isFlying={gameData?.status === 'flying'} isCrashed={gameData?.status === 'crashed'} />
                
                <AnimatePresence>
                  {(gameData?.status === 'flying' || gameData?.status === 'crashed') && (
                    <motion.div 
                      key="active-multiplier"
                      initial={{ opacity: 1, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute z-[60] select-none font-black text-7xl sm:text-9xl drop-shadow-[0_0_40px_rgba(255,255,255,0.9)] pointer-events-none whitespace-nowrap ${gameData.status === 'crashed' ? 'text-red-500' : 'text-white'}`}
                      style={{ textShadow: gameData.status === 'crashed' ? '0 0 60px rgba(220,38,38,0.7)' : '0 0 60px rgba(255,255,255,0.7)' }}
                    >
                      {multiplier.toFixed(2)}<span className="text-3xl sm:text-5xl opacity-40 ml-1">x</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {gameData?.status === 'waiting' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-[70]"
                >
                  <div className="text-sm font-black uppercase tracking-[0.4em] text-primary/70 mb-4">Rocket starts at</div>
                  <div className="flex items-center gap-4">
                    <span className="text-7xl font-black text-white">{localCountdown}</span>
                    <span className="text-xl font-black text-primary animate-pulse">SECONDS</span>
                  </div>
                </motion.div>
              )}

              {gameData?.status === 'crashed' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-red-500/5 backdrop-blur-md flex flex-col items-center justify-center z-[70]"
                >
                  <div className="px-8 py-3 bg-red-600 text-white font-black rounded-2xl text-3xl shadow-[0_0_40px_rgba(220,38,38,0.6)] border-2 border-red-400/50 uppercase">
                    Crashed!
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
