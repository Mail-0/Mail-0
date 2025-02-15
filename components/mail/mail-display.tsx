import {
  Archive,
  ArchiveX,
  Forward,
  MoreVertical,
  Paperclip,
  Reply,
  ReplyAll,
  Send,
  FileIcon,
  Copy,
  Maximize2,
  Minimize2,
  X,
  BellOff,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useThread } from "@/hooks/use-threads";
import { Badge } from "@/components/ui/badge";
import { useMail } from "./use-mail";
import { format } from "date-fns";
import Image from "next/image";
interface MailDisplayProps {
  mail: string | null;
  onClose?: () => void;
  isMobile?: boolean;
}

interface ReplyState {
  content: string;
  attachments: File[];
  isUploading: boolean;
}

export function MailDisplay({ mail, onClose, isMobile }: MailDisplayProps) {
  const [, setMail] = useMail();
  const { data: emailData, isLoading } = useThread(mail ?? "");
  const [isMuted, setIsMuted] = useState(false);
  // const [attachments, setAttachments] = useState<File[]>([]);
  // const [isUploading, setIsUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [replyState, setReplyState] = useState<ReplyState>({
    content: "",
    attachments: [],
    isUploading: false,
  });

  useEffect(() => {
    if (emailData) {
      setIsMuted(emailData.unread ?? false);
    }
  }, [emailData]);

  const handleClose = useCallback(() => {
    onClose?.();
    setMail({ selected: null });
  }, [onClose, setMail]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReplyState((prev) => ({ ...prev, isUploading: true }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setReplyState((prev) => ({
          ...prev,
          attachments: [...prev.attachments, ...Array.from(e.target.files!)],
        }));
      } finally {
        setReplyState((prev) => ({ ...prev, isUploading: false }));
      }
    }
  };

  const removeAttachment = (index: number) => {
    setReplyState((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const truncateFileName = (name: string, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf(".");
    if (extIndex !== -1 && name.length - extIndex <= 5) {
      return `${name.slice(0, maxLength - 5)}...${name.slice(extIndex)}`;
    }
    return `${name.slice(0, maxLength)}...`;
  };

  const renderAttachmentPreview = (file: File) => {
    return file.type.startsWith("image/") ? (
      <Image
        src={URL.createObjectURL(file) || "/placeholder.svg"}
        alt={file.name}
        fill
        className="rounded-t-md object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center p-4">
        <FileIcon className="h-16 w-16 text-primary" />
      </div>
    );
  };

  const renderAttachmentDetails = (file: File) => {
    return (
      <div className="bg-secondary p-2">
        <p className="text-sm font-medium">{truncateFileName(file.name, 30)}</p>
        <p className="text-xs text-muted-foreground">
          Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
        <p className="text-xs text-muted-foreground">
          Last modified: {new Date(file.lastModified).toLocaleDateString()}
        </p>
      </div>
    );
  };

  const renderAttachmentBadge = (file: File, index: number) => {
    return (
      <Tooltip key={index}>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className="mb-1 inline-flex shrink-0 items-center gap-1 bg-background/50 px-2 py-1.5 text-xs"
          >
            <span className="max-w-[120px] truncate">{truncateFileName(file.name)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 h-4 w-4 hover:bg-background/80"
              onClick={(e) => {
                e.preventDefault();
                removeAttachment(index);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-0">
          <div className="relative h-32 w-full">{renderAttachmentPreview(file)}</div>
          {renderAttachmentDetails(file)}
        </TooltipContent>
      </Tooltip>
    );
  };

  const handleCopy = async () => {
    if (emailData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(emailData, null, 2));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  if (!emailData || !mail) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-32 w-32 animate-pulse rounded-full bg-secondary" />
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading email..." : "Select an email to view"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300",
          isMobile ? "" : "rounded-r-lg pt-[6px]",
          isFullscreen ? "fixed inset-0 z-50 bg-background" : "",
        )}
      >
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-4 pb-[7.5px] pt-[0.5px] backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-2">
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="md:h-fit md:px-2"
                    disabled={!emailData}
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            )}
            <div className="max-w-[300px] flex-1 truncate text-sm font-medium">
              {emailData.title || "No subject"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="md:h-fit md:px-2"
                  disabled={!emailData}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="md:h-fit md:px-2"
                  disabled={!emailData}
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy email data</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copySuccess ? "Copied!" : "Copy email data"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2" disabled={!emailData}>
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2" disabled={!emailData}>
                  <Reply className="h-4 w-4" />
                  <span className="sr-only">Reply</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2" disabled={!emailData}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <ArchiveX className="mr-2 h-4 w-4" /> Move to spam
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ReplyAll className="mr-2 h-4 w-4" /> Reply all
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="mr-2 h-4 w-4" /> Forward
                </DropdownMenuItem>
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={cn("relative flex-1 overflow-hidden", isFullscreen && "h-[calc(100vh-4rem)]")}
        >
          <div className="relative inset-0 h-full overflow-y-auto pb-0">
            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage alt={emailData.sender.name} />
                  <AvatarFallback>
                    {emailData.sender.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold">{emailData.sender.name}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{emailData.sender.email}</span>
                    {isMuted && <BellOff className="h-4 w-4" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(emailData.receivedOn), "PPp")}
                    </time>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs underline">
                          Details
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] space-y-2" align="start">
                        <div className="text-xs">
                          <span className="font-medium text-muted-foreground">From:</span>{" "}
                          {emailData.sender.email}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-muted-foreground">Date:</span>{" "}
                          {format(new Date(emailData.receivedOn), "PPpp")}
                        </div>
                        {emailData.tags && emailData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {emailData.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Email Content */}
            <div className="h-full w-full p-0">
              <div className="flex h-full w-full flex-1 flex-col p-0">
                {emailData.blobUrl ? (
                  <iframe
                    key={emailData.id}
                    src={emailData.blobUrl}
                    className={cn(
                      "w-full flex-1 border-none transition-opacity duration-200",
                      isLoading ? "opacity-50" : "opacity-100",
                    )}
                    title="Email Content"
                    sandbox="allow-same-origin"
                    style={{
                      minHeight: "500px",
                      height: "100%",
                      overflow: "auto",
                    }}
                  />
                ) : (
                  <div
                    className="flex h-[500px] w-full items-center justify-center"
                    style={{ minHeight: "500px" }}
                  >
                    <div className="h-32 w-32 animate-pulse rounded-full bg-secondary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isFullscreen && (
          <div className="relative bottom-0 left-0 right-0 z-10 bg-background px-4 pb-4 pt-2">
            <form className="relative space-y-2.5 rounded-[calc(var(--radius)-2px)] border bg-secondary/50 p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  <p className="truncate">
                    {emailData?.sender.name} ({emailData?.sender.email})
                  </p>
                </div>
              </div>

              <Textarea
                className="min-h-[60px] w-full resize-none border-0 bg-[#FAFAFA] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#18181A] md:text-base"
                placeholder="Write your reply..."
                spellCheck={true}
                autoFocus
              />

              {(replyState.attachments.length > 0 || replyState.isUploading) && (
                <div className="relative z-50 min-h-[32px]">
                  <div className="hide-scrollbar absolute inset-x-0 -my-3 flex gap-2 overflow-x-auto">
                    {replyState.isUploading && (
                      <Badge
                        variant="secondary"
                        className="inline-flex shrink-0 animate-pulse items-center bg-background/50 px-2 py-1.5 text-xs"
                      >
                        Uploading...
                      </Badge>
                    )}
                    {replyState.attachments.map((file, index) =>
                      renderAttachmentBadge(file, index),
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="h-8 w-8 hover:bg-background/80"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("attachment-input")?.click();
                        }}
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Add attachment</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>
                  <input
                    type="file"
                    id="attachment-input"
                    className="hidden"
                    onChange={handleAttachment}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8">
                    Save draft
                  </Button>
                  <Button size="sm" className="h-8">
                    Send <Send className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

<style jsx global>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>;
