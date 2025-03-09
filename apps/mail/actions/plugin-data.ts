"use server";

import { pluginData } from "@zero/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function getPluginData(pluginId: string, key: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) return null;

  const data = await db
    .select()
    .from(pluginData)
    .where(
      and(
        eq(pluginData.pluginId, pluginId),
        eq(pluginData.userId, session.user.id),
        eq(pluginData.key, key),
      ),
    )
    .limit(1);

  return data[0]?.data || null;
}

export async function setPluginData(pluginId: string, key: string, data: any) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .insert(pluginData)
    .values({
      pluginId,
      userId: session.user.id,
      key,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [pluginData.pluginId, pluginData.userId, pluginData.key],
      set: {
        data,
        updatedAt: new Date(),
      },
    });
}

export async function deletePluginData(pluginId: string, key: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(pluginData)
    .where(
      and(
        eq(pluginData.pluginId, pluginId),
        eq(pluginData.userId, session.user.id),
        eq(pluginData.key, key),
      ),
    );
}
