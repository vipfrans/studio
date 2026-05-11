
"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Shield, Target, TrendingUp, History, Coins, ArrowLeft, Check, Edit2, Loader2, Award, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRobux } from '@/context/RobuxContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { doc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function ProfilePage() {
  const { userProfile, updateProfile, lang } = useRobux();
  const db = useFirestore();
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!userProfile) return <div className="p-12 text-center">Loading Profile...</div>;

  const handleUpdateUsername = async () => {
    const trimmedName = newUsername.trim();
    if (!trimmedName || userProfile.hasChangedUsername) return;

    if (trimmedName.length < 4) {
      toast({ variant: "destructive", title: "Error", description: "Username is already taken or restricted." });
      return;
    }

    setIsUpdating(true);
    try {
      const q = query(collection(db, 'users'), where('usernameLowercase', '==', trimmedName.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast({ variant: "destructive", title: "Error", description: "Username already taken." });
        setIsUpdating(false);
        return;
      }
      await updateProfile({
        username: trimmedName,
        usernameLowercase: trimmedName.toLowerCase(),
        hasChangedUsername: true
      });
      toast({ title: "Success", description: "Username changed successfully!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not update username." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAvatar = async (url: string) => {
    await updateProfile({ avatarUrl: url });
    toast({ title: "Updated", description: "Profile picture changed!" });
  };

  const onAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Please select an image smaller than 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 sm:py-12 pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className={`w-4 h-4 ${lang === 'AR' ? 'rotate-180' : ''}`} />
        {lang === 'EN' ? 'Back to Lobby' : 'الرجوع للرئيسية'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
          <div className="glass-purple p-8 rounded-[32px] border-2 border-primary/20 text-center relative overflow-hidden">
            <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" onClick={onAvatarClick}>
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full border-4 border-primary relative z-10 object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 z-20 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background">
                <Shield className="w-4 h-4" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-black text-white">{userProfile.username}</h2>
              {userProfile.role === 'ADMIN' && <Award className="w-5 h-5 text-primary fill-primary/20" />}
              {userProfile.role === 'VIP' && <Award className="w-5 h-5 text-yellow-400" />}
            </div>
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">{userProfile.role}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Games</p>
                <p className="text-xl font-black text-white">{userProfile.stats?.totalGames || 0}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Wagered</p>
                <p className="text-xl font-black text-primary">R$ {userProfile.stats?.totalWagered?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border-white/5">
            <h3 className="text-sm font-black mb-4 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Change Username (Once)</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="New Username" 
                    value={newUsername} 
                    onChange={e => setNewUsername(e.target.value)}
                    disabled={userProfile.hasChangedUsername}
                    className="h-10 bg-black/20"
                  />
                  <Button onClick={handleUpdateUsername} disabled={isUpdating || userProfile.hasChangedUsername} className="h-10 px-4">
                    {isUpdating ? <Loader2 className="animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats and History */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass p-6 rounded-[24px] border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20">
                <Target className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Deposited</p>
                <p className="text-2xl font-black text-white">R$ {userProfile.stats?.totalDeposited?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="glass p-6 rounded-[24px] border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                <TrendingUp className="w-6 h-6 text-red-500 rotate-180" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Withdrawal</p>
                <p className="text-2xl font-black text-white">R$ {userProfile.stats?.totalWithdrawal?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[32px] border-white/5 min-h-[400px]">
            <h3 className="text-xl font-black mb-6 uppercase tracking-wider flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Betting History
            </h3>
            <div className="space-y-4">
              {userProfile.gamesHistory?.slice().reverse().map((game: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${game.type === 'WIN' ? 'bg-success/20 text-success border border-success/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                      {game.game.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{game.game}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(game.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${game.type === 'WIN' ? 'text-success' : 'text-white/40'}`}>
                      {game.type === 'WIN' ? '+' : '-'}R$ {game.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!userProfile.gamesHistory || userProfile.gamesHistory.length === 0) && (
                <div className="h-40 flex items-center justify-center text-muted-foreground">No recent games</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
