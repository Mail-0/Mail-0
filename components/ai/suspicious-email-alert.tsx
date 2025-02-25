"use client";

import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface SuspiciousEmail {
  subject: string;
  from: string;
  reason: string;
}

interface SuspiciousEmailAlertProps {
  emails: SuspiciousEmail[];
  totalScanned: number;
  className?: string;
}

export function SuspiciousEmailAlert({
  emails,
  totalScanned,
  className,
}: SuspiciousEmailAlertProps) {
  const riskLevel = emails.length > 5 ? "high" : emails.length > 0 ? "medium" : "safe";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("space-y-3", className)}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {riskLevel === "safe" ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          ) : riskLevel === "medium" ? (
            <Shield className="h-5 w-5 text-amber-500" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-red-500" />
          )}
          <h3 className="text-lg font-semibold">Security Scan Results</h3>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={riskLevel === "safe" ? "default" : "destructive"}
            className="rounded-full px-3 py-1"
          >
            {emails.length} suspicious {emails.length === 1 ? "email" : "emails"} detected
          </Badge>
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            out of {totalScanned} scanned
          </span>
        </div>
      </div>

      <ScrollArea className="h-auto max-h-[calc(100vh-24rem)]" type="scroll">
        <div className="space-y-2 p-1">
          {emails.map((email, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                "group relative overflow-hidden rounded-lg p-3 transition-all",
                "bg-destructive/5 hover:bg-destructive/10",
                "ring-1 ring-destructive/10",
              )}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-destructive" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-destructive">{email.subject}</p>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">From: {email.from}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {email.reason.split(";").map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="bg-background/50 text-xs">
                        {reason.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {emails.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2 py-4 text-center"
            >
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              <h4 className="text-base font-medium">All Clear!</h4>
              <p className="text-sm text-muted-foreground">
                No suspicious emails were detected in your recent messages.
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
