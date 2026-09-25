"use client";

import React from "react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STAGGER = 0.032;

export const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className, center = false }) => {
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden select-none", className)}
      style={{ lineHeight: 0.85 }}
    >
      {/* Top text slides UP on hover */}
      <div className="flex">
        {children.split("").map((l, i) => (
          <motion.span
            key={`top-${i}`}
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" },
            }}
            transition={{
              ease: [0.33, 1, 0.68, 1],
              duration: 0.3,
              delay: center ? STAGGER * Math.abs(i - (children.length - 1) / 2) : STAGGER * i,
            }}
            className="inline-block"
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>

      {/* Bottom text slides IN from bottom */}
      <div className="absolute inset-0 flex">
        {children.split("").map((l, i) => (
          <motion.span
            key={`bottom-${i}`}
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 },
            }}
            transition={{
              ease: [0.33, 1, 0.68, 1],
              duration: 0.3,
              delay: center ? STAGGER * Math.abs(i - (children.length - 1) / 2) : STAGGER * i,
            }}
            className="inline-block text-white font-bold"
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
    </motion.span>
  );
};

export default TextRoll;
