
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ShieldCheck, X } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

const ANNOUNCEMENT_DURATION = 15000; // 15 seconds

export const GlobalAnnouncement = () => {
  const db = useFirestore();
  const annDoc = useDoc(db ? doc(db, 'announcements', 'active') : null);
  const announcement = annDoc.data as any;

  const [isVisible, setIsVisible] = useState(false);
  const [currentAnnId, setCurrentAnnId] = useState<string | null>(null);

  useEffect(() => {
    if (announcement && announcement.active) {
      // Create a unique ID for this announcement to trigger fresh animations
      const annId = announcement.createdAt?.seconds?.toString() || announcement.text;
      
      if (annId !== currentAnnId) {
        setCurrentAnnId(annId);
        setIsVisible(true);

        // Force hide after duration regardless of database state
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, ANNOUNCEMENT_DURATION);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [announcement, currentAnnId]);

  const handleManualDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && announcement && (
        <motion.div
          key={currentAnnId}
          initial={{ y: -100, x: '-50%', opacity: 0, scale: 0.9 }}
          animate={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          exit={{ 
            y: -100, 
            x: '-50%', 
            opacity: 0, 
            scale: 0.8,
            filter: 'blur(10px)',
            transition: { duration: 0.5, ease: "easeIn" }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-[90%] max-w-2xl"
        >
          <div className="glass-purple p-4 rounded-2xl border-2 border-accent/40 shadow-[0_0_50px_rgba(255,153,230,0.3)] relative overflow-hidden">
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30 shrink-0">
                <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-accent tracking-widest uppercase">
                    GLOBAL BROADCAST
                  </span>
                  <button onClick={handleManualDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-bold text-white text-sm">{announcement.senderName}</span>
                  {announcement.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
                  )}
                  <span className="text-[8px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20 uppercase">
                    Admin
                  </span>
                </div>

                <p className="text-white/90 text-xs sm:text-sm leading-relaxed break-words">
                  {announcement.text}
                </p>

                {announcement.imageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={announcement.imageUrl} 
                      alt="Announcement" 
                      className="w-full h-auto max-h-40 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar with key-based reset */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
              <motion.div
                key={`progress-${currentAnnId}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: ANNOUNCEMENT_DURATION / 1000, ease: 'linear' }}
                className="h-full bg-accent shadow-[0_0_10px_rgba(255,153,230,1)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
