'use client';

import React, { useEffect, useRef } from 'react';
import './AnimatedWallpaper.css';

export default function AnimatedWallpaper() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particlesContainer = particlesRef.current;
    if (!particlesContainer) return;

    // Clear any existing particles to prevent duplication on re-renders
    while (particlesContainer.firstChild) {
      particlesContainer.removeChild(particlesContainer.firstChild);
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (10 + Math.random() * 10) + 's';
      fragment.appendChild(particle);
    }
    particlesContainer.appendChild(fragment);

  }, []);

  return (
    <div className="prodos-wallpaper">
      <div className="grid-overlay"></div>
      <div className="particles" ref={particlesRef}></div>
      <div className="tech-circle">
        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
      </div>
      <div className="logo-container">
        <div className="logo-circle">
          <div className="glow-ring"></div>
          <div className="inner-circle">
            <div className="logo-text">PROD</div>
          </div>
          <div className="deco-element deco-1"></div>
          <div className="deco-element deco-2"></div>
          <div className="deco-element deco-3"></div>
          <div className="deco-element deco-4"></div>
          <div className="subtitle">OPERATING SYSTEM</div>
        </div>
      </div>
      <div className="corner-deco top-left"></div>
      <div className="corner-deco bottom-right"></div>
    </div>
  );
}
