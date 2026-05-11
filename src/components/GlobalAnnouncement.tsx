
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ShieldCheck, X } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ANNOUNCEMENT_DURATION = 15000; // 15 seconds

export const GlobalAnnouncement = () => {
  const db = useFirestore();
  const annDoc = useDoc(db ? doc(db, 'announcements', 'active') : null);
  const announcement = annDoc.data as any;

  const [isVisible, setIsVisible] = useState(false);
  const [currentAnnId, setCurrentAnnId] = useState<string | null>(null);

  const handleManualDismiss = useCallback(async () => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (announcement && announcement.active) {
      const annId = announcement.createdAt?.seconds?.toString() || announcement.text;
      
      // If it's a new announcement id, show it
      if (annId !== currentAnnId) {
        setCurrentAnnId(annId);
        setIsVisible(true);

        // Auto hide after duration
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, ANNOUNCEMENT_DURATION);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [announcement, currentAnnId]);

  return (
    <AnimatePresence>
      {isVisible && announcement && (
        <motion.div
          key={currentAnnId}
          initial={{ y: -150, x: '-50%', opacity: 0, scale: 0.8 }}
          animate={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          exit={{ 
            y: -150, 
            x: '-50%', 
            opacity: 0, 
            scale: 0.5, 
            filter: 'blur(20px)',
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-[90%] max-w-2xl px-2"
        >
          <div className="glass-purple p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-accent/40 shadow-[0_0_50px_rgba(255,153,230,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/5 animate-pulse" />
            
            <div className="relative flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-accent/30 shrink-0">
                <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline font-black text-accent text-[10px] sm:text-xs tracking-[0.2em] uppercase truncate">
                    GLOBAL BROADCAST
                  </span>
                  <button onClick={handleManualDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-bold text-white text-xs sm:text-sm">{announcement.senderName}</span>
                  {announcement.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
                  )}
                  <span className="text-[8px] sm:text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20 uppercase">
                    Admin
                  </span>
                </div>

                <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-medium break-words">
                  {announcement.text}
                </p>

                {announcement.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <img 
                      src={announcement.imageUrl} 
                      alt="Announcement" 
                      className="w-full h-auto max-h-32 sm:max-h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar Timer */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: ANNOUNCEMENT_DURATION / 1000, ease: 'linear' }}
                className="h-full bg-accent shadow-[0_0_10px_rgba(255,153,230,0.8)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
