"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlignVerticalSpaceAround, ArchiveX, BellOff, SearchIcon, X, Inbox, Tag, Users, AlertTriangle, MessageSquare, User, Bell } from "lucide-react";
import { useState, useCallback, useMemo, useEffect, ReactNode, useRef } from "react";
import { ThreadDisplay } from "@/components/mail/thread-display";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useSearchValue } from "@/hooks/use-search-value";
import { MailList } from "@/components/mail/mail-list";
import { useMail } from "@/components/mail/use-mail";
import { SidebarToggle } from "../ui/sidebar-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useSearchParams } from "next/navigation";
import { useThreads } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import { useHotKey } from "@/hooks/use-hot-key";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { SearchBar } from "./search-bar";
import { cn } from "@/lib/utils";

export function MailLayout() {
  const { folder } = useParams<{ folder: string }>()
  const [searchMode, setSearchMode] = useState(false);
  const [searchValue] = useSearchValue();
  const [mail, setMail] = useMail();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [filterValue, setFilterValue] = useState<"all" | "unread">("all");
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!session?.user && !isPending) {
      router.push("/login");
    }
  }, [session?.user, isPending]);

  const labels = useMemo(() => {
    if (filterValue === "all") {
      if (searchParams.has("category")) {
        return [`CATEGORY_${searchParams.get("category")!.toUpperCase()}`];
      }
      return undefined;
    }
    if (filterValue) {
      if (searchParams.has("category")) {
        return [
          filterValue.toUpperCase(),
          `CATEGORY_${searchParams.get("category")!.toUpperCase()}`,
        ];
      }
      return [filterValue.toUpperCase()];
    }
    return undefined;
  }, [filterValue, searchParams]);

  const { isLoading, isValidating } = useThreads(folder, undefined, searchValue.value, 20);

  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (mail.selected) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [mail.selected]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setMail((mail) => ({ ...mail, selected: null }));
  }, [setMail]);

  useHotKey("/", () => {
    setSearchMode(true);
  });

  useHotKey("Esc", (event) => {
    // @ts-expect-error
    event.preventDefault();
    if (searchMode) {
      setSearchMode(false);
    }
  });

  return (
    <TooltipProvider delayDuration={0}>
      <div className="rounded-inherit flex">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="mail-panel-layout"
          className="rounded-inherit gap-1.5 overflow-hidden"
        >
          <ResizablePanel
            className={cn(
              "border-none !bg-transparent",
              mail?.selected ? "md:hidden lg:block" : "",
            )}
            defaultSize={isMobile ? 100 : 25}
            minSize={isMobile ? 100 : 25}
          >
            <div className="bg-offsetLight dark:bg-offsetDark flex-1 flex-col overflow-y-auto shadow-inner md:flex md:rounded-2xl md:border md:shadow-sm">
              <div className={cn("compose-gradient h-0.5 w-full transition-opacity", isValidating ? "opacity-50" : "opacity-0")} />
              <div
                className={cn(
                  "sticky top-0 z-10 flex items-center justify-between gap-1.5 p-2 transition-colors",
                )}
              >
                <SidebarToggle className="h-fit px-2" />
                {searchMode && (
                  <div className="flex flex-1 items-center justify-center gap-1.5">
                    <SearchBar />
                    <Button
                      variant="ghost"
                      className="md:h-fit md:px-2"
                      onClick={() => setSearchMode(false)}
                    >
                      <X />
                    </Button>
                  </div>
                )}
                
                {!searchMode && (
                  <>
                    {mail.bulkSelected.length > 0 ? (
                      <>
                        <div className="flex flex-1 items-center justify-center">
                          <span className="text-sm font-medium tabular-nums">
                            {mail.bulkSelected.length} selected
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground ml-1.5 h-8 w-fit px-2"
                                onClick={() => setMail({ ...mail, bulkSelected: [] })}
                              >
                                <X />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear Selection</TooltipContent>
                          </Tooltip>
                        </div>
                        <BulkSelectActions />
                      </>
                    ) : (
                      <>
                        <div className="flex-1 text-center text-sm font-medium capitalize">
                          <MailCategoryTabs />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            className="md:h-fit md:px-2"
                            onClick={() => setSearchMode(true)}
                          >
                            <SearchIcon />
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="h-[calc(100dvh-56px)] overflow-hidden pt-0 md:h-[calc(100dvh-(8px+8px+14px+44px))]">
                {isLoading ? (
                  <div className="flex flex-col">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex flex-col px-4 py-3">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="mt-2 h-3 w-32" />
                        <Skeleton className="mt-2 h-3 w-full" />
                        <div className="mt-2 flex gap-2">
                          <Skeleton className="h-4 w-16 rounded-full" />
                          <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <MailList
                      isCompact={true}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>

          {isDesktop && mail.selected && (
            <>
              <ResizableHandle className="opacity-0" />
              <ResizablePanel
                className="shadow-sm md:flex md:rounded-2xl md:border md:shadow-sm bg-offsetLight dark:bg-offsetDark"
                defaultSize={75}
                minSize={25}
              >
                <div className="hidden h-[calc(100vh-(12px+14px))] flex-1 md:block relative">
                  <ThreadDisplay mail={mail.selected} onClose={handleClose} />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent className="bg-offsetLight dark:bg-offsetDark h-[calc(100vh-3rem)] overflow-hidden p-0">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Email Details</DrawerTitle>
              </DrawerHeader>
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <ThreadDisplay mail={mail.selected} onClose={handleClose} isMobile={true} />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </TooltipProvider>
  );
}

function BulkSelectActions() {
  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="md:h-fit md:px-2">
            <BellOff />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mute</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="md:h-fit md:px-2">
            <ArchiveX />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Move to Spam</TooltipContent>
      </Tooltip>
    </div>
  );
}

function MailCategoryTabs() {
  const [, setSearchValue] = useSearchValue();
  const [activeCategory, setActiveCategory] = useState("Primary");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabElementRef = useRef<HTMLButtonElement>(null);

  const categories = [
    { 
      name: "Primary", 
      searchValue: "",
      icon: <Inbox className="h-4 w-4" />,
      colors: "border-0 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800/70"
    },
    { 
      name: "Important", 
      searchValue: "IMPORTANT",
      icon: <AlertTriangle className="h-4 w-4" />,
      colors: "border-0 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:hover:bg-amber-900/30"
    },
    { 
      name: "Personal", 
      searchValue: "PERSONAL",
      icon: <User className="h-4 w-4" />,
      colors: "border-0 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-500 dark:hover:bg-green-900/30"
    },
    { 
      name: "Updates", 
      searchValue: "UPDATES",
      icon: <Bell className="h-4 w-4" />,
      colors: "border-0 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-500 dark:hover:bg-purple-900/30"
    },
    { 
      name: "Promotions", 
      searchValue: "PROMOTIONS",
      icon: <Tag className="h-4 w-4 rotate-90" />,
      colors: "border-0 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-500 dark:hover:bg-red-900/30"
    },
  ];

  const activeTab = categories.find(cat => cat.name === activeCategory);

  useEffect(() => {
    if (activeTab) {
      const value = activeTab.name === "Primary" 
        ? ""
        : `has:${activeTab.searchValue.toLowerCase()}`
      
      setSearchValue({
        value,
        highlight: "",
        folder: "",
      });
    }
  }, [activeCategory, setSearchValue]);

  useEffect(() => {
    const container = containerRef.current;

    if (activeCategory && container) {
      const activeTabElement = activeTabElementRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft;
        const clipRight = offsetLeft + offsetWidth;
        const containerWidth = container?.offsetWidth;
        if (containerWidth) {
          container.style.clipPath = `inset(0 ${Number(100 - (clipRight / containerWidth) * 100).toFixed()}% 0 ${Number((clipLeft / containerWidth) * 100).toFixed()}% round 17px)`;
        }
      }
    }
  }, [activeCategory, activeTabElementRef, containerRef]);

  return (
    <div className="relative w-fit mx-auto">
      <ul className="flex justify-center gap-1.5">
        {categories.map((category) => (
          <li key={category.name}>
            <button
              ref={activeCategory === category.name ? activeTabElementRef : null}
              data-tab={category.name}
              onClick={() => {
                setActiveCategory(category.name);
              }}
              className={cn(
                "flex h-7 items-center gap-1.5 px-2.5 text-xs font-medium rounded-full transition-all duration-200",
                activeCategory === category.name 
                  ? category.colors
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {category.icon}
              <span className="hidden md:inline">{category.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <div 
        aria-hidden 
        className="absolute inset-0 z-10 overflow-hidden transition-[clip-path] duration-300 ease-in-out shadow-sm " 
        ref={containerRef}
      >
        <ul className="flex justify-center gap-1.5">
          {categories.map((category) => (
            <li key={category.name}>
              <button
                data-tab={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                }}
                className={cn(
                  "flex h-7 items-center gap-1.5 px-2.5 text-xs font-medium rounded-full",
                  category.colors
                )}
                tabIndex={-1}
              >
                {category.icon}
                <span className="hidden md:inline">{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
