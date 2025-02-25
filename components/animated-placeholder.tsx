"use client";

import { TextEffect } from "@/components/ui/text-effect";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

const placeholderSuggestions = [
  "Type to ask about your emails...",
  "Try 'Show me unread emails'...",
  "Ask 'Summarize my inbox'...",
  "Try 'Show me emails from last week'...",
  "Ask 'Show me emails from yesterday'...",
];

interface AnimatedPlaceholderProps {
  isActive?: boolean;
}

export function AnimatedPlaceholder({ isActive = true }: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % placeholderSuggestions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
        <TextEffect key={currentIndex} per="char" preset="fade" speedReveal={0.5}>
          {placeholderSuggestions[currentIndex]}
        </TextEffect>
      </AnimatePresence>
    </motion.div>
  );
}
