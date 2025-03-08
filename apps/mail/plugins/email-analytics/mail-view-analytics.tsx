import { PluginDataStorage } from "@/types/plugin";
import { Button } from "@/components/ui/button";
import { ChartBar } from "lucide-react";
import { ResponseTimeData } from ".";
import * as React from "react";

export const MailViewAnalytics = React.memo(
  React.forwardRef<HTMLButtonElement, { data?: any; storage?: PluginDataStorage }>((props, ref) => {
    const email = props.data?.email;
    const [threadStats, setThreadStats] = React.useState<{
      avgResponseTime: number;
      totalMessages: number;
    } | null>(null);

    React.useEffect(() => {
      if (!email || !props.storage) return;

      const loadThreadStats = async () => {
        try {
          const times = (await props.storage?.get<ResponseTimeData[]>("response_times")) || [];
          const threadTimes = times.filter((t) => t.threadId === email.threadId);

          if (threadTimes.length > 0) {
            const avgTime =
              threadTimes.reduce((acc, curr) => acc + curr.responseTime, 0) / threadTimes.length;
            setThreadStats({
              avgResponseTime: Math.round(avgTime),
              totalMessages: threadTimes.length,
            });
          }
        } catch (error) {
          console.error("Error loading thread stats:", error);
        }
      };

      loadThreadStats();
    }, [email, props.storage]);

    if (!email) return null;

    return (
      <Button ref={ref} variant="ghost" size="sm" className="gap-2">
        <ChartBar className="h-4 w-4" />
        <span>
          {threadStats
            ? `Avg Response: ${threadStats.avgResponseTime}h (${threadStats.totalMessages} messages)`
            : "Thread Analytics"}
        </span>
      </Button>
    );
  }),
);
