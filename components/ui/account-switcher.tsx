"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface AccountSwitcherProps {
  accounts: {
    name: string;
    logo: React.ComponentType<{ className?: string }>;
    email: string;
  }[];
}

export function AccountSwitcher({ accounts }: AccountSwitcherProps) {
  const [selectedAccount, setSelectedAccount] = React.useState(accounts[0]);

  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/10 text-sidebar-primary-foreground shrink-0">
                <selectedAccount.logo className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="font-semibold">{selectedAccount.name}</span>
                <span className="truncate">{selectedAccount.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </SidebarMenuItem>
      </SidebarMenu>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-64"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel>Accounts</DropdownMenuLabel>
        {accounts.map((account, index) => (
          <DropdownMenuItem
            key={account.name}
            onSelect={() => setSelectedAccount(account)}
          >
            <account.logo className="mr-2 size-4" />
            <span>{account.name}</span>
            <div className="ml-auto flex items-center gap-2">
              {account === selectedAccount && <Check className="size-4" />}
              <span className="text-xs bg-muted rounded-md px-1">
                ⌘<span className="font-mono">{index + 1}</span>
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Plus className="mr-2 size-4" />
              Add account
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add account</DialogTitle>
            </DialogHeader>
            {/* Add team form would go here */}
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
