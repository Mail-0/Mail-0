"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";
import { Markdown } from "@/components/ai/markdown";
import { BotIcon, UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const TextStreamMessage = ({ content }: { content: StreamableValue }) => {
  const [text] = useStreamableValue(content);

  return (
    <motion.div
      className={cn(
        "group relative flex cursor-default flex-col overflow-hidden rounded-lg border px-4 py-3 transition-all",
        "bg-background hover:bg-accent/50",
      )}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400">
          <BotIcon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">AI Assistant</span>
          <span className="text-xs text-muted-foreground">Just now</span>
        </div>
      </div>
      <div className="pl-10 text-sm text-muted-foreground">
        <Markdown>{text}</Markdown>
      </div>
    </motion.div>
  );
};

export const Message = ({
  role,
  content,
}: {
  role: "assistant" | "user";
  content: string | ReactNode;
}) => {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      className={cn(
        "group relative flex cursor-default flex-col overflow-hidden rounded-lg border px-4 py-3 transition-all",
        "bg-background hover:bg-accent/50",
        !isAssistant && "bg-accent/30",
      )}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
            isAssistant
              ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400"
              : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400",
          )}
        >
          {isAssistant ? <BotIcon className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{isAssistant ? "AI Assistant" : "You"}</span>
          <span className="text-xs text-muted-foreground">Just now</span>
        </div>
      </div>
      <div className="pl-10 text-sm text-muted-foreground">
        {typeof content === "string" ? <Markdown>{content}</Markdown> : content}
      </div>
    </motion.div>
  );
};
