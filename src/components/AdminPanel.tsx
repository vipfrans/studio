
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Sparkles, Rocket, Zap, Target } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminPanel = () => {
  const { addRobux, toggleAdmin, setNextCrashMultiplier, triggerImmediateCrash, nextCrashMultiplier } = useRobux();
  const [targetMult, setTargetMult] = useState('');

  const presets = [100, 500, 1000, 5000, 10000];

  const handleSetTarget = () => {
    const val = parseFloat(targetMult);
    if (!isNaN(val) && val >= 1) {
      setNextCrashMultiplier(val);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-6 z-[60] w-72 glass p-6 rounded-2xl shadow-2xl border-primary/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Admin Panel
        </h3>
        <Button variant="ghost" size="icon" onClick={toggleAdmin} className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Robux Section */}
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Balance Control</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => addRobux(amount)}
                className="flex items-center gap-1 border-white/5 bg-white/5 hover:border-primary/50 text-xs"
              >
                <Plus className="w-3 h-3" />
                R$ {amount.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Rocket Control Section */}
        <div className="pt-4 border-t border-white/5">
          <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
            <Rocket className="w-3 h-3" /> Rocket Control
          </label>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type="number" 
                  placeholder="Crash at..." 
                  value={targetMult}
                  onChange={(e) => setTargetMult(e.target.value)}
                  className="h-9 text-xs bg-background/50 border-white/10"
                />
                <Target className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              </div>
              <Button 
                onClick={handleSetTarget}
                size="sm" 
                className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold"
              >
                SET
              </Button>
            </div>
            
            {nextCrashMultiplier && (
              <div className="text-[10px] text-center bg-primary/10 py-1 rounded border border-primary/20 text-primary font-bold">
                NEXT CRASH: {nextCrashMultiplier}x
                <button onClick={() => setNextCrashMultiplier(null)} className="ml-2 underline opacity-60 hover:opacity-100">Cancel</button>
              </div>
            )}

            <Button 
              onClick={triggerImmediateCrash}
              variant="destructive" 
              className="w-full h-10 font-black text-xs gap-2 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
            >
              <Zap className="w-4 h-4 fill-current" />
              CRASH NOW
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
