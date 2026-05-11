
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ArrowLeft, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REALISTIC_NAMES = [
  'Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 
  'Rex_Official', 'Kone_Ko', 'Valk_Queen', 'Sniper_Elite', 'Shadow_King',
  'Neon_Ninja', 'Hyper_Active', 'Cool_Cat', 'Diamond_Hand', 'Roblox_Pro',
  'Dev_Master', 'Pixel_Art', 'Gaming_God', 'Crypto_King', 'Star_Dust'
];

interface PlayerBet {
  user: string;
  bet: number;
  targetMultiplier: number;
  cashedOut: boolean;
  cashedOutAt?: number;
}

export default function RocketPage() {
  const { balance, removeRobux, addRobux } = useRobux();
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [history, setHistory] = useState<number[]>([1.45, 12.4, 2.1, 1.05, 5.5]);
  const [activeBets, setActiveBets] = useState<PlayerBet[]>([]);
  const [countdown, setCountdown] = useState(5);

  const multiplierRef = useRef(1.00);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Handle Game Logic Transitions
  useEffect(() => {
    if (gameState === 'waiting') {
      // Clear previous game interval if any
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }

      setCountdown(5);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            startFlying();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }
  }, [gameState]);

  const startFlying = () => {
    // Reset Round State
    multiplierRef.current = 1.00;
    setMultiplier(1.00);
    setGameState('flying');
    setHasCashedOut(false);

    // Generate simulated players
    const playersCount = Math.floor(Math.random() * 10) + 5;
    const shuffledNames = [...REALISTIC_NAMES].sort(() => 0.5 - Math.random());
    const newBets: PlayerBet[] = shuffledNames.slice(0, playersCount).map(name => ({
      user: name,
      bet: Math.floor(Math.random() * 5000) + 50,
      targetMultiplier: 1.1 + (Math.random() * 5),
      cashedOut: false
    }));
    setActiveBets(newBets);

    // Start multiplier increase
    gameIntervalRef.current = setInterval(() => {
      const increment = 0.01 + (multiplierRef.current * 0.005);
      multiplierRef.current += increment;
      const currentMult = Number(multiplierRef.current.toFixed(2));
      setMultiplier(currentMult);

      // Simulated players cash out logic
      setActiveBets(prev => prev.map(p => {
        if (!p.cashedOut && currentMult >= p.targetMultiplier) {
          return { ...p, cashedOut: true, cashedOutAt: currentMult };
        }
        return p;
      }));

      // Random crash logic - adjusted to be slightly more forgiving at start
      const crashChance = 0.003 + (multiplierRef.current * 0.001);
      if (Math.random() < crashChance) {
        crashGame();
      }
    }, 50);
  };

  const crashGame = () => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    
    setGameState('crashed');
    const finalMult = Number(multiplierRef.current.toFixed(2));
    setHistory(prev => [finalMult, ...prev].slice(0, 10));
    
    // Hold crashed state for 3 seconds before resetting
    setTimeout(() => {
      // Check if we are still on the page before transitioning
      setGameState('waiting');
      setActiveBets([]); // Clear players for next round
    }, 3000);
  };

  const handlePlaceBet = () => {
    if (gameState !== 'waiting' || balance < betAmount) return;
    removeRobux(betAmount);
    // Note: In a real app, we'd add the user to activeBets here
  };

  const handleUserCashOut = () => {
    if (gameState !== 'flying' || hasCashedOut) return;
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
                  disabled={gameState !== 'waiting'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
              </div>
            </div>

            {gameState === 'waiting' ? (
              <Button 
                onClick={handlePlaceBet}
                className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl glow-purple"
              >
                PLACE BET
              </Button>
            ) : gameState === 'flying' ? (
              <Button 
                onClick={handleUserCashOut}
                disabled={hasCashedOut}
                className={`w-full h-14 text-lg font-black rounded-2xl transition-all ${
                  hasCashedOut 
                    ? 'bg-white/10 text-muted-foreground' 
                    : 'bg-success text-background hover:bg-success/90 hover:scale-[1.02]'
                }`}
              >
                {hasCashedOut ? 'CASHED OUT' : `CASH OUT (R$ ${Math.floor(betAmount * multiplier)})`}
              </Button>
            ) : (
              <Button disabled className="w-full h-14 text-lg font-black bg-red-500/20 text-red-500 border border-red-500/50 rounded-2xl">
                CRASHED
              </Button>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Current Players
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="popLayout">
                {activeBets.map((player, i) => (
                  <motion.div 
                    key={`${player.user}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5"
                  >
                    <span className="text-muted-foreground font-medium">{player.user}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white/60">R$ {player.bet}</span>
                      {player.cashedOut && (
                        <motion.span 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-primary font-black text-sm drop-shadow-[0_0_8px_rgba(200,153,255,0.8)] px-2 py-0.5 rounded-md bg-primary/10"
                        >
                          {player.cashedOutAt?.toFixed(2)}x
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeBets.length === 0 && gameState === 'waiting' && (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  Waiting for players to join...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graph Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-3 overflow-hidden">
            {history.map((h, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl glass text-xs font-bold ${h > 2 ? 'text-success' : 'text-primary'}`}>
                {h.toFixed(2)}x
              </div>
            ))}
          </div>

          <div className="glass-purple h-[500px] rounded-[40px] relative overflow-hidden flex items-center justify-center border-2 border-primary/20">
            {gameState === 'waiting' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm">
                <div className="text-muted-foreground font-bold mb-2 uppercase tracking-widest text-sm">Next Round in</div>
                <motion.div 
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-headline font-black text-primary drop-shadow-[0_0_20px_rgba(200,153,255,0.5)]"
                >
                  {countdown}s
                </motion.div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[120px] font-headline font-black tracking-tighter transition-colors duration-300 ${gameState === 'crashed' ? 'text-red-500' : 'text-primary'} drop-shadow-2xl`}>
                {multiplier.toFixed(2)}x
              </span>
            </div>

            {/* Simulated Graph Line */}
            <svg className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
              <motion.path
                d={`M 0 500 Q ${gameState !== 'waiting' ? 400 : 0} ${gameState !== 'waiting' ? 500 - (multiplier * 30) : 500} 1200 ${gameState !== 'waiting' ? 500 - (multiplier * 60) : 500}`}
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

            <AnimatePresence>
              {gameState === 'crashed' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute inset-0 z-20 backdrop-blur-md bg-background/60 flex flex-col items-center justify-center"
                >
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                    className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/50"
                  >
                    <Zap className="w-12 h-12 text-red-500 fill-red-500" />
                  </motion.div>
                  <h3 className="text-7xl font-headline font-black text-red-500 mb-2 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">CRASHED!</h3>
                  <p className="text-2xl text-muted-foreground">Exploded at <span className="text-white font-bold">{multiplier.toFixed(2)}x</span></p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
