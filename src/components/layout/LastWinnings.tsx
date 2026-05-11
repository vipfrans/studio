
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Bomb, Coins, Box, Users, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(74);

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
    <div className="fixed bottom-0 left-0 right-0 h-20 glass-purple z-50 overflow-hidden flex items-center px-6 gap-6 border-t-2 border-primary/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex-shrink-0 flex flex-col justify-center border-r border-white/10 pr-6 mr-6 relative">
        {/* Chat Entry Button */}
        <div className="absolute -top-12 left-0 w-full">
          <Dialog>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 px-3 py-1 rounded-t-xl text-[10px] font-black text-primary tracking-widest uppercase transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                Community Chat
              </motion.button>
            </DialogTrigger>
            <DialogContent className="glass-purple border-primary/20 text-white">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl font-black headline-gradient">LEAVING CASINO?</DialogTitle>
                <DialogDescription className="text-muted-foreground pt-4">
                  Are you sure you want to leave the gaming floor and head over to the global chat? You can return anytime.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => {}} className="hover:bg-white/5">Stay Here</Button>
                <Button onClick={() => router.push('/chat')} className="bg-primary text-primary-foreground font-bold">Go to Chat</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(115,255,115,0.5)]" />
          <span className="font-headline font-black text-sm text-primary uppercase tracking-widest">Last Winnings</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Online Players:</span>
          <span className="text-[10px] font-black text-white">{onlinePlayers}</span>
        </div>
      </div>
      
      <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {winnings.map((win) => {
            const Icon = GAME_ICONS[win.game];
            return (
              <motion.div
                key={win.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex-shrink-0 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-2 hover:bg-white/10 transition-colors cursor-default"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg">
                  <img src={win.avatar} alt={win.user} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white/90 truncate max-w-[90px] uppercase">{win.user}</span>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-neon-green font-headline font-black text-xs">
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
