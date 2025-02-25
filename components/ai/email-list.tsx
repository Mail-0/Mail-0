"use client";

import { RefreshCw, Search, LoaderCircle, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface Email {
  id?: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labels?: string[];
  unread?: boolean;
  read?: boolean;
  body?: string;
  hasAttachment?: boolean;
}

interface EmailListProps {
  emails: Email[];
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  title?: string;
  folder?: string;
}

export function EmailListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16" />
      </div>

      <div className="space-y-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
      </div>
    </div>
  );
}

export function EmailList({
  emails,
  className,
  onRefresh,
  isLoading = false,
  title = "Results",
}: EmailListProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const refreshEmailList = () => {
    setIsRefreshing(true);

    if (onRefresh) {
      onRefresh();
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1500);
    } else {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1500);
    }
  };

  const filteredEmails = React.useMemo(() => {
    if (!searchQuery.trim()) return emails;

    const searchTerm = searchQuery.toLowerCase();
    return emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchTerm) ||
        email.from.toLowerCase().includes(searchTerm) ||
        email.body?.toLowerCase().includes(searchTerm) ||
        email.snippet?.toLowerCase().includes(searchTerm),
    );
  }, [emails, searchQuery]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2 rounded-lg border p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("space-y-4", className)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredEmails.length} {filteredEmails.length === 1 ? "email" : "emails"}
          </span>
          <Button variant="ghost" size="icon" onClick={refreshEmailList} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search emails..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-18rem)]" type="scroll">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="mb-2 h-8 w-8 text-muted-foreground" />
            <h4 className="text-lg font-medium">No emails found</h4>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "There are no emails to display"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmails.map((email, index) => (
              <motion.div
                key={email.id || index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                  email.read
                    ? "bg-background hover:bg-accent/50"
                    : "bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate font-medium">{email.from}</div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {email.hasAttachment && (
                        <div className="flex h-5 w-5 items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(email.date).toLocaleDateString()}
                      </span>
                      {!email.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </div>

                  <div className="line-clamp-1 text-sm">{email.subject}</div>
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {email.body || email.snippet}
                  </div>

                  {email.labels && email.labels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {email.labels.map((label) => (
                        <Badge key={label} variant="outline" className="px-1.5 py-0 text-[10px]">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}
