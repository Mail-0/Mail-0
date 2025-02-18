"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { SquarePenIcon, SquarePenIconHandle } from "../../icons/animated/square-pen";
import { SidebarThemeSwitch } from "../../theme/sidebar-theme-switcher";
import { SettingsGearIcon } from "../../icons/animated/settings-gear";
import { useOpenComposeModal } from "@/hooks/use-open-compose-modal";
import { CheckCheckIcon } from "../../icons/animated/check-check";
import { MessageCircleIcon } from "../../icons/animated/message";
import { BookTextIcon } from "../../icons/animated/book-text";
import { ArchiveIcon } from "../../icons/animated/archive";
import React, { useMemo, useRef, useState } from "react";
import { UsersIcon } from "../../icons/animated/users";
import { InboxIcon } from "../../icons/animated/inbox";
import { CartIcon } from "../../icons/animated/cart";
import { BellIcon } from "../../icons/animated/bell";
import { XIcon } from "../../icons/animated/x";
import { usePathname } from "next/navigation";
import { $fetch } from "@/lib/auth-client";
import { BASE_URL } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import useSWR from "swr";

const fetchStats = async () => {
  return await $fetch("/api/v1/mail/count?", { baseURL: BASE_URL }).then((e) => e.data as number[]);
};

const settingsPages = [
  { title: "General", url: "/mail/settings/general" },
  { title: "Connections", url: "/mail/settings/connections" },
  { title: "Appearance", url: "/mail/settings/appearance" },
  { title: "Shortcuts", url: "/mail/settings/shortcuts" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: stats } = useSWR<number[]>("/api/v1/mail/count", fetchStats);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = useMemo(
    () => [
      {
        title: "",
        items: [
          {
            title: "Inbox",
            url: "/mail/inbox",
            icon: InboxIcon,
            badge: stats?.[0] ?? 0,
          },
          {
            title: "Drafts",
            url: "/mail/draft",
            icon: BookTextIcon,
          },
          {
            title: "Sent",
            url: "/mail/sent",
            icon: CheckCheckIcon,
          },
          {
            title: "Spam",
            url: "/mail/spam",
            icon: XIcon,
            badge: stats?.[1] ?? 0,
          },
          {
            title: "Archive",
            url: "/mail/archive",
            icon: ArchiveIcon,
          },
        ],
      },
      {
        title: "Categories",
        items: [
          {
            title: "Social",
            url: "/mail/inbox?category=social",
            icon: UsersIcon,
            badge: 972,
          },
          {
            title: "Updates",
            url: "/mail/inbox?category=updates",
            icon: BellIcon,
            badge: 342,
          },
          {
            title: "Forums",
            url: "/mail/inbox?category=forums",
            icon: MessageCircleIcon,
            badge: 128,
          },
          {
            title: "Shopping",
            url: "/mail/inbox?category=shopping",
            icon: CartIcon,
            badge: 8,
          },
        ],
      },
      {
        title: "Advanced",
        items: [
          {
            title: "Settings",
            url: "/mail/settings",
            icon: SettingsGearIcon,
            isExpanded: isSettingsOpen,
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              setIsSettingsOpen(!isSettingsOpen);
            },
            suffix: ChevronDown,
            subItems: settingsPages.map((page) => ({
              title: page.title,
              url: `${page.url}?from=${pathname}`,
            })),
          },
          // {
          //   title: "Analytics",
          //   url: "/mail/under-construction/analytics",
          //   icon: ChartLine,
          // },
          // {
          //   title: "Developers",
          //   url: "/mail/under-construction/developers",
          //   icon: Code,
          // },
        ],
      },
    ],
    [stats, isSettingsOpen, pathname],
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex items-center justify-between gap-4 p-3">
        <NavUser />
        <ComposeButton />
      </SidebarHeader>
      <SidebarContent className="justify-between">
        <NavMain items={navItems} />
        <div className="p-3">
          <SidebarThemeSwitch />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function ComposeButton() {
  const iconRef = useRef<SquarePenIconHandle>(null);

  const { open } = useOpenComposeModal();

  return (
    <Button
      onClick={open}
      className="h-8 w-full justify-start"
      onMouseEnter={() => {
        const icon = iconRef.current;
        if (icon?.startAnimation) {
          icon.startAnimation();
        }
      }}
      onMouseLeave={() => {
        const icon = iconRef.current;
        if (icon?.stopAnimation) {
          icon.stopAnimation();
        }
      }}
    >
      <SquarePenIcon ref={iconRef} />
      Compose
    </Button>
  );
}
