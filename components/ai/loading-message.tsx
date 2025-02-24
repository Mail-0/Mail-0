import { BotIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const LoadingMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group relative flex cursor-default flex-col overflow-hidden rounded-lg border px-4 py-3",
        "bg-background hover:bg-accent/50",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400">
          <BotIcon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">AI Assistant</span>
          <span className="text-xs text-muted-foreground">Thinking...</span>
        </div>
      </div>
      <div className="pl-10">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.4,
                delay: i * 0.1,
              }}
              className="h-2 w-2 rounded-full bg-blue-200 dark:bg-blue-900/50"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
