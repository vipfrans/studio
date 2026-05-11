
"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ShieldCheck, X } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

const ANNOUNCEMENT_DURATION = 10000; // 10 seconds

export const GlobalAnnouncement = () => {
  const db = useFirestore();
  
  const activeDocRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'announcements', 'active');
  }, [db]);

  const { data: announcement } = useDoc(activeDocRef) as any;

  const [activeAnn, setActiveAnn] = useState<any>(null);
  const [show, setShow] = useState(false);
  const lastProcessedIdRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!announcement) return;

    const annId = announcement.createdAt?.seconds?.toString() || 
                  (announcement.text ? announcement.text.substring(0, 20) : 'none');

    if (announcement.active && annId !== lastProcessedIdRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      lastProcessedIdRef.current = annId;
      setActiveAnn({ ...announcement, id: annId });
      setShow(true);

      timerRef.current = setTimeout(() => {
        setShow(false);
      }, ANNOUNCEMENT_DURATION);
    } 
    
    if (announcement && announcement.active === false) {
      setShow(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [announcement]);

  const handleManualDismiss = () => {
    setShow(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (!db) return null;

  return (
    <AnimatePresence mode="wait">
      {show && activeAnn && (
        <motion.div
          key={activeAnn.id}
          initial={{ y: -150, x: '-50%', opacity: 0, scale: 0.9 }}
          animate={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          exit={{ 
            y: -150, 
            x: '-50%', 
            opacity: 0,
            scale: 0.8,
            filter: 'blur(10px)',
            transition: { duration: 0.4, ease: "easeIn" }
          }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-[90%] max-w-2xl px-2 pointer-events-auto"
        >
          <div className="glass-purple p-4 rounded-2xl border-2 border-accent/40 shadow-[0_0_50px_rgba(255,153,230,0.3)] relative overflow-hidden">
            <div className="relative flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-accent/30 shrink-0">
                <img 
                  src={activeAnn.senderAvatar || "https://picsum.photos/seed/admin/48/48"} 
                  className="w-full h-full object-cover" 
                  alt="Sender"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-accent tracking-widest uppercase truncate">
                    GLOBAL BROADCAST
                  </span>
                  <button onClick={handleManualDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0">
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="font-bold text-white text-sm truncate max-w-[150px]">{activeAnn.senderName}</span>
                  {activeAnn.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/20 shrink-0" />
                  )}
                  <span className="text-[8px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20 uppercase shrink-0">
                    {activeAnn.senderRank || 'Founder & CEO'}
                  </span>
                </div>

                <p className="text-white/90 text-xs sm:text-sm leading-relaxed break-words">
                  {activeAnn.text}
                </p>

                {activeAnn.imageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={activeAnn.imageUrl} 
                      alt="Announcement" 
                      className="w-full h-auto max-h-32 sm:max-h-40 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
              <motion.div
                key={`bar-${activeAnn.id}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: ANNOUNCEMENT_DURATION / 1000, ease: 'linear' }}
                className="h-full bg-accent shadow-[0_0_15px_rgba(255,153,230,1)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
