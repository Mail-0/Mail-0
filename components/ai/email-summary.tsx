"use client";

import { BarChart3, Calendar, UsersRound, Mail, MailOpen, Clock, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  unreadCount: number;
}

interface EmailSummaryProps {
  period: string;
  summary: EmailStats;
  className?: string;
}

export function EmailSummary({ period, summary, className }: EmailSummaryProps) {
  const [activeTab, setActiveTab] = React.useState("overview");

  // Calculate email distribution percentages
  const totalTimeDistribution = Object.values(summary.timeOfDay).reduce((a, b) => a + b, 0);
  const timeDistributionPercentages = {
    morning: totalTimeDistribution
      ? Math.round((summary.timeOfDay.morning / totalTimeDistribution) * 100)
      : 0,
    afternoon: totalTimeDistribution
      ? Math.round((summary.timeOfDay.afternoon / totalTimeDistribution) * 100)
      : 0,
    evening: totalTimeDistribution
      ? Math.round((summary.timeOfDay.evening / totalTimeDistribution) * 100)
      : 0,
  };

  // Calculate read/unread percentages
  const readPercentage = summary.totalEmails
    ? Math.round(((summary.totalEmails - summary.unreadCount) / summary.totalEmails) * 100)
    : 0;
  const unreadPercentage = 100 - readPercentage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("space-y-4", className)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="inline-flex items-center gap-2 text-lg">
          <span className="relative isolate rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-700 ring-1 ring-blue-500/20 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-b before:from-blue-500/5 before:opacity-50 dark:text-blue-300 dark:ring-blue-400/20 dark:before:from-blue-400/10">
            Email Summary
          </span>
          <span className="text-muted-foreground">for the Last {period}</span>
        </h3>

        <div className="mt-2 sm:mt-0">
          <Button variant="outline" size="sm" className="text-xs">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="senders" className="flex items-center gap-1">
            <UsersRound className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Senders</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Time</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-24rem)]" type="scroll">
          <div className="p-1">
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Emails
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-2xl font-bold">{summary.totalEmails}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Unread
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MailOpen className="mr-2 h-4 w-4 text-amber-500" />
                      <span className="text-2xl font-bold">{summary.unreadCount}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Read/Unread Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Read vs Unread</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Read ({summary.totalEmails - summary.unreadCount})</span>
                    <span>Unread ({summary.unreadCount})</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-blue-500" style={{ width: `${readPercentage}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{readPercentage}%</span>
                    <span>{unreadPercentage}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Common Subject Words */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Common Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {summary.commonSubjects.map((subject) => (
                      <Badge key={subject} variant="outline" className="rounded-full">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="senders" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top Senders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.topSenders.map(([sender, count]) => {
                      const percentage = Math.round((count / summary.totalEmails) * 100);
                      return (
                        <div key={sender} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{sender}</span>
                            <span className="text-sm text-muted-foreground">
                              {count} emails ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              View emails
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Email Distribution by Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Morning */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-amber-500" />
                          <span>Morning (Before noon)</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {summary.timeOfDay.morning} emails
                        </span>
                      </div>
                      <Progress
                        value={timeDistributionPercentages.morning}
                        className="h-2"
                        indicatorClassName="bg-amber-500"
                      />
                      <div className="text-right text-xs text-muted-foreground">
                        {timeDistributionPercentages.morning}%
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-blue-500" />
                          <span>Afternoon (12pm - 5pm)</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {summary.timeOfDay.afternoon} emails
                        </span>
                      </div>
                      <Progress
                        value={timeDistributionPercentages.afternoon}
                        className="h-2"
                        indicatorClassName="bg-blue-500"
                      />
                      <div className="text-right text-xs text-muted-foreground">
                        {timeDistributionPercentages.afternoon}%
                      </div>
                    </div>

                    {/* Evening */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full bg-purple-500" />
                          <span>Evening (After 5pm)</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {summary.timeOfDay.evening} emails
                        </span>
                      </div>
                      <Progress
                        value={timeDistributionPercentages.evening}
                        className="h-2"
                        indicatorClassName="bg-purple-500"
                      />
                      <div className="text-right text-xs text-muted-foreground">
                        {timeDistributionPercentages.evening}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </motion.div>
  );
}
