
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Rocket, Megaphone, UserPlus, Users, Key, Plus } from 'lucide-react';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';

export const AdminPanel = () => {
  const { userProfile, toggleAdmin, setNextCrashMultiplier, triggerImmediateCrash, simSettings, updateSimSettings, totalOnline } = useRobux();
  const db = useFirestore();
  
  const [targetMult, setTargetMult] = useState('');
  const [annText, setAnnText] = useState('');
  const [annImage, setAnnImage] = useState('');

  // Give Robux states
  const [targetUsername, setTargetUsername] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [gifting, setGifting] = useState(false);

  // Invite Key states
  const [newKeyText, setNewKeyText] = useState('');
  const [maxUses, setMaxUses] = useState('1');
  const [creatingKey, setCreatingKey] = useState(false);

  if (!userProfile || (userProfile.username?.toLowerCase() !== 'dew' && userProfile.role !== 'OWNER')) return null;

  const handleGiveRobux = async () => {
    if (!targetUsername || !giftAmount || !db) return;
    setGifting(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', targetUsername));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          balance: increment(parseInt(giftAmount))
        });
        alert(`Sent R$ ${giftAmount} to ${targetUsername}`);
      } else {
        alert("User not found!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGifting(false);
    }
  };

  const handleCreateInviteKey = async () => {
    if (!newKeyText || !maxUses || !db) return;
    setCreatingKey(true);
    try {
      const keyRef = doc(db, 'invite_keys', newKeyText.toUpperCase());
      await setDoc(keyRef, {
        key: newKeyText.toUpperCase(),
        maxUses: parseInt(maxUses),
        currentUses: 0,
        isUsed: false,
        createdAt: serverTimestamp()
      });
      alert(`Key ${newKeyText.toUpperCase()} created with ${maxUses} uses!`);
      setNewKeyText('');
      setMaxUses('1');
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingKey(false);
    }
  };

  const handlePostAnnouncement = () => {
    if (!db || !userProfile) return;
    const isOwner = userProfile.role === 'OWNER' || userProfile.username?.toLowerCase() === 'dew';
    const rankLabel = isOwner ? 'Founder & CEO' : 'Admin';
    
    const annRef = doc(db, 'announcements', 'active');
    setDoc(annRef, {
      senderName: userProfile.username,
      senderRank: rankLabel,
      senderAvatar: userProfile.avatarUrl || '',
      text: annText,
      imageUrl: annImage,
      isVerified: true,
      active: true,
      createdAt: serverTimestamp(),
    });
    setAnnText('');
    setAnnImage('');
  };

  const handleOnlinePlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    updateSimSettings({ onlinePlayers: isNaN(val) ? 0 : val });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 left-6 z-[100] w-80 glass p-6 rounded-2xl border-2 border-primary/40 shadow-2xl overflow-y-auto no-scrollbar max-h-[80vh]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> FOUNDER PANEL
        </h3>
        <Button variant="ghost" size="icon" onClick={toggleAdmin}><X className="w-4 h-4" /></Button>
      </div>

      <div className="space-y-6">
        {/* Simulation Controls */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <label className="text-[10px] font-black text-primary uppercase mb-3 flex items-center gap-2">
            <Users className="w-3 h-3" /> Simulation Controls
          </label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[8px] text-muted-foreground uppercase font-black">Simulated Baseline</p>
              <span className="text-[10px] font-black text-primary">LIVE: {totalOnline.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Ex: 3142" 
                value={simSettings?.onlinePlayers ?? 0} 
                onChange={handleOnlinePlayersChange}
                className="h-9 text-xs font-bold bg-black/20"
              />
              <div className="flex items-center px-2 bg-primary/10 rounded-lg border border-primary/20 text-[10px] font-bold text-primary uppercase">
                RUNNING
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[8px] text-muted-foreground uppercase font-black">Chat Frequency: {simSettings?.chatMode || 'M'}</p>
            <div className="grid grid-cols-4 gap-1">
              {['N', 'S', 'M', 'T'].map((m) => (
                <Button 
                  key={m}
                  onClick={() => updateSimSettings({ chatMode: m as any })}
                  variant={simSettings?.chatMode === m ? 'default' : 'outline'}
                  className="h-8 text-[10px] font-bold p-0"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[8px] text-muted-foreground uppercase font-black">Wins Frequency: {simSettings?.winningsMode || 'M'}</p>
            <div className="grid grid-cols-4 gap-1">
              {['N', 'S', 'M', 'T'].map((m) => (
                <Button 
                  key={m}
                  onClick={() => updateSimSettings({ winningsMode: m as any })}
                  variant={simSettings?.winningsMode === m ? 'default' : 'outline'}
                  className="h-8 text-[10px] font-bold p-0"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[8px] text-muted-foreground uppercase font-black">Rocket Bots Range</p>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={simSettings?.minRocketBots ?? 0} 
                onChange={e => {
                  const val = parseInt(e.target.value);
                  updateSimSettings({ minRocketBots: isNaN(val) ? 0 : val });
                }}
                className="h-8 text-[10px] bg-black/10"
              />
              <Input 
                type="number" 
                placeholder="Max" 
                value={simSettings?.maxRocketBots ?? 0} 
                onChange={e => {
                  const val = parseInt(e.target.value);
                  updateSimSettings({ maxRocketBots: isNaN(val) ? 0 : val });
                }}
                className="h-8 text-[10px] bg-black/10"
              />
            </div>
          </div>
        </div>

        {/* Create Invite Key */}
        <div className="pt-4 border-t border-white/10">
          <label className="text-[10px] font-black text-amber-500 uppercase mb-3 flex items-center gap-2">
            <Key className="w-3 h-3" /> Invite Key Manager
          </label>
          <div className="space-y-2">
            <Input placeholder="Key (e.g. SECRET123)" value={newKeyText} onChange={e => setNewKeyText(e.target.value)} className="h-8 text-xs bg-black/10" />
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-[7px] text-muted-foreground uppercase font-black">Max Uses</p>
                <Input type="number" placeholder="Uses" value={maxUses} onChange={e => setMaxUses(e.target.value)} className="h-8 text-xs bg-black/10" />
              </div>
              <Button onClick={handleCreateInviteKey} disabled={creatingKey} className="self-end h-8 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-4">
                {creatingKey ? '...' : <Plus className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Gift Robux */}
        <div className="pt-4 border-t border-white/10">
          <label className="text-[10px] font-black text-success uppercase mb-3 flex items-center gap-2">
            <UserPlus className="w-3 h-3" /> Grant Robux
          </label>
          <div className="space-y-2">
            <Input placeholder="Player Username" value={targetUsername} onChange={e => setTargetUsername(e.target.value)} className="h-8 text-xs bg-black/10" />
            <Input type="number" placeholder="Amount" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} className="h-8 text-xs bg-black/10" />
            <Button onClick={handleGiveRobux} disabled={gifting} className="w-full h-8 bg-success text-background text-[10px] font-bold">
              {gifting ? 'GRANTING...' : 'GRANT ROBUX'}
            </Button>
          </div>
        </div>

        {/* Global Announcement */}
        <div className="pt-4 border-t border-white/10">
          <label className="text-[10px] font-black text-accent uppercase mb-3 flex items-center gap-2">
            <Megaphone className="w-3 h-3" /> Broadcast Message
          </label>
          <div className="space-y-2">
            <Input placeholder="Message Content" value={annText} onChange={e => setAnnText(e.target.value)} className="h-8 text-xs bg-black/10" />
            <Input placeholder="Optional Image URL" value={annImage} onChange={e => setAnnImage(e.target.value)} className="h-8 text-xs bg-black/10" />
            <Button onClick={handlePostAnnouncement} className="w-full h-8 bg-accent text-background text-[10px] font-bold">BROADCAST</Button>
          </div>
        </div>

        {/* Rocket Controls */}
        <div className="pt-4 border-t border-white/10">
          <label className="text-[10px] font-black text-primary uppercase mb-3 flex items-center gap-2">
            <Rocket className="w-3 h-3" /> Rocket Ops
          </label>
          <div className="space-y-2">
            <Input type="number" placeholder="Crash at..." value={targetMult} onChange={e => setTargetMult(e.target.value)} className="h-8 text-xs bg-black/10" />
            <div className="flex gap-2">
              <Button onClick={() => setNextCrashMultiplier(parseFloat(targetMult))} className="flex-1 h-8 bg-primary text-background text-[10px]">SET</Button>
              <Button onClick={triggerImmediateCrash} variant="destructive" className="flex-1 h-8 text-[10px]">CRASH NOW</Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
