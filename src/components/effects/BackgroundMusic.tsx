
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.15) {
              vol += 0.005;
              if (audioRef.current) audioRef.current.volume = vol;
            } else {
              clearInterval(fadeInterval);
            }
          }, 150);
        }).catch(() => {
          // Interaction required
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
      <source src="https://cdn.pixabay.com/audio/2024/02/22/audio_651088f1b9.mp3" type="audio/mpeg" />
    </audio>
  );
};
