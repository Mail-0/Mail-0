import { getUserSettings } from "@/actions/settings";
import { useSession } from "@/lib/auth-client";
import useSWR from "swr";

export function useSettings() {
  const { data: session } = useSession();

  const userId = session?.user.id;
  const { data, error, isLoading, mutate } = useSWR(
    userId ? [`user-settings`, userId] : null,
    async () => {
      try {
        return await getUserSettings();
      } catch (error) {
        console.error("Failed to load settings:", error);
        throw error;
      }
    },
  );

  return {
    settings: data,
    isLoading,
    error,
    mutate,
  };
}
