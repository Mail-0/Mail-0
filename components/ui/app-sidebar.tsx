"use client";

import {
  Inbox,
  FileText,
  SendHorizontal,
  Trash2,
  Archive,
  Users2,
  Bell,
  ArchiveX,
  MessageSquare,
  ShoppingCart,
  Tag,
  Code,
  ChartLine,
  Pencil,
} from "lucide-react";
import { Gmail, Outlook, Vercel } from "@/components/icons/icons";
import { SidebarData } from "@/types";
import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
// import { AccountSwitcher } from "./account-switcher";
import { MailCompose } from "../mail/mail-compose";
import { SidebarToggle } from "./sidebar-toggle";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data: SidebarData = {
  // TODO: Dynamically render user data based on auth info
  user: {
    name: "nizzy",
    email: "nizabizaher@gmail.com",
    avatar: "/profile.jpg",
  },
  accounts: [
    {
      name: "Gmail",
      logo: Gmail,
      email: "nizabizaher@gmail.com",
    },
    {
      name: "Hotmail",
      logo: Vercel,
      email: "nizabizaher@hotmail.com",
    },
    {
      name: "Outlook",
      logo: Outlook,
      email: "nizabizaher@microsoft.com",
    },
  ],
  navMain: [
    {
      title: "Mail",
      items: [
        {
          title: "Inbox",
          url: "/mail",
          icon: Inbox,
          badge: 128,
        },
        {
          title: "Drafts",
          url: "/under-construction/draft",
          icon: FileText,
          badge: 9,
        },
        {
          title: "Sent",
          url: "/under-construction/sent",
          icon: SendHorizontal,
        },
        {
          title: "Junk",
          url: "/under-construction/junk",
          icon: ArchiveX,
          badge: 23,
        },
        {
          title: "Trash",
          url: "/under-construction/trash",
          icon: Trash2,
        },
        {
          title: "Archive",
          url: "/under-construction/archive",
          icon: Archive,
        },
      ],
    },
    {
      title: "Categories",
      items: [
        {
          title: "Social",
          url: "#",
          icon: Users2,
          badge: 972,
        },
        {
          title: "Updates",
          url: "#",
          icon: Bell,
          badge: 342,
        },
        {
          title: "Forums",
          url: "#",
          icon: MessageSquare,
          badge: 128,
        },
        {
          title: "Shopping",
          url: "#",
          icon: ShoppingCart,
          badge: 8,
        },
        {
          title: "Promotions",
          url: "#",
          icon: Tag,
          badge: 21,
        },
      ],
    },
    {
      title: "Advanced",
      items: [
        {
          title: "Analytics",
          url: "#",
          icon: ChartLine,
        },
        {
          title: "Developers",
          url: "#",
          icon: Code,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [composeOpen, setComposeOpen] = React.useState(false);

  const handleComposeClick = React.useCallback(() => {
    setComposeOpen(true);
  }, []);

  // Memoized compose button component
  const ComposeButton = React.memo(function ComposeButton() {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="bg-primary px-3 py-5 text-primary-foreground transition-[margin] hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground group-data-[collapsible=icon]:mx-0"
            onClick={handleComposeClick}
          >
            <Pencil className="size-4" />
            <span>Compose</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  });

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="mt-1">
          {/* <AccountSwitcher accounts={data.accounts} /> */}
          <SidebarToggle className="hidden w-fit md:block" />
          <ComposeButton />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <MailCompose
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        aria-label="Compose email dialog"
      />
    </>
  );
}
