"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllPluginSettings } from "@/actions/plugin-settings";
import { installPlugin } from "@/actions/plugin-install";
import { usePlugins } from "@/hooks/use-plugins";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PluginsPage() {
  const { plugins } = usePlugins();
  const [searchQuery, setSearchQuery] = useState("");
  const [installedPlugins, setInstalledPlugins] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPluginSettings = async () => {
      const settings = await getAllPluginSettings();
      setInstalledPlugins(settings);
    };
    loadPluginSettings();
  }, []);

  const handleAddToAccount = async (pluginId: string) => {
    try {
      await installPlugin(pluginId);
      setInstalledPlugins((prev) => ({ ...prev, [pluginId]: true }));
      toast.success("Plugin added to your account");
    } catch (error) {
      console.error("Failed to add plugin:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add plugin");
    }
  };

  const filteredPlugins = plugins.filter(
    (plugin) =>
      plugin.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plugins</h1>
          <p className="text-muted-foreground">Discover and manage your Mail0 plugins</p>
        </div>
        <Button variant="outline">Submit a Plugin</Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search plugins..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlugins.map((plugin) => (
          <Card key={plugin.metadata.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plugin.metadata.name}
                  <Badge variant="secondary" className="text-xs">
                    v{plugin.metadata.version}
                  </Badge>
                </CardTitle>
              </div>
              <CardDescription>{plugin.metadata.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="text-muted-foreground text-sm">By {plugin.metadata.author}</div>
                {plugin.metadata.tags && (
                  <div className="flex flex-wrap gap-2">
                    {plugin.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {installedPlugins[plugin.metadata.id] ? (
                <div className="text-muted-foreground flex w-full items-center justify-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  Added to account
                </div>
              ) : (
                <Button onClick={() => handleAddToAccount(plugin.metadata.id)} className="w-full">
                  Add to account
                </Button>
              )}
              <Link href={`/plugins/${plugin.metadata.id}`} className="w-full">
                <Button variant="ghost" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
