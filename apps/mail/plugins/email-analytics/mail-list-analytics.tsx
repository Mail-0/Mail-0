import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PluginDataStorage } from "@/types/plugin";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ResponseTimeData } from ".";
import * as React from "react";

export const MailListAnalytics = React.memo(
  React.forwardRef<HTMLDivElement, { data?: any; storage?: PluginDataStorage }>((props, ref) => {
    const message = props.data?.message;
    const [responseTime, setResponseTime] = React.useState<number | null>(null);

    React.useEffect(() => {
      if (!message || !props.storage) return;

      const calculateAndStoreResponseTime = async () => {
        try {
          // Get existing response times
          const times = (await props.storage?.get<ResponseTimeData[]>("response_times")) || [];

          // Check if we already have data for this message
          const existingData = times.find((t) => t.messageId === message.id);
          if (existingData) {
            setResponseTime(existingData.responseTime);
            return;
          }

          // Calculate response time (example calculation)
          const newResponseTime = message.previousMessageTimestamp
            ? Math.floor(
                (new Date(message.timestamp).getTime() -
                  new Date(message.previousMessageTimestamp).getTime()) /
                  (1000 * 60 * 60),
              )
            : 0;

          // Store the new response time
          const newData: ResponseTimeData = {
            messageId: message.id,
            threadId: message.threadId,
            responseTime: newResponseTime,
            timestamp: new Date().toISOString(),
          };

          await props.storage?.set("response_times", [...times, newData]);
          setResponseTime(newResponseTime);
        } catch (error) {
          console.error("Error calculating response time:", error);
        }
      };

      calculateAndStoreResponseTime();
    }, [message, props.storage]);

    if (!message || responseTime === null) return null;

    return (
      <div ref={ref} className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              <span>{responseTime}h</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Average response time</TooltipContent>
        </Tooltip>
      </div>
    );
  }),
);
