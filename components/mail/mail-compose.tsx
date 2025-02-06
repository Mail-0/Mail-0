/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import {
  X,
  Paperclip,
  Image as ImageIcon,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MailComposeProps {
  open: boolean;
  onClose: () => void;
  replyTo?: {
    email: string;
    subject: string;
  };
}

export function MailCompose({ open, onClose, replyTo }: MailComposeProps) {
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [messageContent, setMessageContent] = React.useState("");
  const [toInput, setToInput] = React.useState(replyTo?.email || "");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const editorRef = React.useRef<HTMLDivElement>(null);

  const pastEmails = [
    "alice@example.com",
    "bob@example.com",
    "carol@example.com",
    "david@example.com",
    "eve@example.com",
  ];

  const filteredSuggestions = toInput
    ? pastEmails.filter((email) =>
        email.toLowerCase().includes(toInput.toLowerCase())
      )
    : [];

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertFormat = (format: string) => {
    if (!editorRef.current) return;
    document.execCommand("styleWithCSS", false, "true");

    switch (format) {
      case "bold":
        document.execCommand("bold", false);
        break;
      case "italic":
        document.execCommand("italic", false);
        break;
      case "list":
        document.execCommand("insertUnorderedList", false);
        break;
      case "ordered-list":
        document.execCommand("insertOrderedList", false);
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) document.execCommand("createLink", false, url);
        break;
    }
    editorRef.current.focus();
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="grid py-4">
          <div className="grid gap-2">
            <div className="relative">
              <Input
                placeholder="To"
                value={toInput}
                onChange={(e) => {
                  setToInput(e.target.value);
                  setShowSuggestions(true);
                }}
                className="border-0 focus-visible:ring-0 rounded-none"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 z-10 mt-1 max-h-40 overflow-auto rounded-md border border-input bg-background shadow-lg">
                  {filteredSuggestions.map((email, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setToInput(email);
                        setShowSuggestions(false);
                      }}
                      className="cursor-pointer p-2 hover:bg-muted"
                    >
                      {email}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Separator className="w-[95%] mx-auto" />
            <Input
              placeholder="Subject"
              defaultValue={replyTo?.subject ? `Re: ${replyTo.subject}` : ""}
              className="border-0 focus-visible:ring-0 rounded-none"
            />
          </div>
          <Separator className="w-[95%] mx-auto" />

          <div
            ref={editorRef}
            contentEditable
            className="mt-5 w-[95%] mx-auto min-h-[300px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onInput={(e) => setMessageContent(e.currentTarget.innerHTML)}
            role="textbox"
            aria-multiline="true"
          />

          <div className="flex items-center justify-between p-1 mt-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => insertFormat("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => insertFormat("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => insertFormat("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => insertFormat("ordered-list")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => insertFormat("link")}
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        insertFormat(`![${file.name}](${reader.result})`);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 w-[95%] mx-auto">
            <div className="flex gap-2">
              <label className="cursor-pointer w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    const fileInput =
                      e.currentTarget.nextElementSibling as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach files
                </Button>
                <Input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleAttachment}
                />
              </label>
              {attachments.length > 0 && (
                <div className="relative w-full" ref={dropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-center"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {attachments.length} Attachment
                    {attachments.length > 1 ? "s" : ""}
                  </Button>
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full max-h-40 rounded-md border border-input bg-background shadow-lg">
                      <ScrollArea className="h-40">
                        <div className="p-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
                            >
                              <span className="text-sm truncate w-[calc(100%-2rem)]">
                                {file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Save as draft
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement send functionality
                onClose();
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}