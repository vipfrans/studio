
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        // نستخدم المقطوعة الهادئة والسينمائية المطلوبة من Pixabay
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.15) { // حجم صوت هادئ جداً للخلفية
              vol += 0.01;
              if (audioRef.current) audioRef.current.volume = vol;
            } else {
              clearInterval(fadeInterval);
            }
          }, 200);
        }).catch((err) => {
          console.warn("Audio play blocked, waiting for more interaction.", err);
        });
      }
    };

    const handleInteraction = () => {
      playAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return (
    <audio ref={audioRef} loop preload="auto">
      {/* Musical Relaxing Cinematic Pads - Pixabay */}
      <source src="https://cdn.pixabay.com/audio/2025/01/30/audio_f3b5c46e01.mp3" type="audio/mpeg" />
    </audio>
  );
};
