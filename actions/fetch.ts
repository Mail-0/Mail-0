"use server";

import { createDriver } from "@/app/api/driver";
import { connection } from "@/db/schema";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function fetchEmails({
  folder = "inbox",
  max = "10",
  query,
}: {
  folder?: string;
  max?: string;
  query?: string;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) throw new Error("Unauthorized");

  const [_connection] = await db
    .select()
    .from(connection)
    .where(eq(connection.userId, session.user.id))
    .orderBy(connection.createdAt);

  if (!_connection?.accessToken || !_connection.refreshToken) {
    throw new Error("Unauthorized, reconnect");
  }

  const driver = await createDriver(_connection.providerId, {
    auth: {
      access_token: _connection.accessToken,
      refresh_token: _connection.refreshToken,
    },
  });

  const response = await driver.list(folder, query, max ? parseInt(max) : undefined);
  return response;
}
