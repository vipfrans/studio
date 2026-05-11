
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, Crown, ShieldCheck, MessageSquare, Dot, Reply, X } from 'lucide-react';
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
  "Yo Admin, add a global leaderboard! I want to flex my wins.",
  "Wait, I just saw a message that looked way too human for an AI...",
  "If I lose one more coinflip, I'm going to sleep and never coming back lol",
  "Admin, the rocket animation is fire 🔥 keep it up!",
  "Anyone want to trade some luck? I'm on a 10-game losing streak.",
  "Is it just me or does the rocket always crash when I bet high?",
];

const REPLY_TEMPLATES = [
  "I totally agree with you @{user}!",
  "Are you sure about that? 😂",
  "Wait, @{user} just said something actually smart for once.",
  "LOL @{user} that's so true.",
  "I was literally thinking the same thing!",
  "Admin, did you see what @{user} wrote? Add it!",
  "Bruh, @{user} is definitely a bot, look at that response.",
  "No way @{user}, I just lost on the same thing.",
  "That's a W right there.",
  "Actually, I think @{user} is right about the strategy.",
];

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isAdmin?: boolean;
  replyTo?: {
    user: string;
    text: string;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [chatOnline, setChatOnline] = useState(15);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
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

  // Bot interaction logic
  useEffect(() => {
    const interval = setInterval(() => {
      const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      
      setTypingUser(user);
      
      setTimeout(() => {
        setMessages(prev => {
          const shouldReply = Math.random() > 0.6 && prev.length > 0;
          let text = MESSAGES_POOL[Math.floor(Math.random() * MESSAGES_POOL.length)];
          let replyData = undefined;

          if (shouldReply) {
            const targetMsg = prev[Math.floor(Math.random() * prev.length)];
            const template = REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)];
            text = template.replace('{user}', targetMsg.user);
            replyData = { user: targetMsg.user, text: targetMsg.text };
          }

          const msg: ChatMessage = {
            id: Math.random().toString(36),
            user: user,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            replyTo: replyData,
          };

          return [...prev, msg].slice(-30);
        });
        setTypingUser(null);
      }, 2000); 
      
    }, 6000 + Math.random() * 4000);
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
  }, [messages, typingUser, isAdminTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsAdminTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: 'Admin',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true,
      replyTo: replyingTo ? { user: replyingTo.user, text: replyingTo.text } : undefined,
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    setReplyingTo(null);
    setIsAdminTyping(false);
  };

  const startReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    // Focus input
    const input = document.getElementById('chat-input');
    if (input) input.focus();
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
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 no-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col group ${msg.isAdmin ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-center gap-2 mb-1 ${msg.isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.isAdmin ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary rounded-md shadow-[0_0_15px_rgba(200,153,255,0.6)] border border-white/20">
                      <Crown className="w-2.5 h-2.5 text-primary-foreground fill-current" />
                      <span className="text-[9px] font-black text-primary-foreground uppercase">Admin</span>
                    </div>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{msg.user}</span>
                  )}
                  <span className="text-[9px] text-white/20">{msg.time}</span>
                  
                  {/* Reply Button UI */}
                  <button 
                    onClick={() => startReply(msg)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 rounded-md transition-all text-primary"
                  >
                    <Reply className="w-3 h-3 sm:w-4 h-4" />
                  </button>
                </div>

                <div className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl max-w-[85%] sm:max-w-[80%] break-words text-sm sm:text-base flex flex-col gap-1.5 ${
                  msg.isAdmin 
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-none shadow-[0_4px_20px_rgba(200,153,255,0.3)]' 
                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                }`}>
                  {msg.replyTo && (
                    <div className={`text-[10px] sm:text-xs py-1 px-2 rounded-lg border-l-2 mb-1 ${
                      msg.isAdmin 
                        ? 'bg-black/10 border-white/40 text-white/70' 
                        : 'bg-white/5 border-primary/50 text-muted-foreground'
                    }`}>
                      <span className="font-black block uppercase text-[8px] opacity-70">
                        Replying to {msg.replyTo.user}
                      </span>
                      <p className="line-clamp-1 italic">{msg.replyTo.text}</p>
                    </div>
                  )}
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {(typingUser || isAdminTyping) && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] text-primary/60 italic ml-1"
            >
              <span className="font-bold">{isAdminTyping ? 'Admin' : typingUser}</span> is typing
              <div className="flex">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }}><Dot className="w-4 h-4 -mx-1" /></motion.div>
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}><Dot className="w-4 h-4 -mx-1" /></motion.div>
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}><Dot className="w-4 h-4 -mx-1" /></motion.div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-background/60 backdrop-blur-xl border-t border-primary/10">
          <AnimatePresence>
            {replyingTo && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mb-3 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between"
              >
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="text-[9px] font-black text-primary uppercase">Replying to {replyingTo.user}</span>
                  <p className="text-xs text-muted-foreground truncate">{replyingTo.text}</p>
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-primary" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-2 sm:gap-3">
            <Input 
              id="chat-input"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={replyingTo ? "Write your reply..." : "Join the conversation..."}
              className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl sm:rounded-2xl pl-4 sm:pl-6 pr-14 focus-visible:ring-primary focus-visible:border-primary/50 text-sm sm:text-base"
            />
            <Button 
              onClick={handleSend}
              className="absolute right-1.5 sm:right-2 h-9 w-9 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90 rounded-lg sm:rounded-xl shadow-[0_0_15px_rgba(200,153,255,0.4)]"
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
