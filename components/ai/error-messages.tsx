"use client";

import { RefreshCcw, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface ErrorMessageProps {
  message: string;
  icon?: React.ReactNode;
  variant?: "warning" | "error";
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, icon, variant = "warning" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3",
        "border bg-background transition-colors",
        variant === "warning" && "text-amber-900 dark:text-amber-400",
        variant === "error" && "text-red-900 dark:text-red-400",
      )}
    >
      <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
        {icon}
      </motion.div>
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

export const ConnectionError: React.FC = () => (
  <ErrorMessage
    message="Hmm, can't access your emails right now. Try refreshing - that usually fixes it."
    icon={<RefreshCcw className="h-4 w-4" />}
  />
);

export const AuthError: React.FC = () => (
  <ErrorMessage
    message="Lost connection to your emails. Quick refresh should fix it."
    icon={<RefreshCcw className="h-4 w-4" />}
  />
);

export const GenericError: React.FC = () => (
  <ErrorMessage
    message="Sorry, I encountered an error. Please try again."
    icon={<AlertCircle className="h-4 w-4" />}
    variant="error"
  />
);
