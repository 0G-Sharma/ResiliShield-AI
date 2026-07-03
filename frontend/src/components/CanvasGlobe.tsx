'useRef';
'useEffect';
'useState';

import React, { useEffect, useRef } from 'react';

export default function CanvasGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = 400;
    let height = canvas.height = 400;

    // Handle resize (dynamic parenting support)
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 400;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle details
    const particleCount = 65;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      color: string;
      size: number;
    }> = [];

    // Initialize 3D points on a sphere
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(Math.random() * 2 - 1); // 0 to PI
      const phi = Math.random() * Math.PI * 2; // 0 to 2PI
      const r = 120; // radius

      particles.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        color: i % 4 === 0 ? '#00FFAA' : i % 3 === 0 ? '#FF0055' : '#00F3FF',
        size: Math.random() * 2 + 1,
      });
    }

    let angleY = 0.005; // Y rotation speed
    let angleX = 0.002; // X rotation speed

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw glowing background radar ring
      ctx.strokeStyle = 'rgba(0, 102, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Rotation matrices
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Project particles to 2D
      const projected: Array<{
        x2d: number;
        y2d: number;
        z3d: number;
        color: string;
        size: number;
      }> = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Save new 3D back to particle
        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Perspective projection
        const cameraDistance = 300;
        const scale = cameraDistance / (cameraDistance - z2);
        const x2d = cx + x1 * scale;
        const y2d = cy + y2 * scale;

        projected.push({ x2d, y2d, z3d: z2, color: p.color, size: p.size * scale });
      }

      // Draw connections/grid lines between close particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          // Compute distance in 3D
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dz = particles[i].z - particles[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 80) {
            // Fade lines based on depth and distance
            const alpha = (1 - dist / 80) * 0.15 * ((p1.z3d + 120) / 240);
            ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.stroke();
          }
        }
      }

      // Draw particles (front ones larger/brighter)
      projected.sort((a, b) => a.z3d - b.z3d); // sort by depth

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.x2d < 0 || p.x2d > width || p.y2d < 0 || p.y2d > height) continue;

        // Calculate opacity based on depth
        const opacity = Math.max(0.1, (p.z3d + 120) / 240);
        ctx.fillStyle = p.color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset
      }

      // Draw latitude/longitude grid rings
      ctx.strokeStyle = 'rgba(0, 102, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Horizontal ring (Equator)
      ctx.beginPath();
      ctx.ellipse(cx, cy, 120, 30, Math.sin(angleY * 2), 0, Math.PI * 2);
      ctx.stroke();

      // Vertical ring (Prime Meridian)
      ctx.beginPath();
      ctx.ellipse(cx, cy, 30, 120, Math.sin(angleX * 2), 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      <div className="absolute inset-0 bg-radial-at-c from-electric-blue/5 via-transparent to-transparent pointer-events-none" />
      <canvas ref={canvasRef} className="max-w-full max-h-full block" />
    </div>
  );
}
