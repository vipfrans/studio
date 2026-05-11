
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, Crown, ShieldCheck, MessageSquare, Dot, Reply, X, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useRobux } from '@/context/RobuxContext';

type UserRole = 'ADMIN' | 'VIP' | 'MEMBER' | 'USER';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  text: string;
  createdAt: any;
  replyTo?: {
    username: string;
    text: string;
  } | null;
}

const FAKE_USERS = [
  { username: 'RobloxKing', role: 'VIP' as UserRole },
  { username: 'DiamondDev', role: 'MEMBER' as UserRole },
  { username: 'LumineGamer', role: 'USER' as UserRole },
  { username: 'BloxLord', role: 'VIP' as UserRole },
  { username: 'KoroneFan', role: 'MEMBER' as UserRole }
];

const FAKE_PHRASES = [
  "Wow just won 5k in Rocket!",
  "Mines is so hard today lol",
  "Is there a code?",
  "Good luck everyone!",
  "Someone double up with me in Coinflip",
  "This site is clean",
  "I love the animations"
];

export default function ChatPage() {
  const db = useFirestore();
  const { userProfile, lang } = useRobux();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [fakeMessages, setFakeMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'), limit(50));
  }, [db]);

  const { data: realMessages } = useCollection(messagesQuery) as any;

  // دمج الرسائل الحقيقية مع الوهمية وترتيبها زمنياً
  const allMessages = useMemo(() => {
    const combined = [...(realMessages || []), ...fakeMessages];
    return combined.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || Date.now() / 1000;
      const timeB = b.createdAt?.seconds || Date.now() / 1000;
      return timeA - timeB;
    });
  }, [realMessages, fakeMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages]);

  // محاكاة إرسال رسائل من أشخاص وهميين
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const fakeUser = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
        const phrase = FAKE_PHRASES[Math.floor(Math.random() * FAKE_PHRASES.length)];
        const fakeMsg: ChatMessage = {
          id: 'fake-' + Math.random(),
          userId: 'fake-' + fakeUser.username,
          username: fakeUser.username,
          role: fakeUser.role,
          text: phrase,
          createdAt: { seconds: Date.now() / 1000 }
        };
        setFakeMessages(prev => [...prev, fakeMsg].slice(-20));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !userProfile || !db) return;
    
    await addDoc(collection(db, 'chat_messages'), {
      userId: userProfile.uid,
      username: userProfile.username,
      role: userProfile.role,
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
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 h-[calc(100vh-80px)] sm:h-[85vh] flex flex-col pb-24 sm:pb-32 ${lang === 'AR' ? 'rtl text-right' : ''}`}>
      <div className={`flex items-center justify-between mb-4 ${lang === 'AR' ? 'flex-row-reverse' : ''}`}>
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className={`w-5 h-5 ${lang === 'AR' ? 'rotate-180' : ''}`} />
          <span className="font-bold">{lang === 'EN' ? 'Lobby' : 'الرئيسية'}</span>
        </Link>
        <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase">
            {lang === 'EN' ? 'Real-time chat active' : 'الدردشة نشطة الآن'}
          </span>
        </div>
      </div>

      <div className="flex-1 glass-purple rounded-[32px] border-2 border-primary/20 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {allMessages.map((msg: any) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: msg.userId === userProfile?.uid ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.userId === userProfile?.uid ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-center gap-2 mb-1 ${msg.userId === userProfile?.uid ? (lang === 'AR' ? 'flex-row' : 'flex-row-reverse') : (lang === 'AR' ? 'flex-row-reverse' : 'flex-row')}`}>
                {renderRoleBadge(msg.role)}
                <span className="text-[10px] font-bold text-muted-foreground">{msg.username}</span>
                <button onClick={() => setReplyingTo(msg)} className="opacity-0 hover:opacity-100 p-1 text-primary">
                  <Reply className="w-3 h-3" />
                </button>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${
                msg.userId === userProfile?.uid 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
              }`}>
                {msg.replyTo && (
                  <div className="text-[10px] opacity-60 italic mb-1 border-l-2 border-primary/30 pl-2">
                    {lang === 'EN' ? 'Replying to' : 'رداً على'} {msg.replyTo.username}: {msg.replyTo.text}
                  </div>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-background/60 backdrop-blur-xl border-t border-primary/10">
          {replyingTo && (
            <div className="mb-2 p-2 bg-primary/10 rounded-xl flex items-center justify-between">
              <span className="text-[10px] text-primary">
                {lang === 'EN' ? 'Replying to' : 'رد على'} {replyingTo.username}
              </span>
              <button onClick={() => setReplyingTo(null)}><X className="w-3 h-3" /></button>
            </div>
          )}
          <div className="relative flex gap-2">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'EN' ? "Type your message..." : "اكتب رسالتك..."}
              className="bg-white/5 border-white/10 h-12 rounded-xl"
            />
            <Button onClick={handleSend} className="h-12 w-12 bg-primary rounded-xl">
              <Send className={`w-5 h-5 ${lang === 'AR' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
