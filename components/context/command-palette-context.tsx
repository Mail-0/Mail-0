"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOpenComposeModal } from "@/hooks/use-open-compose-modal";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { navigationConfig, NavItem } from "@/config/navigation";
import { ArrowUpRight, CircleHelp, Pencil } from "lucide-react";
import { useConnections } from "@/hooks/use-connections";
import { useRouter, usePathname } from "next/navigation";
import { keyboardShortcuts } from "@/config/shortcuts";
import { useSession, $fetch } from "@/lib/auth-client";
import { IConnection } from "@/types";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import * as React from "react";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

type CommandPaletteContext = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openModal: () => void;
};

const CommandPaletteContext = React.createContext<CommandPaletteContext | null>(null);

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider.");
  }
  return context;
}

export function CommandPaletteProvider({ children }: Props) {
  const [open, setOpen] = React.useState(false);
  const { open: openComposeModal } = useOpenComposeModal();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, refetch } = useSession();
  const { data: connections, mutate } = useConnections();
  const [searchValue, setSearchValue] = useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    setSearchValue(""); // Clear search input on command execution
    command();
  }, []);

  const allCommands = React.useMemo(() => {
    const mailCommands: { group: string; item: NavItem }[] = [];
    const settingsCommands: { group: string; item: NavItem }[] = [];
    const otherCommands: { group: string; item: NavItem }[] = [];

    for (const sectionKey in navigationConfig) {
      const section = navigationConfig[sectionKey];
      section.sections.forEach((group) => {
        group.items.forEach((item) => {
          if (!(sectionKey === "settings" && item.isBackButton)) {
            if (sectionKey === "mail") {
              mailCommands.push({ group: sectionKey, item });
            } else if (sectionKey === "settings") {
              settingsCommands.push({ group: sectionKey, item });
            } else {
              otherCommands.push({ group: sectionKey, item });
            }
          } else if (sectionKey === "settings") {
            settingsCommands.push({ group: sectionKey, item });
          }
        });
      });
    }

    const combinedCommands = [
      { group: "Mail", items: mailCommands.map((c) => c.item) },
      { group: "Settings", items: settingsCommands.map((c) => c.item) },
      ...otherCommands.map((section) => ({ group: section.group, items: section.item })),
    ];

    const filteredCommands = combinedCommands.map((group) => {
      if (group.group === "Settings") {
        return {
          ...group,
          items: group.items.filter((item: NavItem) => {
            return pathname.startsWith("/settings") || !item.isBackButton;
          }),
        };
      }
      return group;
    });

    return filteredCommands;
  }, [pathname]);

  const accountCommands = React.useMemo(() => {
    if (!session?.user || !connections?.length) {
      return [];
    }

    return connections
      .filter((connection) => connection.id !== session.connectionId) // Exclude current account
      .map((connection: IConnection) => ({
        group: "Accounts",
        item: {
          title: `Switch to ${connection.email}`,
          url: `/api/v1/mail/connections/${connection.id}`,
          icon: () => (
            <Image
              src={connection.picture || "/placeholder.svg"}
              alt={connection.name || connection.email}
              width={16}
              height={16}
              className="h-4 w-4 rounded-full"
            />
          ),
          onSelect: () => {
            runCommand(() => {
              // First, update the default connection ID in the database
              fetch(`/api/v1/mail/connections/${connection.id}`, { method: "PUT" })
                .then((response) => {
                  if (response.ok) {
                    console.log(`Successfully switched to account: ${connection.email}`);
                    // THEN, update the session using better-auth's $fetch
                    return $fetch("/api/auth/session", {
                      method: "POST",
                      body: JSON.stringify({ connectionId: connection.id }),
                    }); // Update the session
                  } else {
                    console.error(`Failed to switch account: ${connection.email}`);
                    // Display more specific error using sonner's toast
                    response.json().then((data) => {
                      toast.error("Error switching connection", {
                        description: data.error, // Use more specific error message
                      });
                    });
                    throw new Error("Failed to update default connection ID"); // Stop execution on failure
                  }
                })
                .then(() => {
                  // Refetch session and connections after successful update
                  refetch(); // VERY IMPORTANT: Refetch the session
                  mutate(); // Refetch the connections list
                  router.refresh(); // AND refresh the router to update server state
                  toast.success(`Successfully switched to account: ${connection.email}`); // Show a success message
                })
                .catch((error) => {
                  console.error("Error during account switch:", error);
                  toast.error("Error switching connection", { description: String(error) });
                });
            });
          },
        },
      }));
  }, [session, connections, router, runCommand, mutate, refetch]); // Added refetch

  // Filter commands based on search
  const filteredAccountCommands = React.useMemo(() => {
    const searchTerm = searchValue.toLowerCase();
    return accountCommands.filter(
      (command) =>
        command.item.title.toLowerCase().includes(searchTerm) || "switch".includes(searchTerm),
    );
  }, [accountCommands, searchValue]);

  const filteredAllCommands = React.useMemo(() => {
    const searchTerm = searchValue.toLowerCase();
    return allCommands
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(searchTerm)),
      }))
      .filter((group) => group.items.length > 0);
  }, [allCommands, searchValue]);

  return (
    <CommandPaletteContext.Provider
      value={{
        open,
        setOpen,
        openModal: () => {
          setOpen(false);
          openComposeModal();
        },
      }}
    >
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogTitle>0 - Command Palette</DialogTitle>
          <DialogDescription>Quick navigation and actions for 0.</DialogDescription>
        </VisuallyHidden>
        <CommandInput
          autoFocus
          placeholder="Type a command or search..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem onSelect={() => runCommand(() => openComposeModal())}>
              <Pencil size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Compose message</span>
              <CommandShortcut>
                {keyboardShortcuts
                  .find((s: { action: string; keys: string[] }) => s.action === "New Email")
                  ?.keys.join(" ")}
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {/* Render other command groups */}
          {filteredAllCommands.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.items.length > 0 && (
                <CommandGroup heading={group.group}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.url}
                      onSelect={() =>
                        runCommand(() => {
                          router.push(item.url);
                        })
                      }
                    >
                      {item.icon && (
                        <item.icon
                          size={16}
                          strokeWidth={2}
                          className="opacity-60"
                          aria-hidden="true"
                        />
                      )}
                      <span>{item.title}</span>
                      {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {groupIndex < filteredAllCommands.length - 1 && <CommandSeparator />}
            </React.Fragment>
          ))}

          {/* Render filtered account commands */}
          {filteredAccountCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Accounts">
                {filteredAccountCommands.map((account) => (
                  <CommandItem key={account.item.url} onSelect={account.item.onSelect}>
                    {account.item.icon && account.item.icon()}
                    <span>{account.item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          <CommandSeparator />
          <CommandGroup heading="Help">
            <CommandItem onSelect={() => runCommand(() => console.log("Help with shortcuts"))}>
              <CircleHelp size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Help with shortcuts</span>
              <CommandShortcut>
                {keyboardShortcuts
                  .find(
                    (s: { action: string; keys: string[] }) => s.action === "Help with shortcuts",
                  )
                  ?.keys.join(" ")}
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => window.open("https://github.com/nizzyabi/mail0", "_blank"))
              }
            >
              <ArrowUpRight size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Go to docs</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {children}
    </CommandPaletteContext.Provider>
  );
}
