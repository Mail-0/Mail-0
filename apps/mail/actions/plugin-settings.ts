"use server";

import { pluginSettings } from "@zero/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function getPluginSettings(pluginId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) return { enabled: true, added: false }; // Default state if no user

  const settings = await db
    .select()
    .from(pluginSettings)
    .where(and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)))
    .execute();

  const setting = settings[0];
  return {
    enabled: setting?.enabled ?? false,
    added: setting?.added ?? false,
  };
}

export async function setPluginSettings(pluginId: string, enabled: boolean) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) throw new Error("User not authenticated");

  const existingSetting = await db.query.pluginSettings.findFirst({
    where: and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
  });

  if (!existingSetting?.added) {
    throw new Error("Cannot toggle a plugin that is not added to your account");
  }

  await db
    .update(pluginSettings)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(
      and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
    )
    .execute();

  return { success: true };
}

export async function getAllPluginSettings() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) return {};

  const settings = await db
    .select()
    .from(pluginSettings)
    .where(eq(pluginSettings.userId, session.user.id))
    .execute();

  return Object.fromEntries(
    settings
      .filter((s) => s.added) // Only return settings for added plugins
      .map((s) => [s.pluginId, { enabled: s.enabled, added: s.added }])
  );
}
