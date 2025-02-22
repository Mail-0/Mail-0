// File: components/ui/command-palette.tsx
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
import { keyboardShortcutsAtom } from "@/store/shortcuts";
import { useRouter, usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CircleHelp } from "lucide-react";
import { Pencil } from "lucide-react";
import { useAtom } from "jotai";
import * as React from "react";

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

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { open: openComposeModal } = useOpenComposeModal();
  const router = useRouter();
  const pathname = usePathname();
  const [keyboardShortcuts] = useAtom(keyboardShortcutsAtom);
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
          // Check if it's the "Back to Mail" item and if we are NOT in settings
          if (!(sectionKey === "settings" && item.isBackButton)) {
            if (sectionKey === "mail") {
              mailCommands.push({ group: sectionKey, item });
            } else if (sectionKey === "settings") {
              settingsCommands.push({ group: sectionKey, item });
            } else {
              otherCommands.push({ group: sectionKey, item });
            }
          } else if (sectionKey === "settings") {
            settingsCommands.push({ group: sectionKey, item }); //show 'back to mail' button
          }
        });
      });
    }

    const combinedCommands = [
      { group: "Mail", items: mailCommands.map((c) => c.item) },
      { group: "Settings", items: settingsCommands.map((c) => c.item) },
      ...otherCommands.map((section) => ({ group: section.group, items: section.item })),
    ];

    // Filter "Back to Mail" based on the current pathname
    const filteredCommands = combinedCommands.map((group) => {
      if (group.group === "Settings") {
        return {
          ...group,
          items: group.items.filter((item) => {
            return pathname.startsWith("/settings") || !item.isBackButton;
          }),
        };
      }
      return group;
    });

    return filteredCommands;
  }, [pathname]); // Depend on pathname

  const getShortcut = (action: string) => {
    const shortcut = keyboardShortcuts.find((s) => s.action === action);
    if (!shortcut) return;
    return shortcut.keys
      .map((key) => {
        if (key === "Meta") return "⌘";
        if (key === "Control") return "Ctrl";
        return key;
      })
      .join("+");
  };

  return (
    <CommandPaletteContext.Provider
      value={{
        open,
        setOpen,
        openModal: () => {
          // Use openModal from context
          setOpen(false);
          openComposeModal();
        },
      }}
    >
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogTitle>Mail 0 - Command Palette</DialogTitle>
          <DialogDescription>Quick navigation and actions for Mail 0.</DialogDescription>
        </VisuallyHidden>
        <CommandInput autoFocus placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => runCommand(() => openComposeModal())}
              aria-label="Compose New Email"
            >
              <Pencil size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Compose message</span>
              <CommandShortcut>{getShortcut("New Email")}</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          {allCommands.map((group, groupIndex) => (
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
                      aria-label={item.title}
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
              {groupIndex < allCommands.length - 1 && <CommandSeparator />}
            </React.Fragment>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Help">
            <CommandItem onSelect={() => runCommand(() => console.log("Help with shortcuts"))}>
              <CircleHelp size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Help with shortcuts</span>
              <CommandShortcut>{getShortcut("Help with shortcuts")}</CommandShortcut>
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
