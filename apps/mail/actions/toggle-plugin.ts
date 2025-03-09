"use server";

import { pluginSettings } from "@zero/db/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function togglePlugin(pluginId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const existingSetting = await db.query.pluginSettings.findFirst({
      where: and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
    });

    if (!existingSetting) {
      throw new Error("Plugin not installed");
    }

    if (!existingSetting.added) {
      throw new Error("Plugin not added to user account");
    }

    await db
      .update(pluginSettings)
      .set({
        enabled: !existingSetting.enabled,
        updatedAt: new Date(),
      })
      .where(
        and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
      );

    revalidatePath("/plugins");
    revalidatePath("/settings/plugins");

    return { success: true };
  } catch (error) {
    console.error("Error toggling plugin:", error);
    throw error;
  }
}
