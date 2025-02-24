"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface EmailStats {
  totalEmails: number;
  topSenders: Array<[string, number]>;
  commonSubjects: string[];
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  suspiciousEmails: Array<{
    subject: string;
    from: string;
    reason: string;
  }>;
  unreadCount: number;
}

interface EmailSummaryProps {
  period: string;
  summary: EmailStats;
  className?: string;
}

export function EmailSummary({ period, summary, className }: EmailSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("space-y-4", className)}
    >
      <h3 className="inline-flex items-center gap-2 text-lg">
        <span className="relative isolate rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-700 ring-1 ring-blue-500/20 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-b before:from-blue-500/5 before:opacity-50 dark:text-blue-300 dark:ring-blue-400/20 dark:before:from-blue-400/10">
          Email Summary
        </span>
        <span className="text-muted-foreground">for the Last {period}</span>
      </h3>

      <ScrollArea className="h-[calc(100vh-20rem)]" type="scroll">
        <div className="space-y-4 p-1">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
                "hover:border-border hover:bg-accent/50",
                "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
                "ring-1 ring-black/5 dark:ring-white/5",
              )}
            >
              <p className="text-sm text-muted-foreground">Total Emails</p>
              <p className="mt-1 text-2xl font-bold">{summary.totalEmails}</p>
            </motion.div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
                "hover:border-border hover:bg-accent/50",
                "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
                "ring-1 ring-black/5 dark:ring-white/5",
              )}
            >
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="mt-1 text-2xl font-bold">{summary.unreadCount}</p>
            </motion.div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
                "hover:border-border hover:bg-accent/50",
                "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
                "ring-1 ring-black/5 dark:ring-white/5",
              )}
            >
              <p className="text-sm text-muted-foreground">Suspicious</p>
              <p className="mt-1 text-2xl font-bold">{summary.suspiciousEmails.length}</p>
            </motion.div>
          </div>

          {/* Top Senders */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
              "hover:border-border hover:bg-accent/50",
              "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
              "ring-1 ring-black/5 dark:ring-white/5",
            )}
          >
            <h4 className="mb-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/20">
              Top Senders
            </h4>
            <div className="space-y-2">
              {summary.topSenders.map(([sender, count], index) => (
                <motion.div
                  key={sender}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-accent/50"
                >
                  <span className="font-medium">{sender}</span>
                  <Badge variant="secondary">{count} emails</Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Common Subjects */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.35 }}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
              "hover:border-border hover:bg-accent/50",
              "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
              "ring-1 ring-black/5 dark:ring-white/5",
            )}
          >
            <h4 className="mb-3 inline-flex rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-700 ring-1 ring-purple-500/20 dark:text-purple-300 dark:ring-purple-400/20">
              Common Subject Words
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.commonSubjects.map((subject, index) => (
                <motion.div
                  key={subject}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15, delay: 0.4 + index * 0.05 }}
                >
                  <Badge variant="outline" className="rounded-full">
                    {subject}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Time Distribution */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.45 }}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
              "hover:border-border hover:bg-accent/50",
              "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
              "ring-1 ring-black/5 dark:ring-white/5",
            )}
          >
            <h4 className="mb-3 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/20">
              Time Distribution
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(summary.timeOfDay).map(([time, count], index) => (
                <motion.div
                  key={time}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.5 + index * 0.05 }}
                  className="rounded-lg bg-accent/50 p-3 text-center"
                >
                  <p className="text-sm capitalize text-muted-foreground">{time}</p>
                  <p className="text-xl font-bold">{count}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Suspicious Emails */}
          {summary.suspiciousEmails.length > 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.55 }}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-transparent p-4 transition-all",
                "hover:border-border hover:bg-accent/50",
                "shadow-[0_1px_3px_theme(colors.black/0.05)] dark:shadow-[0_1px_theme(colors.white/0.07)_inset]",
                "ring-1 ring-black/5 dark:ring-white/5",
              )}
            >
              <h4 className="mb-3 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300 dark:ring-amber-400/20">
                ⚠️ Suspicious Emails
              </h4>
              <div className="space-y-2">
                {summary.suspiciousEmails.map((email, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.6 + index * 0.05 }}
                    className="rounded-lg bg-amber-500/10 p-3 text-amber-900 ring-1 ring-amber-500/20 dark:text-amber-200 dark:ring-amber-400/20"
                  >
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                      From: {email.from}
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      {email.reason}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
