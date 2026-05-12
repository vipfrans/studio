
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        // نستخدم رابط موسيقى هادئة جداً ومستقرة (Deep Calm Ambient)
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
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
          console.warn("Audio play blocked, waiting for more interaction.", err);
        });
      }
    };

    // الاستماع لأي تفاعل في الموقع لبدء الموسيقى (بسبب قيود المتصفحات)
    const handleInteraction = () => {
      playAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };
  }, []);

  return (
    <audio ref={audioRef} loop preload="auto">
      {/* موسيقى Ambient هادئة جداً للنوم والراحة النفسية */}
      <source src="https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a7315b.mp3" type="audio/mpeg" />
    </audio>
  );
};
