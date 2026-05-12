
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          // تأثير التدرج الصوتي (Fade in)
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.25) {
              vol += 0.01;
              if (audioRef.current) audioRef.current.volume = vol;
            } else {
              clearInterval(fadeInterval);
            }
          }, 150);
        }).catch((err) => {
          // المتصفح يمنع التشغيل التلقائي بدون تفاعل
          console.warn("Autoplay blocked. Waiting for user interaction...");
        });
      }
    };

    const handleInteraction = () => {
      playAudio();
      // إزالة المستمعين بمجرد التشغيل لتوفير الموارد
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };

    // مستمعين شاملين لضمان التشغيل فوراً عند أي لمسة
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto" 
      autoPlay
      style={{ display: 'none' }}
    >
      <source src="https://cdn.discordapp.com/attachments/1221933758492442756/1503600270280622120/idoberg-relaxing-cinematic-pads-303218.mp3?ex=6a03f05f&is=6a029edf&hm=aab5cf0804db145b69f03c82d1a10a72903f7c57e42e9b016f330b02bb19421c&" type="audio/mpeg" />
    </audio>
  );
};
