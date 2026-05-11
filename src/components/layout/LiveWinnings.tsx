"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Bomb, Coins, Box } from 'lucide-react';

interface Winning {
  id: string;
  user: string;
  avatar: string;
  game: 'Rocket' | 'Mines' | 'Coinflip' | 'Cases';
  amount: number;
}

const GAME_ICONS = {
  Rocket: Rocket,
  Mines: Bomb,
  Coinflip: Coins,
  Cases: Box,
};

export const LiveWinnings = () => {
  const [winnings, setWinnings] = useState<Winning[]>([]);

  useEffect(() => {
    const generateWinning = () => {
      const users = ['Frosty', 'Lumine', 'VoidX', 'Ghost', 'Stellar', 'Rex', 'Kone', 'Valk'];
      const games = ['Rocket', 'Mines', 'Coinflip', 'Cases'] as const;
      const newUser = users[Math.floor(Math.random() * users.length)];
      const game = games[Math.floor(Math.random() * games.length)];
      const amount = Math.floor(Math.random() * 5000) + 10;
      
      const newWin: Winning = {
        id: Math.random().toString(36),
        user: newUser,
        avatar: `https://picsum.photos/seed/${newUser}/40/40`,
        game,
        amount,
      };

      setWinnings(prev => [newWin, ...prev].slice(0, 10));
    };

    const interval = setInterval(generateWinning, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 glass-purple z-50 overflow-hidden flex items-center px-6 gap-6">
      <div className="flex-shrink-0 flex items-center gap-2 border-r border-white/10 pr-6 mr-6">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="font-headline font-bold text-sm text-muted-foreground uppercase tracking-widest">Last Winnings</span>
      </div>
      
      <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {winnings.map((win) => {
            const Icon = GAME_ICONS[win.game];
            return (
              <motion.div
                key={win.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-shrink-0 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  <img src={win.avatar} alt={win.user} className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[80px]">{win.user}</span>
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3 text-primary" />
                    <span className="text-neon-green font-headline font-bold text-sm">
                      +R$ {win.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
