"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThreadSubjectProps {
  subject?: string;
}

export default function ThreadSubject({ subject }: ThreadSubjectProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  // Check if the text is overflowing
  useEffect(() => {
    if (textRef.current) {
      const isClamped = textRef.current.scrollHeight > textRef.current.clientHeight;
      setIsOverflowing(isClamped);
    }
  }, [subject]);

  return (
    <div className="px-4 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span
            ref={textRef}
            className={cn(
              "block font-semibold transition-all duration-200",
              isCollapsed ? "break-words" : "line-clamp-1",
              !subject && "opacity-50",
            )}
          >
            {subject || "(no subject)"}
          </span>
        </div>
        {isOverflowing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 shrink-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
