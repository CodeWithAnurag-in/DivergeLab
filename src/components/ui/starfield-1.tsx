"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface StarfieldProps {
  quantity?: number;
  speed?: number;
  starColor?: string;
  bgColor?: string;
  mouseAdjust?: boolean;
  clickToWarp?: boolean;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

export function Starfield({
  quantity = 350,
  speed = 0.5,
  starColor = "rgba(255, 255, 255, 0.95)",
  bgColor = "#000000",
  mouseAdjust = true,
  clickToWarp = false,
  className,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: false for direct GPU blit on black background
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let maxDepth = 1000;
    let currentSpeed = speed;
    const warpSpeed = speed * 3.5;

    const stars: Star[] = [];

    const initStars = () => {
      stars.length = 0;
      const curWidth = width || window.innerWidth || 1920;
      const curHeight = height || window.innerHeight || 1080;
      maxDepth = Math.max(curWidth, curHeight, 1000);
      for (let i = 0; i < quantity; i++) {
        const x = (Math.random() - 0.5) * curWidth * 2;
        const y = (Math.random() - 0.5) * curHeight * 2;
        const z = Math.random() * maxDepth + 1;
        stars.push({ x, y, z, pz: z });
      }
    };

    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let offsetX = 0;
    let offsetY = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      if (width !== newWidth || height !== newHeight) {
        width = newWidth;
        height = newHeight;
        maxDepth = Math.max(width, height, 1000);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (stars.length === 0) {
          initStars();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseAdjust) return;
      targetOffsetX = (e.clientX - width / 2) * 0.12;
      targetOffsetY = (e.clientY - height / 2) * 0.12;
    };

    const handleMouseDown = () => {
      if (clickToWarp) {
        currentSpeed = warpSpeed;
      }
    };

    const handleMouseUp = () => {
      if (clickToWarp) {
        currentSpeed = speed;
      }
    };

    if (mouseAdjust) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
    if (clickToWarp) {
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("resize", resize);
    resize();
    initStars();

    const update = () => {
      if (mouseAdjust) {
        offsetX += (targetOffsetX - offsetX) * 0.05;
        offsetY += (targetOffsetY - offsetY) * 0.05;
      }

      const velocity = currentSpeed * 7;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.pz = star.z;
        star.z -= velocity;

        if (star.z <= 1) {
          star.z = maxDepth;
          star.pz = maxDepth;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + offsetX;
      const cy = height / 2 + offsetY;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        const k = 240 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px < 0 || px >= width || py < 0 || py >= height) {
          continue;
        }

        const pk = 240 / star.pz;
        const prevX = star.x * pk + cx;
        const prevY = star.y * pk + cy;

        const depthRatio = Math.max(0, Math.min(1, 1 - star.z / maxDepth));
        const alpha = Math.min(1, 0.45 + depthRatio * 0.55);
        const radius = Math.max(0.9, depthRatio * 2.8);

        // Soft halo glow for closer stars
        if (depthRatio > 0.55) {
          ctx.fillStyle = `rgba(255, 255, 255, ${((depthRatio - 0.55) * 0.35).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Luminous star particle core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // High-speed streak / velocity trail with smooth rounded cap
        ctx.strokeStyle = `rgba(255, 255, 255, ${(alpha * 0.85).toFixed(2)})`;
        ctx.lineWidth = Math.max(0.65, depthRatio * 2.0);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    };

    // Continuous 60+ FPS animation loop - NEVER pauses during scroll
    const animate = () => {
      update();
      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (mouseAdjust) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (clickToWarp) {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [quantity, speed, starColor, bgColor, mouseAdjust, clickToWarp]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-0 transform-gpu will-change-transform [contain:paint]",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="block size-full pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default Starfield;
