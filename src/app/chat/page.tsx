
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, Crown, ShieldCheck, MessageSquare, Dot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FAKE_USERS = [
  'Frosty_Blox', 'Lumine_Dev', 'VoidX_Gamer', 'Ghost_Rider', 'Stellar_YT', 
  'Rex_Official', 'Kone_Ko', 'Valk_Queen', 'Sniper_Elite', 'Shadow_King',
  'Neon_Ninja', 'Hyper_Active', 'Cool_Cat', 'Diamond_Hand', 'Roblox_Pro'
];

const MESSAGES_POOL = [
  "YO I JUST WON 5K ON ROCKET! 🚀",
  "Anyone playing mines? 24 bombs is literally impossible lol",
  "Coinflip is rigged i swear... just lost my last 200",
  "Wait, are we sure Frosty_Blox isn't an AI? He's too fast.",
  "Lol you guys, there's no way we're all AI. Or am I? 🤖",
  "Admin, please add 'Case Battles' mode! That would be insane.",
  "Just cashed out 10x on Rocket let's gooooo",
  "Is anyone actually winning today or is it just me?",
  "Yo Admin, we need a 'Double or Nothing' button in Mines!",
  "I think the Rocket crash follows a pattern... I'm almost certain.",
  "Stop complaining about luck, it's all math guys 😂",
  "Admin, we need more daily rewards! R$ 50 is just for snacks.",
  "I'm 99% sure half of this chat is bots. Prove me wrong.",
  "Does anyone have a strategy for 3 bombs in Mines?",
  "Imagine being a bot and not winning. That would be sad.",
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
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random().toString(36),
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      text: MESSAGES_POOL[Math.floor(Math.random() * MESSAGES_POOL.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setMessages(initial);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      
      // Start typing simulation
      setTypingUser(user);
      
      setTimeout(() => {
        const msg: ChatMessage = {
          id: Math.random().toString(36),
          user: user,
          text: MESSAGES_POOL[Math.floor(Math.random() * MESSAGES_POOL.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, msg].slice(-25));
        setTypingUser(null);
      }, 2000); // Wait 2 seconds while "typing"
      
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChatOnline(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(12, Math.min(25, prev + change));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 h-[calc(100vh-80px)] sm:h-[85vh] flex flex-col pb-24 sm:pb-32">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <span className="font-bold text-sm sm:text-base">Back to Casino</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full border border-primary/20">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs font-black text-primary uppercase">{chatOnline} Players</span>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-purple rounded-[24px] sm:rounded-[40px] border-2 border-primary/20 overflow-hidden flex flex-col relative">
        <div className="p-4 sm:p-6 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
          <h2 className="font-headline text-lg sm:text-xl font-black headline-gradient flex items-center gap-2">
            <MessageSquare className="w-4 h-4 sm:w-5 h-5" /> GLOBAL COMMUNITY
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Live Moderation
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 no-scrollbar"
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
                      <Crown className="w-2.5 h-2.5 text-primary-foreground fill-current" />
                      <span className="text-[9px] font-black text-primary-foreground uppercase">Admin</span>
                    </div>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{msg.user}</span>
                  )}
                  <span className="text-[9px] text-white/20">{msg.time}</span>
                </div>
                <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl max-w-[85%] sm:max-w-[80%] break-words text-sm sm:text-base ${
                  msg.isAdmin 
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {typingUser && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] text-primary/60 italic ml-1"
            >
              <span className="font-bold">{typingUser}</span> is typing
              <div className="flex">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }}><Dot className="w-4 h-4 -mx-1" /></motion.div>
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}><Dot className="w-4 h-4 -mx-1" /></motion.div>
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}><Dot className="w-4 h-4 -mx-1" /></motion.div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-background/40 backdrop-blur-md border-t border-primary/10">
          <div className="relative flex items-center gap-2 sm:gap-3">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Join the conversation..."
              className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl sm:rounded-2xl pl-4 sm:pl-6 pr-14 focus-visible:ring-primary focus-visible:border-primary/50 text-sm sm:text-base"
            />
            <Button 
              onClick={handleSend}
              className="absolute right-1.5 sm:right-2 h-9 w-9 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90 rounded-lg sm:rounded-xl"
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
