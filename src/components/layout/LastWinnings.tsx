
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Bomb, Coins, Box, Users } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

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

export const LastWinnings = () => {
  const db = useFirestore();
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(74);

  // جلب الانتصارات الحقيقية من Firestore
  const winsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'real_winnings'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);

  const { data: realWins } = useCollection(winsQuery) as any;

  useEffect(() => {
    const generateWinning = () => {
      const users = ['Frosty', 'Lumine', 'VoidX', 'Ghost', 'Stellar', 'Rex', 'Kone', 'Valk'];
      const games = ['Rocket', 'Mines', 'Coinflip', 'Cases'] as const;
      const newUser = users[Math.floor(Math.random() * users.length)];
      const game = games[Math.floor(Math.random() * games.length)];
      const amount = Math.floor(Math.random() * 5000) + 10;
      
      const newWin: Winning = {
        id: 'sim-' + Math.random(),
        user: newUser,
        avatar: `https://picsum.photos/seed/${newUser}/40/40`,
        game,
        amount,
      };

      setWinnings(prev => [newWin, ...prev].slice(0, 8));
    };

    const interval = setInterval(generateWinning, 4000);
    return () => clearInterval(interval);
  }, []);

  // دمج الحقيقي مع الوهمي
  const combinedWinnings = useMemo(() => {
    const formattedReal = (realWins || []).map((rw: any) => ({
      id: rw.id,
      user: rw.username,
      avatar: `https://picsum.photos/seed/${rw.username}/40/40`,
      game: rw.game as any,
      amount: rw.amount
    }));
    return [...formattedReal, ...winnings].slice(0, 10);
  }, [realWins, winnings]);

  useEffect(() => {
    const updateOnlinePlayers = () => {
      setOnlinePlayers(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const newValue = prev + change;
        return Math.max(68, Math.min(85, newValue));
      });
      const nextTime = Math.floor(Math.random() * 5000) + 10000;
      setTimeout(updateOnlinePlayers, nextTime);
    };
    const initialTimeout = setTimeout(updateOnlinePlayers, 10000);
    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 sm:h-20 glass-purple z-50 overflow-hidden flex items-center px-4 sm:px-6 gap-4 sm:gap-6 border-t-2 border-primary/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex-shrink-0 flex flex-col justify-center border-r border-white/10 pr-4 sm:pr-6 mr-0 sm:mr-6 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(115,255,115,0.5)]" />
          <span className="font-headline font-black text-[10px] sm:text-sm text-primary uppercase tracking-widest whitespace-nowrap">Last Wins</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
          <Users className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter hidden xs:inline">Online:</span>
          <span className="text-[9px] sm:text-[10px] font-black text-white">{onlinePlayers}</span>
        </div>
      </div>
      
      <div className="flex-1 flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {combinedWinnings.map((win) => {
            const Icon = GAME_ICONS[win.game] || Rocket;
            return (
              <motion.div
                key={win.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex-shrink-0 flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-1.5 sm:py-2 hover:bg-white/10 transition-colors cursor-default"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg">
                  <img src={win.avatar} alt={win.user} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[11px] font-black text-white/90 truncate max-w-[70px] sm:max-w-[90px] uppercase">{win.user}</span>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary" />
                    <span className="text-neon-green font-headline font-black text-[10px] sm:text-xs">
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
