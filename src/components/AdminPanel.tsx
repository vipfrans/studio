
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Sparkles, Rocket, Zap, Target, Megaphone, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const AdminPanel = () => {
  const { addRobux, toggleAdmin, setNextCrashMultiplier, triggerImmediateCrash, nextCrashMultiplier, isVerified, setIsVerified } = useRobux();
  const db = useFirestore();
  const [targetMult, setTargetMult] = useState('');
  
  // Announcement states
  const [senderName, setSenderName] = useState('Admin');
  const [annText, setAnnText] = useState('');
  const [annImage, setAnnImage] = useState('');

  const presets = [100, 500, 1000, 5000, 10000];

  const handleSetTarget = () => {
    const val = parseFloat(targetMult);
    if (!isNaN(val) && val >= 1) {
      setNextCrashMultiplier(val);
    }
  };

  const handlePostAnnouncement = () => {
    if (!db) return;
    const annRef = doc(db, 'announcements', 'active');
    setDoc(annRef, {
      senderName,
      text: annText,
      imageUrl: annImage,
      isVerified: isVerified,
      active: true,
      createdAt: serverTimestamp(),
    });
    setAnnText('');
  };

  const handleClearAnnouncement = () => {
    if (!db) return;
    const annRef = doc(db, 'announcements', 'active');
    setDoc(annRef, { active: false }, { merge: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-6 z-[60] w-80 glass p-6 rounded-2xl shadow-2xl border-primary/20 max-h-[80vh] overflow-y-auto no-scrollbar"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Admin Control
        </h3>
        <Button variant="ghost" size="icon" onClick={toggleAdmin} className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Verification & Identity */}
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.6">
              <ShieldCheck className="w-3 h-3" /> Identity Badge
            </span>
            <Switch checked={isVerified} onCheckedChange={setIsVerified} />
          </div>
          <p className="text-[9px] text-muted-foreground leading-tight">
            When enabled, a verified badge will appear next to your name globally.
          </p>
        </div>

        {/* Announcement Section */}
        <div className="pt-4 border-t border-white/5">
          <label className="text-[10px] font-black text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
            <Megaphone className="w-3 h-3" /> Global Announcement
          </label>
          <div className="space-y-2">
            <Input 
              placeholder="Sender Name..." 
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="h-8 text-xs bg-background/50 border-white/10"
            />
            <Input 
              placeholder="Message content..." 
              value={annText}
              onChange={(e) => setAnnText(e.target.value)}
              className="h-8 text-xs bg-background/50 border-white/10"
            />
            <div className="relative">
              <Input 
                placeholder="Image URL (optional)..." 
                value={annImage}
                onChange={(e) => setAnnImage(e.target.value)}
                className="h-8 text-xs bg-background/50 border-white/10 pr-8"
              />
              <ImageIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePostAnnouncement} className="flex-1 h-8 bg-accent text-accent-foreground text-[10px] font-black">
                BROADCAST
              </Button>
              <Button onClick={handleClearAnnouncement} variant="outline" className="h-8 border-white/10 text-[10px] text-muted-foreground">
                CLEAR
              </Button>
            </div>
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

        {/* Balance Section */}
        <div className="pt-4 border-t border-white/5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Balance Control</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => addRobux(amount)}
                className="flex items-center gap-1 border-white/5 bg-white/5 hover:border-primary/50 text-[10px]"
              >
                <Plus className="w-3 h-3" />
                R$ {amount.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
