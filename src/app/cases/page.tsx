
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Box, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CasesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-purple p-16 rounded-[48px] text-center space-y-8 relative overflow-hidden border-2 border-primary/20"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-primary/10 rounded-[40px] flex items-center justify-center border-2 border-primary/30 rotate-12 transition-transform duration-500 shadow-2xl">
            <Box className="w-16 h-16 text-primary" />
            <Lock className="absolute -bottom-2 -right-2 w-10 h-10 text-accent bg-background rounded-full p-2 border-2 border-accent/20 shadow-lg" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="font-headline text-5xl font-black headline-gradient leading-tight">Cases Coming Soon...</h2>
          <p className="text-muted-foreground text-xl max-w-md mx-auto">
            We are hand-crafting the most exhilarating unboxing experience for the community. Stay tuned!
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 py-4 px-8 bg-white/5 rounded-2xl border border-white/5 w-fit mx-auto">
          <div className="flex items-center gap-2 text-primary font-black text-lg">
            <Clock className="w-6 h-6" />
            <span>ESTIMATED RELEASE: Q1 2024</span>
          </div>
        </div>

        <Link href="/">
          <Button className="h-16 px-12 text-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_0_30px_rgba(200,153,255,0.4)] hover:scale-105 transition-all">
            RETURN TO LOBBY
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
