
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, Crown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FAKE_USERS = [
  'Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 
  'Rex_Official', 'Kone_Ko', 'Valk_Queen', 'Sniper_Elite', 'Shadow_King'
];

const MESSAGES_POOL = [
  "YO I JUST WON 5K ON ROCKET!",
  "anyone playing mines? 24 bombs is crazy",
  "coinflip is rigged i swear lol",
  "just cashed out 2x let's goooo",
  "admin add more robux please",
  "good luck everyone",
  "what is the next rocket crash target?",
  "mines is the best game honestly",
  "is anyone winning today?",
  "i lost 200 on coinflip sad",
];

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isAdmin?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatOnline, setChatOnline] = useState(15);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    const initial = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random().toString(36),
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      text: MESSAGES_POOL[Math.floor(Math.random() * MESSAGES_POOL.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setMessages(initial);
  }, []);

  // Simulate incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      const msg: ChatMessage = {
        id: Math.random().toString(36),
        user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
        text: MESSAGES_POOL[Math.floor(Math.random() * MESSAGES_POOL.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, msg].slice(-20));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuating online count
  useEffect(() => {
    const interval = setInterval(() => {
      setChatOnline(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(10, Math.min(20, prev + change));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: 'Admin',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true,
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 h-[85vh] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-primary">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-bold">Back to Casino</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-black text-primary uppercase">{chatOnline} Chatting Now</span>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-purple rounded-[40px] border-2 border-primary/20 overflow-hidden flex flex-col relative">
        <div className="p-6 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
          <h2 className="font-headline text-xl font-black headline-gradient flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> GLOBAL COMMUNITY
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Moderated Chat
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.isAdmin ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary rounded-md shadow-[0_0_15px_rgba(200,153,255,0.6)] border border-white/20">
                      <Crown className="w-3 h-3 text-primary-foreground fill-current" />
                      <span className="text-[10px] font-black text-primary-foreground uppercase">Admin</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{msg.user}</span>
                  )}
                  <span className="text-[10px] text-white/20">{msg.time}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] break-words ${
                  msg.isAdmin 
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-background/40 backdrop-blur-md border-t border-primary/10">
          <div className="relative flex items-center gap-3">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="bg-white/5 border-white/10 h-14 rounded-2xl pl-6 pr-16 focus-visible:ring-primary focus-visible:border-primary/50"
            />
            <Button 
              onClick={handleSend}
              className="absolute right-2 h-10 w-10 bg-primary hover:bg-primary/90 rounded-xl"
              size="icon"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MessageSquare } from 'lucide-react';
