import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLCanvasElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  className?: string;
  width?: number;
  height?: number;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.1,
  color = "#1c9cf0",
  maxOpacity = 0.5,
  className = "",
  width,
  height,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const w = width || canvas.parentElement?.clientWidth || 800;
    const h = height || canvas.parentElement?.clientHeight || 600;

    canvas.width = w;
    canvas.height = h;

    const cols = Math.floor(w / (squareSize + gridGap));
    const rows = Math.floor(h / (squareSize + gridGap));

    const opacities = new Float32Array(cols * rows);
    for (let i = 0; i < opacities.length; i++) {
      opacities[i] = Math.random() * maxOpacity;
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          if (Math.random() < flickerChance) {
            opacities[idx] = Math.random() * maxOpacity;
          }

          ctx.fillStyle = color;
          ctx.globalAlpha = opacities[idx];
          ctx.fillRect(
            i * (squareSize + gridGap),
            j * (squareSize + gridGap),
            squareSize,
            squareSize
          );
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [squareSize, gridGap, flickerChance, color, maxOpacity, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none w-full h-full", className)}
      {...props}
    />
  );
};

export default FlickeringGrid;
