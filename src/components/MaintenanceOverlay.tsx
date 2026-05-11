
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Clock, ShieldAlert, Sparkles } from 'lucide-react';

export const MaintenanceOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass-purple p-8 sm:p-12 rounded-[40px] border-2 border-primary/30 text-center relative shadow-[0_0_100px_rgba(200,153,255,0.2)]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-full bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/20 relative"
          >
            <Hammer className="w-12 h-12 sm:w-16 sm:h-16 text-primary drop-shadow-[0_0_15px_rgba(200,153,255,0.8)]" />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-accent" />
            </motion.div>
          </motion.div>
        </div>

        <h1 className="font-headline text-4xl sm:text-6xl font-black headline-gradient mb-6 leading-tight">
          UNDER MAINTENANCE
        </h1>
        
        <p className="text-muted-foreground text-lg sm:text-xl mb-10 max-w-md mx-auto leading-relaxed">
          We are currently hand-crafting some massive upgrades to the casino experience. <span className="text-primary font-bold">KoroneBet</span> will be back stronger than ever.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
            <Clock className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Estimated Wait</p>
              <p className="text-sm font-bold text-white">4-6 HOURS</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
            <ShieldAlert className="w-5 h-5 text-accent" />
            <div className="text-left">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</p>
              <p className="text-sm font-bold text-accent">SECURE UPGRADE</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <span>Server Cluster: Tokyo-01</span>
          <div className="w-1 h-1 rounded-full bg-primary/40" />
        </div>
      </motion.div>

      {/* Floating Particles for effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", x: `${Math.random() * 100}vw` }}
            animate={{ y: "-10vh" }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
            className="w-1 h-1 bg-primary/20 rounded-full blur-[1px]"
          />
        ))}
      </div>
    </div>
  );
};
