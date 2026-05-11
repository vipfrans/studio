
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Diamond, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GRID_SIZE = 25;

export default function MinesPage() {
  const { balance, removeRobux, addRobux, recordLoss } = useRobux();
  const [betAmount, setBetAmount] = useState(100);
  const [bombCount, setBombCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const startGame = () => {
    if (balance < betAmount || isPlaying) return;
    
    setMines([]);
    setRevealed([]);
    setHasWon(false);
    setIsGameOver(false);
    
    removeRobux(betAmount);
    
    const newMines: number[] = [];
    while (newMines.length < bombCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!newMines.includes(pos)) newMines.push(pos);
    }
    
    setMines(newMines);
    setIsPlaying(true);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || revealed.includes(index) || isGameOver) return;

    if (mines.includes(index)) {
      setIsGameOver(true);
      setIsPlaying(false);
      setRevealed(prev => Array.from(new Set([...prev, ...mines])));
      recordLoss(betAmount, 'Mines');
    } else {
      const nextRevealed = [...revealed, index];
      setRevealed(nextRevealed);
      if (nextRevealed.length === GRID_SIZE - bombCount) {
        cashOut(nextRevealed.length);
      }
    }
  };

  const cashOut = (count: number) => {
    if (!isPlaying || isGameOver || count === 0) return;
    
    const multiplier = 1 + (count * 0.2 * (bombCount / 2));
    const winAmount = Math.floor(betAmount * multiplier);
    
    addRobux(winAmount, 'Mines');
    setHasWon(true);
    setIsPlaying(false);
    setIsGameOver(true);
  };

  const resetGame = () => {
    setIsGameOver(false);
    setHasWon(false);
    setMines([]);
    setRevealed([]);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Lobby
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass p-6 rounded-3xl h-fit border-white/5 space-y-6">
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <Bomb className="w-6 h-6 text-primary" />
            Mines
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
                  disabled={isPlaying || isGameOver}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Mines Count ({bombCount})</label>
              <input 
                type="range" 
                min="1" 
                max="24" 
                value={bombCount} 
                onChange={(e) => setBombCount(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                disabled={isPlaying || isGameOver}
              />
            </div>

            {(!isPlaying && !isGameOver) && (
              <Button 
                onClick={startGame}
                className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl glow-purple"
              >
                START GAME
              </Button>
            )}

            {isPlaying && (
              <div className="space-y-2">
                <Button 
                  disabled
                  className="w-full h-14 text-lg font-black bg-primary/20 text-primary border border-primary/20 rounded-2xl cursor-default"
                >
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Playing...
                </Button>
                <Button 
                  onClick={() => cashOut(revealed.length)}
                  disabled={revealed.length === 0}
                  className="w-full h-14 text-lg font-black bg-success hover:bg-success/90 text-background rounded-2xl"
                >
                  CASH OUT
                </Button>
              </div>
            )}

            {isGameOver && (
              <Button 
                onClick={resetGame}
                className="w-full h-14 text-lg font-black bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> {hasWon ? 'PLAY AGAIN' : "CAN'T START"}
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-purple p-8 rounded-[40px] relative overflow-hidden">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <motion.button
                key={i}
                whileHover={!revealed.includes(i) && !isGameOver ? { scale: 1.05 } : {}}
                whileTap={!revealed.includes(i) && !isGameOver ? { scale: 0.95 } : {}}
                onClick={() => handleTileClick(i)}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border-b-4 ${
                  revealed.includes(i) 
                    ? mines.includes(i) 
                      ? 'bg-red-500/20 border-red-500/40 text-red-500' 
                      : 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(200,153,255,0.3)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <AnimatePresence mode="wait">
                  {revealed.includes(i) ? (
                    mines.includes(i) ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Bomb className="w-8 h-8" />
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Diamond className="w-8 h-8" />
                      </motion.div>
                    )
                  ) : null}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 backdrop-blur-sm bg-background/60 flex flex-col items-center justify-center p-8 text-center"
            >
              {hasWon ? (
                <>
                  <Diamond className="w-16 h-16 text-success mb-4" />
                  <h3 className="text-4xl font-headline font-black text-success mb-2">VICTORY!</h3>
                  <p className="text-muted-foreground mb-6">You successfully cashed out!</p>
                </>
              ) : (
                <>
                  <Bomb className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-4xl font-headline font-black text-red-500 mb-2">BOOM!</h3>
                  <p className="text-muted-foreground mb-6">Unlucky mine. Try again?</p>
                </>
              )}
              <Button onClick={resetGame} className="bg-primary text-primary-foreground h-14 px-8 rounded-xl font-black">
                PLAY AGAIN
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
