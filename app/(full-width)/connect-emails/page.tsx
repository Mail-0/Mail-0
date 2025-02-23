"use client";

import { ConnectionsList } from "@/components/mail/connections-list";
import { useConnections } from "@/hooks/use-connections";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ConnectEmails() {
  const { data: connections } = useConnections();

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col gap-4 overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-1 px-4 text-center">
          <h3 className="text-xl font-semibold">Connect your emails</h3>
          <p className="text-sm text-muted-foreground">Connect your emails to your Mail0 account</p>
        </div>
        <ConnectionsList />
        <Link href="/mail" className="w-full">
          <Button className="w-full gap-2" disabled={!connections?.length}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
