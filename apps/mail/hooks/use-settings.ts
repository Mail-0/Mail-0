import { getUserSettings, saveUserSettings, UserSettings } from "@/actions/settings";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function useSettings() {
  const [isPending, setIsPending] = useState(false);
  const { data, error, isLoading, mutate } = useSWR("user-settings", async () => {
    try {
      return await getUserSettings();
    } catch (error) {
      console.error("Failed to load settings:", error);
      throw error;
    }
  });

  const updateSettings = async (settings: UserSettings) => {
    try {
      setIsPending(true);
      await saveUserSettings(settings);
      await mutate();
      toast.success("Settings saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    settings: data,
    isLoading,
    error,
    updateSettings,
    isPending,
  };
}
