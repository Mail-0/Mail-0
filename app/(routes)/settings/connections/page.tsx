"use client";

import { ConnectionsList } from "@/components/mail/connections-list";
import { SettingsCard } from "@/components/settings/settings-card";

export default function ConnectionsPage() {
  return (
    <div className="grid gap-6">
      <SettingsCard title="Email Connections" description="Connect your email accounts to Mail0.">
        <ConnectionsList />
      </SettingsCard>
    </div>
  );
}
