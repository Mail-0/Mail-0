import { Plugin, PluginDataStorage } from "../types/plugin";
import React, { memo, useEffect, useState } from "react";
import { pluginManager } from "@/lib/plugin-manager";

export function createStorageComponent<P extends { storage?: PluginDataStorage }>(
  Component: React.ComponentType<P>,
  plugin: Pick<Plugin, "metadata">,
): React.ComponentType<Omit<P, "storage">> {
  const StorageComponent = memo((props: Omit<P, "storage">) => {
    const [storage, setStorage] = useState<PluginDataStorage>();

    useEffect(() => {
      const initializePlugin = async () => {
        try {
          if (!pluginManager.isPluginAdded(plugin.metadata.id)) {
            await pluginManager.registerPlugin(plugin);
            await pluginManager.setPluginEnabled(plugin.metadata.id, true);
          }

          const plugins = pluginManager.getAllPlugins();
          const registeredPlugin = plugins.find((p) => p.metadata.id === plugin.metadata.id);
          if (registeredPlugin?.storage) {
            setStorage(registeredPlugin.storage);
          }
        } catch (error) {
          console.error("Failed to initialize plugin:", error);
        }
      };

      initializePlugin();
    }, []);

    return <Component {...(props as P)} storage={storage} />;
  });

  return StorageComponent;
}
