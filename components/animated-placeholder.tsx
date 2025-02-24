"use client";

import { TextEffect } from "@/components/ui/text-effect";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

const placeholderSuggestions = [
  "Type to ask about your emails...",
  "Try 'Show me unread emails'...",
  "Ask 'Summarize my inbox'...",
];

interface AnimatedPlaceholderProps {
  isActive?: boolean;
}

export function AnimatedPlaceholder({ isActive = true }: AnimatedPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % placeholderSuggestions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait">
      <TextEffect key={currentIndex} per="char" preset="fade" speedReveal={0.5}>
        {placeholderSuggestions[currentIndex]}
      </TextEffect>
    </AnimatePresence>
  );
}
