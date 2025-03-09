import { PluginDataStorage } from "../../types/plugin";
import { Button } from "@/components/ui/button";
import { sendToAudience } from "./actions";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

export const SendButton = React.memo(
  React.forwardRef<HTMLButtonElement, { storage?: PluginDataStorage }>((props, ref) => {
    const [sending, setSending] = React.useState(false);

    const handleSendToAudience = async (e: React.MouseEvent) => {
      e.preventDefault();

      if (!props.storage) {
        toast.error("Plugin storage not initialized");
        return;
      }

      const selectedAudience = await props.storage.get<string>("selectedAudience");
      if (!selectedAudience) {
        toast.error("Please select an audience first");
        return;
      }

      const form = document.getElementById("create-email");
      if (!form) {
        toast.error("Could not find email form");
        return;
      }

      const subjectInput = form.querySelector<HTMLInputElement>('input[placeholder="Subject"]');
      const subject = subjectInput?.value;

      const editorContent = form.querySelector(".ProseMirror")?.innerHTML;

      if (!subject || !editorContent) {
        toast.error("Please fill in both subject and content");
        return;
      }

      try {
        setSending(true);
        const result = await sendToAudience({
          audienceId: selectedAudience,
          subject,
          content: editorContent,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        toast.success("Email sent to audience successfully");

        const resetButton = form.querySelector('button[type="reset"]') as HTMLButtonElement;
        if (resetButton) {
          resetButton.click();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send email");
      } finally {
        setSending(false);
      }
    };

    return (
      <Button ref={ref} onClick={handleSendToAudience} type="button" disabled={sending} {...props}>
        <ArrowUp className="h-4 w-4" />
        <span className="whitespace-nowrap">{sending ? "Sending..." : "Send to Mail List"}</span>
      </Button>
    );
  }),
);
