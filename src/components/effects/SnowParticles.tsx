
"use client";

import React, { useEffect, useState } from 'react';

export const SnowParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; size: string; opacity: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      size: `${Math.random() * 6 + 4}px`, // تكبير الحجم قليلاً
      opacity: Math.random() * 0.6 + 0.3,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-white rounded-full animate-snow-fall"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            filter: 'blur(1px) drop-shadow(0 0 8px rgba(200, 153, 255, 0.8))', // إضافة توهج مكثف
            boxShadow: '0 0 12px rgba(255, 255, 255, 0.6)'
          }}
        />
      ))}
    </div>
  );
};
