"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { motion } from "motion/react";
import * as React from "react";

interface EmailListProps {
  folder: string;
  emails: Array<{
    subject: string;
    from: string;
    date: string;
    snippet: string;
    labels?: string[];
  }>;
  className?: string;
}

function EmailLabels({ labels }: { labels?: string[] }) {
  if (!labels?.length) return null;

  const visibleLabels = labels.filter(
    (label) => !["unread", "inbox"].includes(label.toLowerCase()),
  );

  if (!visibleLabels.length) return null;

  return (
    <div className="mt-1.5 flex select-none items-center gap-2">
      {visibleLabels.map((label) => (
        <Badge key={label} className="rounded-full" variant="secondary">
          <p className="text-xs font-medium lowercase">
            {label.replace(/^category_/i, "").replace(/_/g, " ")}
          </p>
        </Badge>
      ))}
    </div>
  );
}

export function EmailList({ folder, emails, className }: EmailListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("space-y-4", className)}
    >
      <h3 className="inline-flex items-center gap-2 text-lg">
        <span className="relative isolate rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-500/20 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-b before:from-emerald-500/5 before:opacity-50 dark:text-emerald-300 dark:ring-emerald-400/20 dark:before:from-emerald-400/10">
          {emails.length} Emails
        </span>
        <span className="text-muted-foreground">in {folder}</span>
      </h3>

      <ScrollArea className="h-[calc(100vh-20rem)]" type="scroll">
        <div className="space-y-2 p-1">
          {emails.map((email, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.05 }}
              className={cn(
                "group relative flex cursor-pointer flex-col items-start overflow-clip rounded-lg border border-transparent px-4 py-3 text-left text-sm transition-all",
                "hover:border-border hover:bg-accent hover:opacity-100",
                "opacity-90",
                "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
                "ring-1 ring-black/5 dark:ring-white/5",
                "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-b before:from-black/5 before:opacity-50 before:transition-opacity dark:before:from-white/10",
                "hover:before:opacity-100",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-md flex items-baseline gap-1 font-medium group-hover:opacity-100">
                    {email.from.split("@")[0]}
                    <span className="text-xs text-muted-foreground">
                      {email.from.split("@")[1]}
                    </span>
                  </p>
                </div>
                <time className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(email.date)}
                </time>
              </div>

              <div className="mt-1 space-y-1">
                <p className="line-clamp-1 font-medium text-primary">{email.subject}</p>
                {email.snippet && (
                  <p className="line-clamp-2 text-sm text-muted-foreground/80">{email.snippet}</p>
                )}
              </div>

              <EmailLabels labels={email.labels} />
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
