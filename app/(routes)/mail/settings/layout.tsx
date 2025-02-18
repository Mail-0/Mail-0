"use client";

import { SettingsNavigation } from "./settings-navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SettingsLayoutSkeleton />}>
      <SettingsLayoutContent>{children}</SettingsLayoutContent>
    </Suspense>
  );
}

function SettingsLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = searchParams.get("from") || "/mail";
  const mailPath = returnPath.startsWith("/mail/settings") ? "/mail" : returnPath;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="mx-auto w-full flex-1 p-2 pb-0 md:p-4 md:pb-0 lg:p-6 lg:pb-0">
        <div className="sticky top-0 z-20 -mx-4 bg-background/95 px-4 pb-8 backdrop-blur duration-200 supports-[backdrop-filter]:bg-background/60 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(mailPath)}
              className="gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Manage your account and preferences.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 pt-4 md:flex-row">
          <div className="md:sticky md:top-[156px] md:h-fit">
            <SettingsNavigation />
          </div>

          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-360px)] pb-4 md:h-[calc(100vh-320px)]">
              {children}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="mx-auto w-full max-w-[1600px] flex-1 p-4 pb-0 md:p-6 md:pb-0 lg:p-8 lg:pb-0">
        <div className="animate-pulse">
          <div className="h-8 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
