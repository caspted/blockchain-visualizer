'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

const STAR_COLORS = [
  'rgba(255, 255, 255,',      // white
  'rgba(0, 240, 255,',         // cyan
  'rgba(168, 85, 247,',        // purple
  'rgba(59, 130, 246,',        // blue
  'rgba(236, 72, 153,',        // pink
];

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 4000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.3,
        speed: Math.random() * 0.15 + 0.02,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.random() < 0.75 ? 0 : Math.floor(Math.random() * STAR_COLORS.length)],
      }));
    };

    const spawnShootingStar = () => {
      if (shootingStars.length >= 2) return;
      const colors = ['rgba(0, 240, 255,', 'rgba(168, 85, 247,', 'rgba(236, 72, 153,'];
      shootingStars.push({
        x: Math.random() * canvas.width * 0.8,
        y: Math.random() * canvas.height * 0.3,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 6 + 4,
        angle: (Math.random() * 30 + 15) * (Math.PI / 180),
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 60 + 40,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const drawNebula = () => {
      // Purple nebula — top-left
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.25, 0,
        canvas.width * 0.15, canvas.height * 0.25, canvas.width * 0.35
      );
      g1.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
      g1.addColorStop(0.5, 'rgba(168, 85, 247, 0.015)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan nebula — bottom-right
      const g2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.7, 0,
        canvas.width * 0.8, canvas.height * 0.7, canvas.width * 0.4
      );
      g2.addColorStop(0, 'rgba(0, 240, 255, 0.03)');
      g2.addColorStop(0.5, 'rgba(0, 240, 255, 0.01)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue nebula — center (breathing)
      const breathe = Math.sin(time * 0.003) * 0.01 + 0.02;
      const g3 = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.3
      );
      g3.addColorStop(0, `rgba(59, 130, 246, ${breathe})`);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawStars = () => {
      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.4 + 0.6;
        const alpha = star.opacity * twinkle;

        // Glow for larger/colored stars
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color} ${alpha * 0.1})`;
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color} ${alpha})`;
        ctx.fill();

        // Drift
        star.y += star.speed;
        if (star.y > canvas.height + 5) {
          star.y = -5;
          star.x = Math.random() * canvas.width;
        }
      }
    };

    const drawShootingStars = () => {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life++;
        ss.opacity = 1 - (ss.life / ss.maxLife);

        if (ss.life >= ss.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `${ss.color} 0)`);
        grad.addColorStop(0.6, `${ss.color} ${ss.opacity * 0.4})`);
        grad.addColorStop(1, `${ss.color} ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `${ss.color} ${ss.opacity})`;
        ctx.fill();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
      }
    };

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawNebula();
      drawStars();
      drawShootingStars();

      // Spawn shooting stars randomly
      if (Math.random() < 0.008) {
        spawnShootingStar();
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #030014 0%, #0d0628 40%, #020a1a 100%)' }}
      aria-hidden="true"
    />
  );
}
