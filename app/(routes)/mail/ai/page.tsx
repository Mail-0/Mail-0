"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useScrollToBottom } from "@/components/ai/use-scroll-to-bottom";

import { AnimatedPlaceholder } from "@/components/animated-placeholder";

import { Sparkles, AlertTriangle, BarChart3 } from "lucide-react";

import { LoadingMessage } from "@/components/ai/loading-message";

import { SidebarToggle } from "@/components/ui/sidebar-toggle";

import { Message } from "@/components/ai/messages";

import { Button } from "@/components/ui/button";

import { useSession } from "@/lib/auth-client";

import { ReactNode, useRef } from "react";

import { Send } from "lucide-react";

import { useActions } from "ai/rsc";

import { cn } from "@/lib/utils";

import { useState } from "react";

const suggestions = [
  {
    icon: <Sparkles className="h-4 w-4" />,

    text: "Show me my recent emails",

    prompt: "Show me my recent emails",

    variant: "personal",
  },

  {
    icon: <BarChart3 className="h-4 w-4" />,

    text: "Summarize my emails",

    prompt: "Summarize my emails from this week",

    variant: "updates",
  },

  {
    icon: <AlertTriangle className="h-4 w-4" />,

    text: "Check for suspicious emails",

    prompt: "Check my inbox for any suspicious or spam emails",

    variant: "important",
  },
];

export default function AIPage() {
  const { data: session } = useSession();

  const { sendMessage } = useActions();

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Array<ReactNode>>([]);

  const [isProcessing, setIsProcessing] = useState(false);

  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const handleSuggestionClick = (prompt: string) => {
    if (isProcessing) return;

    setMessage(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      setMessages((messages) => [
        ...messages,

        <Message key={messages.length} role="user" content={message} />,
      ]);

      const currentMessage = message;

      setMessage("");

      const response: ReactNode = await sendMessage(currentMessage);

      setMessages((messages) => [...messages, response]);
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-inherit flex h-[calc(100vh-2rem)]">
      <Card className="flex h-full w-full flex-col overflow-hidden border bg-card shadow-sm">
        <CardHeader className="border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <SidebarToggle className="h-8 w-8" />

            <CardTitle className="text-base font-medium">
              AI Assistant
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Alpha
              </span>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden bg-transparent p-4">
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto rounded-lg p-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <div className="space-y-2 text-center">
                  <h2 className="text-lg font-medium md:text-xl lg:text-3xl">
                    Welcome{session?.user?.name ? `, ${session.user.name}` : " to AI Assistant"}.
                  </h2>

                  <p className="text-sm text-muted-foreground md:text-base lg:text-lg">
                    How can I help with your emails today?
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message) => message)}

                {isProcessing && <LoadingMessage />}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <PromptInput
              value={message}
              onValueChange={setMessage}
              isLoading={isProcessing}
              className="max-w-(--breakpoint-md) w-full"
            >
              <div className="relative">
                {messages.length === 0 && !isFocused && !message && (
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <AnimatedPlaceholder />
                  </div>
                )}

                <PromptInputTextarea
                  ref={textareaRef}
                  placeholder=""
                  className="min-h-[10px] bg-background"
                  disabled={isProcessing}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </div>

              <PromptInputActions className="justify-end">
                <PromptInputAction tooltip={isProcessing ? "Sending..." : "Send message"}>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={isProcessing || !message.trim()}
                    className={cn(
                      "h-[50px] w-[50px] rounded-lg transition-colors",

                      "hover:bg-accent hover:text-accent-foreground",

                      isProcessing && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
          </form>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-left transition-colors",

                    "border border-input hover:bg-accent/50",

                    "bg-background",
                  )}
                  disabled={isProcessing}
                >
                  <div
                    className={cn(
                      "rounded-full",

                      suggestion.variant === "personal" && "text-blue-600",

                      suggestion.variant === "important" && "text-amber-600",

                      suggestion.variant === "updates" && "text-emerald-600",
                    )}
                  >
                    {suggestion.icon}
                  </div>

                  <span className="text-sm text-muted-foreground">{suggestion.text}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
