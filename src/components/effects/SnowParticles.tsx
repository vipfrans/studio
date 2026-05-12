
"use client";

import React, { useEffect, useState, memo } from 'react';

export const SnowParticles = memo(function SnowParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; size: string; opacity: number }>>([]);

  useEffect(() => {
    // 40 particles for optimal performance
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      size: `${Math.random() * 6 + 4}px`, // Increased size slightly
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
            filter: 'blur(1px)',
            // Enhanced glow with primary theme color hint
            boxShadow: '0 0 12px hsla(268, 100%, 80%, 0.6), 0 0 20px rgba(255, 255, 255, 0.4)',
            willChange: 'transform',
            transform: 'translateZ(0)' 
          }}
        />
      ))}
    </div>
  );
});
