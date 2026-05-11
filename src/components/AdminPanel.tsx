
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';

export const AdminPanel = () => {
  const { addRobux, toggleAdmin } = useRobux();

  const presets = [100, 500, 1000, 5000, 10000];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-6 z-[60] w-64 glass p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Admin Panel
        </h3>
        <Button variant="ghost" size="icon" onClick={toggleAdmin} className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Add mock Robux to test balance-dependent UI features.</p>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => addRobux(amount)}
            className="flex items-center gap-1 border-white/10 hover:border-primary/50"
          >
            <Plus className="w-3 h-3" />
            R$ {amount}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
