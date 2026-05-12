
"use client";

import React, { useEffect, useState, memo } from 'react';

export const SnowParticles = memo(function SnowParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; size: string; opacity: number }>>([]);

  useEffect(() => {
    // 40 particles for optimal performance
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      size: `${Math.random() * 8 + 6}px`, // Large particles
      opacity: Math.random() * 0.7 + 0.3,
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
            filter: 'blur(1.5px)',
            // Enhanced glow with primary theme color hint
            boxShadow: '0 0 15px hsla(268, 100%, 80%, 0.7), 0 0 25px rgba(255, 255, 255, 0.5)',
            willChange: 'transform',
            transform: 'translateZ(0)' 
          }}
        />
      ))}
    </div>
  );
});
