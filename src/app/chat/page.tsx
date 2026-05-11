
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Crown, CheckCircle, MessageSquare, Reply, X, Star, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, query, orderBy, limit, serverTimestamp, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useRobux } from '@/context/RobuxContext';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'ADMIN' | 'VIP' | 'MEMBER' | 'USER';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  text: string;
  avatarUrl?: string;
  createdAt: any;
  replyTo?: {
    username: string;
    text: string;
  } | null;
}

const ROLES: UserRole[] = ['ADMIN', 'VIP', 'MEMBER', 'USER'];

export default function ChatPage() {
  const db = useFirestore();
  const { userProfile, lang } = useRobux();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showRankPicker, setShowRankPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'), limit(50));
  }, [db]);

  const { data: realMessages } = useCollection(messagesQuery) as any;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [realMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    if (val.endsWith('#') && userProfile?.role === 'ADMIN') {
      setShowRankPicker(true);
    } else {
      setShowRankPicker(false);
    }
  };

  const handleRankSelect = (role: string) => {
    setNewMessage(prev => prev + role + ' ');
    setShowRankPicker(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !userProfile || !db) return;

    // معالجة الأمر ;rank
    if (newMessage.startsWith(';rank') && userProfile.role === 'ADMIN') {
      const parts = newMessage.split(' ');
      if (parts.length >= 3) {
        const targetUser = parts[1];
        const role = parts[2].toUpperCase() as UserRole;
        
        if (ROLES.includes(role)) {
          const q = query(collection(db, 'users'), where('usernameLowercase', '==', targetUser.toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            await updateDoc(doc(db, 'users', snap.docs[0].id), { role: role });
            toast({ title: "Rank Updated", description: `${targetUser} is now ${role}` });
          } else {
            toast({ variant: "destructive", title: "Error", description: "User not found" });
          }
        }
      }
      setNewMessage('');
      return;
    }
    
    await addDoc(collection(db, 'chat_messages'), {
      userId: userProfile.uid,
      username: userProfile.username,
      role: userProfile.role,
      avatarUrl: userProfile.avatarUrl || '',
      text: newMessage,
      createdAt: serverTimestamp(),
      replyTo: replyingTo ? { username: replyingTo.username, text: replyingTo.text } : null
    });

    setNewMessage('');
    setReplyingTo(null);
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary rounded-md shadow-[0_0_15px_rgba(200,153,255,0.6)] border border-white/20">
            <Crown className="w-2.5 h-2.5 text-primary-foreground fill-current" />
            <span className="text-[9px] font-black text-primary-foreground uppercase">Admin</span>
          </div>
        );
      case 'VIP':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 rounded-md border border-yellow-500/40">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[8px] font-black text-yellow-400 uppercase">VIP</span>
          </div>
        );
      case 'MEMBER':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 rounded-md border border-emerald-500/40">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/20" />
            <span className="text-[8px] font-black text-emerald-400 uppercase">Member</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 sm:py-12 h-[calc(100vh-80px)] sm:h-[85vh] flex flex-col pb-24 sm:pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <div className={`flex items-center justify-between mb-4 ${lang === 'AR' ? 'flex-row-reverse' : ''}`}>
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className={`w-5 h-5 ${lang === 'AR' ? 'rotate-180' : ''}`} />
          <span className="font-bold">{lang === 'EN' ? 'Lobby' : 'الرئيسية'}</span>
        </Link>
      </div>

      <div className="flex-1 glass-purple rounded-[32px] border-2 border-primary/20 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {realMessages.map((msg: any) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: msg.userId === userProfile?.uid ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 ${msg.userId === userProfile?.uid ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <img src={msg.avatarUrl || `https://picsum.photos/seed/${msg.username}/40/40`} className="w-8 h-8 rounded-xl border border-white/10 shrink-0" alt="Avatar" />
              <div className={`flex flex-col ${msg.userId === userProfile?.uid ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {renderRoleBadge(msg.role)}
                  <span className="text-[10px] font-bold text-muted-foreground">{msg.username}</span>
                  <button onClick={() => setReplyingTo(msg)} className="opacity-40 hover:opacity-100 p-1">
                    <Reply className="w-3 h-3" />
                  </button>
                </div>
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.userId === userProfile?.uid 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                }`}>
                  {msg.replyTo && (
                    <div className="text-[10px] opacity-60 italic mb-1 border-l-2 border-primary/30 pl-2">
                      Replying to {msg.replyTo.username}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-background/60 backdrop-blur-xl border-t border-primary/10 relative">
          <AnimatePresence>
            {showRankPicker && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-full left-4 mb-2 bg-popover border-2 border-primary/30 rounded-xl p-2 z-50 shadow-2xl">
                {ROLES.map(r => (
                  <button key={r} onClick={() => handleRankSelect(r)} className="block w-full text-left px-4 py-2 hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors">
                    {r}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {replyingTo && (
            <div className="mb-2 p-2 bg-primary/10 rounded-xl flex items-center justify-between">
              <span className="text-[10px] text-primary">Replying to {replyingTo.username}</span>
              <button onClick={() => setReplyingTo(null)}><X className="w-3 h-3" /></button>
            </div>
          )}
          <div className="relative flex gap-2">
            <Input 
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'EN' ? "Type message... (;rank name ROLE)" : "اكتب رسالة..."}
              className="bg-white/5 border-white/10 h-12 rounded-xl"
            />
            <Button onClick={handleSend} className="h-12 w-12 bg-primary rounded-xl">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
