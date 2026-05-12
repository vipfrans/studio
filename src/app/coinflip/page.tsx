
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Sound Assets
const SOUNDS = {
  CLICK: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  WIN: "https://cdn.discordapp.com/attachments/1221933758492442756/1503601417271906354/dragon-studio-register-cha-ching-376896.mp3?ex=6a03f171&is=6a029ff1&hm=9291113652cf37a4f315069dfc3af06dc961bd335a3497d2694a36d0a400a1d8&",
  LOSE: "https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3"
};

const playSound = (url: string, volume = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
};

export default function CoinflipPage() {
  const { balance, removeRobux, addRobux, recordLoss } = useRobux();
  const [betAmount, setBetAmount] = useState(100);
  const [isFlipping, setIsFlipping] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const [side, setSide] = useState<'A' | 'B'>('A');

  const startFlip = () => {
    if (balance < betAmount || isFlipping) return;
    removeRobux(betAmount);
    playSound(SOUNDS.CLICK);
    
    setIsFlipping(true);
    setWinner(null);

    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'A' : 'B';
      setWinner(result);
      setIsFlipping(false);
      
      if (result === side) {
        playSound(SOUNDS.WIN);
        addRobux(betAmount * 1.95, 'Coinflip');
      } else {
        playSound(SOUNDS.LOSE);
        recordLoss(betAmount, 'Coinflip');
      }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Lobby
      </Link>

      <div className="text-center mb-12">
        <h2 className="font-headline text-4xl font-black headline-gradient mb-2">Coinflip</h2>
        <p className="text-muted-foreground">Classic 50/50. Double your money in seconds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className={`glass p-8 rounded-[40px] flex flex-col items-center gap-4 transition-all cursor-pointer ${side === 'A' ? 'border-primary ring-2 ring-primary/20' : 'border-white/5 opacity-50'}`} onClick={() => !isFlipping && setSide('A')}>
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
            <span className="text-4xl font-black text-primary">A</span>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-bold text-xl">Purple Team</h3>
            <span className="text-xs text-muted-foreground">Select to bet on Purple</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="relative w-40 h-40">
            <motion.div
              animate={isFlipping ? {
                rotateY: [0, 180, 360, 540, 720, 1080],
                y: [0, -100, 0]
              } : { rotateY: winner === 'A' ? 0 : winner === 'B' ? 180 : 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              <div className="absolute inset-0 w-full h-full glass-purple rounded-full flex items-center justify-center border-4 border-primary [backface-visibility:hidden]">
                <span className="text-6xl font-black text-primary">A</span>
              </div>
              <div className="absolute inset-0 w-full h-full bg-accent/20 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-accent [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <span className="text-6xl font-black text-accent">B</span>
              </div>
            </motion.div>
          </div>

          <div className="w-full space-y-4">
            <div className="relative">
              <Input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bg-background/50 border-white/10 h-12 text-center text-xl font-bold"
                disabled={isFlipping}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
            </div>
            <Button 
              onClick={startFlip}
              disabled={isFlipping}
              className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl glow-purple"
            >
              {isFlipping ? 'FLIPPING...' : 'START FLIP'}
            </Button>
          </div>
        </div>

        <div className={`glass p-8 rounded-[40px] flex flex-col items-center gap-4 transition-all cursor-pointer ${side === 'B' ? 'border-accent ring-2 ring-accent/20' : 'border-white/5 opacity-50'}`} onClick={() => !isFlipping && setSide('B')}>
          <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent">
            <span className="text-4xl font-black text-accent">B</span>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-bold text-xl">Magenta Team</h3>
            <span className="text-xs text-muted-foreground">Select to bet on Magenta</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-12 text-center"
          >
            <div className={`text-4xl font-black mb-2 ${winner === side ? 'text-success' : 'text-red-500'}`}>
              {winner === side ? 'YOU WON!' : 'YOU LOST!'}
            </div>
            <p className="text-muted-foreground">
              {winner === side ? `You doubled your bet and earned R$ ${Math.floor(betAmount * 1.95)}` : 'Unlucky flip. Try again?'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground text-sm border-t border-white/5 pt-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Provably Fair
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Secure Betting
        </div>
      </div>
    </div>
  );
}
