
"use client";

import React, { useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3; // مستوى صوت هادئ
        audioRef.current.play().catch(() => {
          // المتصفحات تمنع التشغيل التلقائي أحياناً، سيتم المحاولة عند أول ضغطة
        });
      }
    };

    window.addEventListener('click', playAudio, { once: true });
    return () => window.removeEventListener('click', playAudio);
  }, []);

  return (
    <audio ref={audioRef} loop>
      <source src="https://cdn.pixabay.com/audio/2022/02/10/audio_fc069a7170.mp3" type="audio/mpeg" />
    </audio>
  );
};
