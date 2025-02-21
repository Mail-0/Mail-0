import { createDriver } from "../../../driver";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export const GET = async (
  { headers }: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const session = await auth.api.getSession({ headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (!session.connectionId) return new Response("Unauthorized", { status: 401 });

  // Updated to use googleConnection table
  const _connection = await db.connection.findFirst({
    where: {
      userId: session.user.id,
      id: session.connectionId,
    },
    take: 1,
  });

  if (!_connection?.accessToken || !_connection.refreshToken)
    return new Response("Unauthorized, reconnect", { status: 401 });

  const driver = await createDriver(_connection.providerId, {
    // Assuming "google" is the provider ID
    auth: {
      access_token: _connection.accessToken,
      refresh_token: _connection.refreshToken,
    },
  });

  const res = await driver.get(id);
  return new Response(JSON.stringify(res));
};
