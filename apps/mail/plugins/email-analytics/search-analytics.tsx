import { PluginDataStorage } from "@/types/plugin";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

export const SearchAnalytics = React.memo(
  React.forwardRef<HTMLButtonElement, { storage?: PluginDataStorage }>((props, ref) => {
    const handleClick = async () => {
      if (!props.storage) return;

      try {
        await props.storage.set("test_write_to_db", []);

        toast.success("Contact interaction saved!");
      } catch (error) {
        console.error("Error saving contact:", error);
        toast.error("Failed to save contact interaction");
      }
    };

    return (
      <Button ref={ref} variant="ghost" size="sm" className="gap-2" onClick={handleClick}>
        <Users className="h-4 w-4" />
        <span>Top Contacts</span>
      </Button>
    );
  }),
);
