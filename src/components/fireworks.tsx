import { FC, useEffect, useRef } from 'react';
import styles from '@/styles/fireworks.module.css'

type Color = {
  r: number;
  g: number;
  b: number;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: Color;
  velocity: {
    x: number;
    y: number;
  };
};

const Fireworks:React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let particles: Particle[] = [];
      let particleCount = 50;
      let angle = 0;
      let angleIncrement = Math.PI * 2 / particleCount;

      const draw = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          particles.forEach((particle, index) => {
            if (particle.opacity <= 0) {
              particles.splice(index, 1);
            } else {
              particle.velocity.y += 0.05;
              particle.x += particle.velocity.x;
              particle.y += particle.velocity.y;
              particle.opacity -= 0.01;
              ctx.globalAlpha = particle.opacity;
              ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
            }
          });

          while (particles.length < particleCount) {
            particles.push({
              x: canvas.width / 2,
              y: canvas.height / 2,
              size: Math.random() * 5 + 5,
              opacity: 1,
              color: {
                r: Math.floor(Math.random() * 255),
                g: Math.floor(Math.random() * 255),
                b: Math.floor(Math.random() * 255),
              },
              velocity: {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5,
              },
            });
            angle += angleIncrement;
          }
        }
      };

      const animate = () => {
        draw();
        requestAnimationFrame(animate);
      };

      animate();
    }
  }, []);

  return (
    <div className='flex items-center justify-center'>
       <canvas className={`${styles.canvas}`} ref={canvasRef} width={400} height={400}></canvas>
    </div>
   
  );
};

export default Fireworks;
