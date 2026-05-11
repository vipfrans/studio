
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ShieldCheck, X } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const GlobalAnnouncement = () => {
  const db = useFirestore();
  const annDoc = useDoc(db ? doc(db, 'announcements', 'active') : null);
  
  const announcement = annDoc.data as any;

  if (!announcement || !announcement.active) return null;

  const handleDismiss = () => {
    if (!db) return;
    // For admins to quickly clear, though usually this is just a client-side hide if not admin.
    // We'll just hide it for everyone for now since this is a global "active" flag.
    const annRef = doc(db, 'announcements', 'active');
    setDoc(annRef, { active: false }, { merge: true });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl"
      >
        <div className="glass-purple p-4 rounded-2xl border-2 border-accent/40 shadow-[0_0_40px_rgba(255,153,230,0.3)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/5 animate-pulse" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30 shrink-0">
              <Megaphone className="w-6 h-6 text-accent" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-headline font-black text-accent text-sm tracking-widest uppercase">
                  GLOBAL BROADCAST
                </span>
                <div className="h-px flex-1 bg-accent/20" />
                <button onClick={handleDismiss} className="p-1 hover:bg-white/5 rounded-md transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-sm">{announcement.senderName}</span>
                {announcement.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
                )}
                <span className="text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20 uppercase">
                  Admin
                </span>
              </div>

              <p className="text-white/80 text-sm leading-relaxed font-medium">
                {announcement.text}
              </p>

              {announcement.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <img 
                    src={announcement.imageUrl} 
                    alt="Announcement" 
                    className="w-full h-auto max-h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
