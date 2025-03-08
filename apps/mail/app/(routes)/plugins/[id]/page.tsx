"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Loader2, Package, Trash2 } from "lucide-react";
import { PluginOptionsForm } from "@/components/plugin/plugin-options-form";
import { getAllPluginSettings } from "@/actions/plugin-settings";
import { uninstallPlugin } from "@/actions/plugin-uninstall";
import { Separator } from "@/components/ui/separator";
import { pluginManager } from "@/lib/plugin-manager";
import { usePlugins } from "@/hooks/use-plugins";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function PluginDetailsPage() {
  const { id } = useParams();
  const { plugins } = usePlugins();
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installed, setInstalled] = useState(false);

  const plugin = plugins.find((p) => p.metadata.id === id);

  useEffect(() => {
    const loadPluginState = async () => {
      if (!session?.user?.id || !plugin) return;

      try {
        const settings = await getAllPluginSettings();
        setInstalled(!!settings[plugin.metadata.id]);
        setEnabled(pluginManager.isPluginEnabled(plugin.metadata.id));
      } catch (error) {
        console.error("Failed to load plugin state:", error);
        toast.error("Failed to load plugin settings");
      }
    };

    loadPluginState();
  }, [session?.user?.id, plugin]);

  const handleTogglePlugin = async (enabled: boolean) => {
    if (!session?.user?.id || !plugin) {
      toast.error("Please sign in to manage plugins");
      return;
    }

    setLoading(true);

    try {
      await pluginManager.setPluginEnabled(plugin.metadata.id, enabled);
      setEnabled(enabled);
      toast.success(`Plugin ${enabled ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
      toast.error("Failed to toggle plugin");
      setEnabled(!enabled);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlugin = async () => {
    if (!session?.user?.id || !plugin) {
      toast.error("Please sign in to manage plugins");
      return;
    }

    setLoading(true);

    try {
      await uninstallPlugin(plugin.metadata.id);
      setInstalled(false);
      toast.success("Plugin removed successfully");
    } catch (error) {
      console.error("Failed to remove plugin:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove plugin");
    } finally {
      setLoading(false);
    }
  };

  if (!plugin) {
    return (
      <div className="text-muted-foreground flex min-h-[400px] flex-col items-center justify-center">
        <Package className="mb-4 h-12 w-12" />
        <h2 className="mb-2 text-xl font-medium">Plugin Not Found</h2>
        <p>The plugin you're looking for doesn't exist.</p>
        <Link href="/plugins" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plugins
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/plugins">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plugins
          </Button>
        </Link>
        <h1 className="mb-2 text-3xl font-bold">{plugin.metadata.name}</h1>
        <p className="text-muted-foreground">{plugin.metadata.description}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plugin Information</CardTitle>
            <CardDescription>Details about this plugin and its configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`plugin-${plugin.metadata.id}`}
                    checked={enabled}
                    onCheckedChange={handleTogglePlugin}
                    disabled={loading || !installed}
                  />
                  <Label htmlFor={`plugin-${plugin.metadata.id}`}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Enabled"
                    )}
                  </Label>
                </div>
                {installed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemovePlugin}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Plugin
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{plugin.metadata.version}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Author</span>
                  <span className="font-medium">{plugin.metadata.author}</span>
                </div>
                {/* {plugin.metadata?.homepage && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Homepage</span>
                    <a
                      href={plugin.metadata?.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                )} */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
