
"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';

const ITEMS = [
  { name: 'Valkyrie Helm', price: 50000, color: '#C899FF', img: 'https://picsum.photos/seed/valk/200/200' },
  { name: 'Dominus Rex', price: 150000, color: '#FF99E6', img: 'https://picsum.photos/seed/dominus/200/200' },
  { name: 'Gold Fedora', price: 12000, color: '#FFD700', img: 'https://picsum.photos/seed/fedora/200/200' },
  { name: 'Neon Blade', price: 2500, color: '#73FF73', img: 'https://picsum.photos/seed/blade/200/200' },
  { name: 'Star Shades', price: 500, color: '#FFFFFF', img: 'https://picsum.photos/seed/shades/200/200' },
];

export default function CasesPage() {
  const { balance, removeRobux, addRobux } = useRobux();
  const [isOpening, setIsOpening] = useState(false);
  const [winningItem, setWinningItem] = useState<typeof ITEMS[0] | null>(null);
  const [spinItems, setSpinItems] = useState<typeof ITEMS>([]);

  const startOpening = () => {
    const cost = 1000;
    if (balance < cost) return;
    removeRobux(cost);
    
    setIsOpening(true);
    setWinningItem(null);

    // Generate a long list of items for the slider
    const newItems = Array.from({ length: 60 }).map(() => ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    setSpinItems(newItems);

    setTimeout(() => {
      const winner = newItems[55]; // The one that lands in the middle
      setWinningItem(winner);
      addRobux(winner.price);
      setIsOpening(false);
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Lobby
      </Link>

      <div className="text-center mb-12">
        <h2 className="font-headline text-4xl font-black headline-gradient mb-2">Legendary Case</h2>
        <p className="text-muted-foreground">Open for R$ 1,000 and win items worth up to R$ 150,000!</p>
      </div>

      <div className="relative mb-20">
        {/* Selector Line */}
        <div className="absolute left-1/2 -top-4 bottom-4 w-1 bg-primary z-20 shadow-[0_0_15px_rgba(200,153,255,0.8)]" />
        
        <div className="glass-purple h-64 rounded-[40px] overflow-hidden relative">
          <motion.div
            animate={isOpening ? { x: [0, -8000] } : {}}
            transition={{ duration: 5, ease: [0.1, 0, 0.1, 1] }}
            className="flex items-center h-full px-[50%]"
          >
            {spinItems.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-48 mx-2 glass rounded-3xl p-4 flex flex-col items-center justify-between border-b-4" style={{ borderColor: item.color }}>
                <div className="flex-1 flex items-center justify-center">
                  <img src={item.img} alt={item.name} className="w-24 h-24 object-contain rounded-xl" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</p>
                  <p className="text-xs font-headline font-bold" style={{ color: item.color }}>R$ {item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {!isOpening && (
              <div className="flex items-center gap-4">
                {ITEMS.map((item, i) => (
                  <div key={i} className="flex-shrink-0 w-48 h-48 glass rounded-3xl p-4 flex flex-col items-center justify-center grayscale opacity-50">
                    <Box className="w-12 h-12 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8">
        <Button
          onClick={startOpening}
          disabled={isOpening}
          className="h-20 px-12 text-2xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl glow-purple"
        >
          {isOpening ? 'OPENING...' : 'OPEN CASE (R$ 1,000)'}
        </Button>

        <div className="w-full">
          <h3 className="text-xs font-bold text-muted-foreground uppercase mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Possible Drops
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {ITEMS.map((item, i) => (
              <div key={i} className="glass p-4 rounded-2xl border-white/5 flex flex-col items-center text-center gap-2">
                <img src={item.img} alt={item.name} className="w-16 h-16 object-contain rounded-lg" />
                <span className="text-[10px] font-bold text-muted-foreground">{item.name}</span>
                <span className="text-sm font-headline font-bold" style={{ color: item.color }}>R$ {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {winningItem && !isOpening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] backdrop-blur-xl bg-background/80 flex items-center justify-center p-6"
          >
            <div className="glass-purple max-w-md w-full p-8 rounded-[40px] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <Trophy className="w-20 h-20 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-headline font-black headline-gradient mb-2">NEW ITEM!</h2>
              <p className="text-muted-foreground mb-8">You just unboxed a legendary item!</p>
              
              <div className="glass p-6 rounded-3xl mb-8 flex flex-col items-center gap-4">
                <img src={winningItem.img} alt={winningItem.name} className="w-32 h-32 object-contain" />
                <div>
                  <h3 className="text-2xl font-headline font-bold" style={{ color: winningItem.color }}>{winningItem.name}</h3>
                  <p className="text-neon-green font-bold text-xl">+R$ {winningItem.price.toLocaleString()}</p>
                </div>
              </div>

              <Button onClick={() => setWinningItem(null)} className="w-full h-14 bg-white/10 hover:bg-white/20">
                COLLECT REWARD
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
