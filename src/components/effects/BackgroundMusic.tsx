
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          // Fade in effect
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.2) {
              vol += 0.01;
              if (audioRef.current) audioRef.current.volume = vol;
            } else {
              clearInterval(fadeInterval);
            }
          }, 200);
        }).catch((err) => {
          console.warn("Audio interaction required to start background music.");
        });
      }
    };

    const handleInteraction = () => {
      playAudio();
      // Remove all listeners after first interaction to save resources
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
      {/* Deep Calm Ambient Music - New Provided Link */}
      <source src="https://cdn.pixabay.com/audio/2025/01/29/audio_d086f6717a.mp3" type="audio/mpeg" />
    </audio>
  );
};
