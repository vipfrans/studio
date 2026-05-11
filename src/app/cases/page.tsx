
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Box } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CasesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-purple p-12 rounded-[40px] text-center space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto border border-primary/30">
          <Box className="w-12 h-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="font-headline text-4xl font-black headline-gradient">Cases Coming Soon...</h2>
          <p className="text-muted-foreground text-lg">We are currently crafting the most epic unboxing experience for you.</p>
        </div>

        <div className="flex items-center justify-center gap-3 text-primary font-bold">
          <Clock className="w-5 h-5" />
          <span>Estimated arrival: Next Update</span>
        </div>

        <Link href="/">
          <Button className="mt-8 h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl">
            RETURN TO LOBBY
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
