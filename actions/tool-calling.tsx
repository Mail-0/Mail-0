import { createAI, createStreamableValue, getMutableAIState, streamUI } from "ai/rsc";
import { Message, TextStreamMessage } from "@/components/ai/messages";
import { EmailSummary } from "@/components/ai/email-summary";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { EmailList } from "@/components/ai/email-list";
import { fetchEmails } from "@/actions/fetch";
import { CoreMessage, generateId } from "ai";
import { openai } from "@ai-sdk/openai";
import type { ReactNode } from "react";
import * as React from "react";
import { z } from "zod";

interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labels: Array<{
    id: string;
    name: string;
  }>;
}

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

interface InitialThread {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  sender: {
    name: string;
    email: string;
  };
  receivedOn: string;
  unread: boolean;
}

// Helper function to analyze emails
function analyzeEmails(emails: EmailData[]): EmailStats {
  console.log("📊 Starting email analysis...", { totalEmails: emails.length });
  const stats: EmailStats = {
    totalEmails: emails.length,
    topSenders: [],
    commonSubjects: [],
    timeOfDay: { morning: 0, afternoon: 0, evening: 0 },
    suspiciousEmails: [],
    unreadCount: 0,
  };

  const senderCount = new Map<string, number>();

  const wordCount = new Map<string, number>();

  const suspiciousKeywords = [
    "urgent",
    "account suspended",
    "verify account",
    "lottery",
    "winner",
    "inheritance",
    "bank transfer",
    "cryptocurrency",
    "investment opportunity",
    "password expired",
    "security alert",
  ];

  const suspiciousTLDs = [".xyz", ".tk", ".ml", ".ga", ".cf"];

  for (const email of emails) {
    // Log suspicious patterns found
    const suspiciousPatterns = [];
    const sender = email.from;
    senderCount.set(sender, (senderCount.get(sender) || 0) + 1);
    const words = email.subject
      .toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3);

    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
    // Spam/Suspicious detection
    const subjectLower = email.subject.toLowerCase();
    const fromLower = email.from.toLowerCase();
    // Check for suspicious keywords in subject
    const foundKeywords = suspiciousKeywords.filter((keyword) =>
      subjectLower.includes(keyword.toLowerCase()),
    );

    if (foundKeywords.length > 0) {
      suspiciousPatterns.push(`Keywords found: ${foundKeywords.join(", ")}`);
    }
    // Check for suspicious TLDs
    const hasSuspiciousTLD = suspiciousTLDs.some((tld) => fromLower.endsWith(tld));
    if (hasSuspiciousTLD) {
      suspiciousPatterns.push(`Suspicious TLD detected in: ${fromLower}`);
    }

    // Check for mismatched sender name and domain
    const [displayName, emailAddress] = email.from.split("<").map((s) => s.trim());
    const domainPart = emailAddress?.split("@")[1]?.replace(">", "");

    const mismatchedSender =
      displayName &&
      domainPart &&
      !displayName.toLowerCase().includes(domainPart.split(".")[0].toLowerCase());

    if (mismatchedSender) {
      suspiciousPatterns.push(`Mismatched sender: ${displayName} vs ${domainPart}`);
    }

    if (suspiciousPatterns.length > 0) {
      console.log("⚠️ Suspicious email detected:", {
        subject: email.subject,
        from: email.from,
        patterns: suspiciousPatterns,
      });

      stats.suspiciousEmails.push({
        subject: email.subject,
        from: email.from,
        reason: suspiciousPatterns.join("; "),
      });
    }

    try {
      const hour = new Date(email.date).getHours();

      if (hour < 12) stats.timeOfDay.morning++;
      else if (hour < 17) stats.timeOfDay.afternoon++;
      else stats.timeOfDay.evening++;
    } catch (error) {
      console.warn("⚠️ Invalid date format:", { date: email.date, error });
    }

    // Count unread emails
    if (email.labels?.some((label) => label.name === "UNREAD")) {
      stats.unreadCount++;
    }
  }

  stats.topSenders = Array.from(senderCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  stats.commonSubjects = Array.from(wordCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  console.log("📊 Analysis complete:", {
    totalEmails: stats.totalEmails,
    unreadCount: stats.unreadCount,
    suspiciousCount: stats.suspiciousEmails.length,
    timeDistribution: stats.timeOfDay,
  });

  return stats;
}

const sendMessage = async (message: string) => {
  "use server";

  console.log("🚀 Processing new message:", { message });

  const messages = getMutableAIState<typeof AI>("messages");

  messages.update([...(messages.get() as CoreMessage[]), { role: "user", content: message }]);

  const contentStream = createStreamableValue("");

  const textComponent = <TextStreamMessage content={contentStream.value} />;

  try {
    const { value: stream } = await streamUI({
      model: openai("gpt-4o-mini-2024-07-18"),
      system: `
      You are a friendly email assistant. Help users manage and understand their emails.
      When users ask to see or fetch their emails with time periods (like "weekly", "monthly", "this week", "last month", etc), use the summarizeEmails tool.
      When users ask to see emails without mentioning time periods, use the fetchEmails tool.
      When users ask to see their inbox, use the fetchEmails tool.

      Examples:
      - "Show me my weekly emails" -> use summarizeEmails with period="week"
      - "Show me my emails from this week" -> use summarizeEmails with period="week"
      - "Show me my recent emails" -> use fetchEmails
      - "Show me my inbox" -> use fetchEmails`,
      messages: messages.get() as CoreMessage[],
      text: async function* ({ content, done }) {
        if (done) {
          messages.done([...(messages.get() as CoreMessage[]), { role: "assistant", content }]);
          contentStream.done();
        } else {
          contentStream.update(content);
        }

        return textComponent;
      },
      tools: {
        fetchEmails: {
          description: "Fetch emails from the inbox",
          parameters: z.object({
            folder: z.string().optional().describe("fetch emails"),
            max: z.string().optional().describe("Maximum number of emails to fetch"),
          }),
          generate: async function* ({ folder = "inbox", max = "5" }) {
            try {
              yield (
                <Message
                  role="assistant"
                  content={<TextShimmer duration={1.5}>Fetching your recent emails...</TextShimmer>}
                />
              );

              const response = await fetchEmails({ folder, max });

              if (!response?.threads?.length) {
                return (
                  <Message role="assistant" content="No emails found in the specified folder." />
                );
              }

              const emails = response.threads.map((thread: InitialThread) => ({
                subject: thread.subject,
                from: thread.sender.email,
                date: thread.receivedOn,
                snippet: thread.title,
              }));

              return (
                <Message role="assistant" content={<EmailList folder={folder} emails={emails} />} />
              );
            } catch (error: any) {
              console.error("❌ Error details:", error);

              if (error.message === "Unauthorized") {
                return <Message role="assistant" content="Please sign in to access your emails." />;
              }
              if (error.message === "Unauthorized, reconnect") {
                return (
                  <Message role="assistant" content="Please connect an email account first." />
                );
              }

              return (
                <Message
                  role="assistant"
                  content="Sorry, there was an error fetching your emails. Please try again."
                />
              );
            }
          },
        },
        summarizeEmails: {
          description: "Get a summary of emails from a specific time period",
          parameters: z.object({
            period: z
              .string()
              .describe('Time period to summarize emails for (e.g., "week", "month")'),
          }),
          generate: async function* ({ period }) {
            try {
              yield (
                <Message
                  role="assistant"
                  content={
                    <TextShimmer
                      duration={1.5}
                    >{`Analyzing your emails from the last ${period}...`}</TextShimmer>
                  }
                />
              );

              const endDate = new Date();
              const startDate = new Date();
              if (period.includes("week")) {
                startDate.setDate(endDate.getDate() - 7);
              } else if (period.includes("month")) {
                startDate.setDate(endDate.getDate() - 30);
              }
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);

              const afterDate = startDate.toISOString().split("T")[0];
              const beforeDate = endDate.toISOString().split("T")[0];

              const response = await fetchEmails({
                folder: "inbox",
                max: "50",
                query: `after:${afterDate} before:${beforeDate}`,
              });

              if (!response?.threads?.length) {
                return (
                  <Message
                    role="assistant"
                    content="No emails found in the specified time period."
                  />
                );
              }

              const emails: EmailData[] = response.threads.map((thread: InitialThread) => ({
                id: thread.id,
                subject: thread.subject,
                from: thread.sender.email,
                date: thread.receivedOn,
                snippet: thread.title,
                labels: thread.tags.map((tag: string) => ({ id: tag, name: tag })),
              }));

              const summary = analyzeEmails(emails);

              return (
                <Message
                  role="assistant"
                  content={<EmailSummary period={period} summary={summary} />}
                />
              );
            } catch (error: any) {
              console.error("❌ Error details:", error);

              if (error.message === "Unauthorized") {
                return <Message role="assistant" content="Please sign in to access your emails." />;
              }
              if (error.message === "Unauthorized, reconnect") {
                return (
                  <Message role="assistant" content="Please connect an email account first." />
                );
              }

              return (
                <Message
                  role="assistant"
                  content="Sorry, there was an error analyzing your emails. Please try again."
                />
              );
            }
          },
        },
      },
    });

    return stream;
  } catch (error) {
    console.error("❌ Error in sendMessage:", { error, message });

    throw error;
  }
};

// Export types and AI instance

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<CoreMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ done }) => {
    "use server";

    if (done) {
      // save to database if needed
    }
  },
});
