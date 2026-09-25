import React from 'react';
import { cn } from '@/lib/utils';

interface TextRollProps {
  children: string;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
}

/**
 * TextRoll — A sleek cybernetic typography component that rolls text vertically
 * on hover or active state, strictly bound to Plus Jakarta Sans.
 */
export const TextRoll: React.FC<TextRollProps> = ({
  children,
  className,
  activeClassName,
  isActive = false,
}) => {
  return (
    <span
      className={cn(
        "relative inline-flex flex-col overflow-hidden h-[1.3em] leading-[1.3em] font-['Plus_Jakarta_Sans'] tracking-tight select-none",
        className
      )}
    >
      {/* Primary visible text label */}
      <span
        className={cn(
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu",
          isActive ? "-translate-y-full" : "group-hover:-translate-y-full"
        )}
      >
        {children}
      </span>

      {/* Secondary text that rolls in from below */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-full left-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu text-white font-bold",
          activeClassName,
          isActive ? "-translate-y-full" : "group-hover:-translate-y-full"
        )}
      >
        {children}
      </span>
    </span>
  );
};

export default TextRoll;
