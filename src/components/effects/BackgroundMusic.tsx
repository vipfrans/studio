
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          // التدرج في الصوت ليكون مريحاً
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.2) {
              vol += 0.01;
              if (audioRef.current) audioRef.current.volume = vol;
            } else {
              clearInterval(fadeInterval);
            }
          }, 100);
        }).catch(() => {
          // المتصفحات تمنع التشغيل التلقائي أحياناً
        });
      }
    };

    window.addEventListener('click', playAudio, { once: true });
    window.addEventListener('touchstart', playAudio, { once: true });
    return () => {
      window.removeEventListener('click', playAudio);
      window.removeEventListener('touchstart', playAudio);
    };
  }, []);

  return (
    <audio ref={audioRef} loop preload="auto">
      <source src="https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3" type="audio/mpeg" />
    </audio>
  );
};

