
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
          // المتصفح يمنع التشغيل التلقائي بدون تفاعل، سنتعامل مع هذا عبر المستمعين أدناه
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
      <source src="https://cdn.pixabay.com/audio/2025/01/29/audio_d086f6717a.mp3" type="audio/mpeg" />
    </audio>
  );
};
