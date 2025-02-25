import { createAI, createStreamableValue, getMutableAIState, streamUI } from "ai/rsc";
import { SuspiciousEmailAlert } from "@/components/ai/suspicious-email-alert";
import { Message, TextStreamMessage } from "@/components/ai/messages";
import { EmailSummary } from "@/components/ai/email-summary";
import { LoadingText } from "@/components/ui/text-shimmer";
import { EmailList } from "@/components/ai/email-list";
import { CoreMessage, generateId } from "ai";
import { getMails } from "@/actions/mail";
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

// Add a constant for batch size management
const EMAIL_BATCH_SIZES = {
  DEFAULT: 100,
  SECURITY_SCAN: 150,
} as const;

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

  // List of suspicious keywords
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

  // Suspicious TLDs
  const suspiciousTLDs = [".xyz", ".tk", ".ml", ".ga", ".cf"];

  // List of legitimate domains that should not be flagged
  const legitimateDomains = [
    "google.com",
    "gmail.com",
    "accounts.google.com",
    "microsoft.com",
    "outlook.com",
    "live.com",
    "amazon.com",
    "apple.com",
    "icloud.com",
    "facebook.com",
    "twitter.com",
    "linkedin.com",
    "github.com",
    "paypal.com",
    "netflix.com",
    "spotify.com",
  ];

  // Function to detect typosquatting (slight misspellings of legitimate domains)
  const isTyposquatting = (domain: string): [boolean, string] => {
    // Extract the domain part without subdomains for comparison
    const baseDomain = domain.split(".").slice(-2).join(".");

    for (const legitDomain of legitimateDomains) {
      // Skip exact matches (these are legitimate)
      if (domain === legitDomain || domain.endsWith("." + legitDomain)) {
        return [false, ""];
      }

      // Check for small typos (1-2 character differences)
      const legitBaseDomain = legitDomain.split(".").slice(-2).join(".");

      // Simple character difference check
      if (
        Math.abs(baseDomain.length - legitBaseDomain.length) <= 2 &&
        baseDomain !== legitBaseDomain
      ) {
        // Calculate character differences
        let diffCount = 0;
        const longerDomain =
          baseDomain.length > legitBaseDomain.length ? baseDomain : legitBaseDomain;
        const shorterDomain =
          baseDomain.length > legitBaseDomain.length ? legitBaseDomain : baseDomain;

        // Check for added/removed/changed characters
        let i = 0,
          j = 0;
        while (i < longerDomain.length) {
          if (j < shorterDomain.length && longerDomain[i] === shorterDomain[j]) {
            i++;
            j++;
          } else {
            diffCount++;
            i++;
            if (longerDomain.length === shorterDomain.length) j++;
          }

          if (diffCount > 2) break;
        }

        if (diffCount <= 2) {
          return [true, legitDomain];
        }
      }

      // Check for common typosquatting patterns
      if (
        baseDomain.replace("0", "o") === legitBaseDomain ||
        baseDomain.replace("l", "1") === legitBaseDomain ||
        baseDomain.replace("i", "1") === legitBaseDomain ||
        baseDomain.replace("rn", "m") === legitBaseDomain ||
        // Double letters
        baseDomain.replace(/(.)\1+/g, "$1") === legitBaseDomain ||
        // Extra letters
        legitBaseDomain.includes(baseDomain.replace(/[aeiou]/g, ""))
      ) {
        return [true, legitDomain];
      }
    }

    return [false, ""];
  };

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

    // Extract email domain for analysis
    const fromLower = email.from.toLowerCase();
    const emailParts = fromLower.match(/<([^>]+)>/) || [null, fromLower];
    const emailAddress = emailParts[1];
    const domain = emailAddress ? emailAddress.split("@")[1] : "";

    // Skip analysis if it's a legitimate domain
    const isLegitimate =
      domain &&
      legitimateDomains.some(
        (legitDomain) => domain === legitDomain || domain.endsWith("." + legitDomain),
      );

    if (!isLegitimate && domain) {
      // Spam/Suspicious detection
      const subjectLower = email.subject.toLowerCase();

      // Check for suspicious keywords in subject
      const foundKeywords = suspiciousKeywords.filter((keyword) =>
        subjectLower.includes(keyword.toLowerCase()),
      );

      if (foundKeywords.length > 0) {
        suspiciousPatterns.push(`Keywords found: ${foundKeywords.join(", ")}`);
      }

      // Check for suspicious TLDs
      const hasSuspiciousTLD = suspiciousTLDs.some((tld) => domain.endsWith(tld));
      if (hasSuspiciousTLD) {
        suspiciousPatterns.push(`Suspicious TLD detected in: ${domain}`);
      }

      // Check for typosquatting
      const [isTypo, similarTo] = isTyposquatting(domain);
      if (isTypo) {
        suspiciousPatterns.push(`Possible typosquatting of ${similarTo} detected in: ${domain}`);
      }

      // Check for mismatched sender name and domain
      const [displayName, emailAddress] = email.from.split("<").map((s) => s.trim());
      const domainPart = emailAddress?.split("@")[1]?.replace(">", "");

      // Only check for mismatch if it's not a personal email and domain part exists
      if (
        domainPart &&
        !domain.includes("gmail") &&
        !domain.includes("hotmail") &&
        !domain.includes("outlook") &&
        !domain.includes("yahoo") &&
        !domain.includes("aol") &&
        !domain.includes("icloud")
      ) {
        const mismatchedSender =
          displayName &&
          domainPart &&
          !displayName.toLowerCase().includes(domainPart.split(".")[0].toLowerCase()) &&
          !domainPart.split(".")[0].toLowerCase().includes(displayName.toLowerCase());

        if (mismatchedSender) {
          suspiciousPatterns.push(`Mismatched sender: ${displayName} vs ${domainPart}`);
        }
      }
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
  console.log("🚀 Content stream:", { contentStream: contentStream.value });
  const textComponent = <TextStreamMessage content={contentStream.value} />;

  try {
    const { value: stream } = await streamUI({
      model: openai("gpt-4o-mini-2024-07-18"),
      system: `
      You are a friendly email assistant. Help users manage and understand their emails.
      When users ask to analyze or summarize their emails with time periods (like "weekly", "monthly", "this week", "last month", etc), use the summarizeEmails tool.
      When users ask to see or view their emails with time periods (like "show emails from last week", "view emails from yesterday", etc), use the fetchEmails tool with the appropriate period parameter.
      When users ask to see emails without mentioning time periods, use the fetchEmails tool without a period parameter.
      When users ask to see their inbox, use the fetchEmails tool.
      When users ask about suspicious or spam emails, use the detectSuspiciousEmails tool.

      Examples:
      - "Summarize my weekly emails" -> use summarizeEmails with period="week"
      - "Analyze my emails from this week" -> use summarizeEmails with period="week"
      - "Show me my emails from last week" -> use fetchEmails with period="week"
      - "View my emails from yesterday" -> use fetchEmails with period="day"
      - "Show me my recent emails" -> use fetchEmails
      - "Show me my inbox" -> use fetchEmails
      - "Check for suspicious emails" -> use detectSuspiciousEmails
      - "Are there any spam emails?" -> use detectSuspiciousEmails`,
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
            max: z
              .string()
              .optional()
              .describe("Maximum number of emails to fetch, defaults to 100"),
            labelIds: z.array(z.string()).optional().describe("Label IDs to filter by"),
            period: z
              .string()
              .optional()
              .describe('Time period to fetch emails for (e.g., "day", "week", "month")'),
          }),
          generate: async function* ({ folder = "inbox", max, labelIds, period }) {
            try {
              yield (
                <Message
                  role="assistant"
                  content={
                    <LoadingText
                      messages={[
                        period
                          ? `Fetching your emails from the last ${period}...`
                          : "Fetching your emails...",
                        "Processing inbox contents...",
                        "Retrieving messages...",
                        "Organizing results...",
                      ]}
                      interval={1}
                      shimmerWidth={2}
                    />
                  }
                />
              );

              // Use a reasonable default batch size
              const batchSize = max ? parseInt(max) : EMAIL_BATCH_SIZES.DEFAULT;

              // Handle time period filtering
              const queryParams: any = {
                folder,
                max: batchSize,
                labelIds,
              };

              // Add date range if period is specified
              if (period) {
                const endDate = new Date();
                const startDate = new Date();

                if (period.includes("day") || period.includes("yesterday")) {
                  startDate.setDate(endDate.getDate() - 1);
                } else if (period.includes("week")) {
                  startDate.setDate(endDate.getDate() - 7);
                } else if (period.includes("month")) {
                  startDate.setDate(endDate.getDate() - 30);
                } else if (period.includes("year")) {
                  startDate.setDate(endDate.getDate() - 365);
                }

                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                const afterDate = startDate.toISOString().split("T")[0];
                const beforeDate = endDate.toISOString().split("T")[0];

                queryParams.q = `after:${afterDate} before:${beforeDate}`;
              }

              const response = await getMails(queryParams);

              if (!response?.threads?.length) {
                return (
                  <Message
                    role="assistant"
                    content={
                      period
                        ? `No emails found from the last ${period} in the ${folder} folder.`
                        : `No emails found in the ${folder} folder.`
                    }
                  />
                );
              }

              const emails = response.threads.map((thread: InitialThread) => ({
                id: thread.id,
                subject: thread.subject,
                from: thread.sender.email,
                date: thread.receivedOn,
                snippet: thread.title,
                body: thread.title,
              }));

              return (
                <Message
                  role="assistant"
                  content={
                    <EmailList
                      folder={folder}
                      emails={emails}
                      title={
                        period
                          ? `Emails from the last ${period}`
                          : `${folder.charAt(0).toUpperCase() + folder.slice(1)} emails`
                      }
                    />
                  }
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
                    <LoadingText
                      messages={[
                        `Analyzing all your emails from the last ${period}...`,
                        "Processing complete email history...",
                        "Identifying comprehensive patterns...",
                        "Generating detailed insights...",
                      ]}
                      interval={1}
                      shimmerWidth={2}
                    />
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

              const response = await getMails({
                folder: "inbox",
                q: `after:${afterDate} before:${beforeDate}`,
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
        detectSuspiciousEmails: {
          description: "Analyze emails for suspicious patterns and potential security risks",
          parameters: z.object({
            max: z.string().optional().describe("Maximum number of emails to analyze"),
          }),
          generate: async function* ({ max }) {
            try {
              yield (
                <Message
                  role="assistant"
                  content={
                    <LoadingText
                      messages={[
                        "Initiating comprehensive security scan...",
                        "Analyzing email patterns...",
                        "Checking sender reputations...",
                        "Evaluating content security...",
                        "Performing deep security analysis...",
                      ]}
                      interval={1}
                      shimmerWidth={2}
                    />
                  }
                />
              );

              const response = await getMails({
                folder: "inbox",
                max: max ? parseInt(max) : EMAIL_BATCH_SIZES.SECURITY_SCAN,
                q: "category:primary OR category:spam",
              });

              if (!response?.threads?.length) {
                return (
                  <Message
                    role="assistant"
                    content="No emails found to analyze for suspicious patterns."
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

              const stats = analyzeEmails(emails);

              if (stats.suspiciousEmails.length === 0) {
                return (
                  <Message
                    role="assistant"
                    content={<SuspiciousEmailAlert emails={[]} totalScanned={emails.length} />}
                  />
                );
              }

              return (
                <Message
                  role="assistant"
                  content={
                    <SuspiciousEmailAlert
                      emails={stats.suspiciousEmails}
                      totalScanned={emails.length}
                    />
                  }
                />
              );
            } catch (error: any) {
              console.error("❌ Error analyzing suspicious emails:", error);
              return (
                <Message
                  role="assistant"
                  content="Sorry, there was an error analyzing your emails for suspicious patterns. Please try again."
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
