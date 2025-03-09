import EmailAnalyticsPlugin from "@/plugins/email-analytics";
import { pluginManager } from "@/lib/plugin-manager";
import ResendPlugin from "@/plugins/resend-plugin";
import { useEffect } from "react";

export function PluginLoader() {
  useEffect(() => {
    const loadPlugins = async () => {
      try {
        await pluginManager.registerPlugin(EmailAnalyticsPlugin);
        console.log("Email Analytics plugin loaded successfully");
      } catch (error) {
        console.error("Failed to load plugins:", error);
      }
      try {
        await pluginManager.registerPlugin(ResendPlugin);
        console.log("Resend plugin loaded successfully");
      } catch (error) {
        console.error("Failed to load plugins:", error);
      }
    };

    loadPlugins();
  }, []);

  return null;
}
