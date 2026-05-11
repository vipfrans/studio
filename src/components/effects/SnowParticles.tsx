
"use client";

import React, { useEffect, useState } from 'react';

export const SnowParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; size: string; opacity: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      size: `${Math.random() * 4 + 2}px`,
      opacity: Math.random() * 0.5 + 0.2,
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
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
};
