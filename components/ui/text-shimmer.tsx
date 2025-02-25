"use client";

import { useState, useEffect, Children } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LoadingTextProps {
  messages: string[];
  className?: string;
  interval?: number;
  shimmerWidth?: number;
}

export function LoadingText({
  messages,
  className,
  interval = 2,
  shimmerWidth = 2,
}: LoadingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(messages);

  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  const dynamicSpread = messages[currentIndex].length * shimmerWidth;

  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.p
          className={cn(
            "relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
            "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]",
            "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
            "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
          )}
          initial={{ backgroundPosition: "100% center" }}
          animate={{ backgroundPosition: "0% center" }}
          transition={{
            repeat: Infinity,
            duration: interval,
            ease: "linear",
          }}
          style={
            {
              "--spread": `${dynamicSpread}px`,
              backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
            } as React.CSSProperties
          }
        >
          {messages[currentIndex]}
        </motion.p>
      </motion.div>
    </div>
  );
}
