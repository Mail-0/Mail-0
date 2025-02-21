import { createDriver } from "../../driver";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export const GET = async ({ headers, nextUrl }: NextRequest) => {
  const searchParams = nextUrl.searchParams;
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
    auth: {
      access_token: _connection.accessToken,
      refresh_token: _connection.refreshToken,
    },
  });

  if (!searchParams.has("folder")) return new Response("Bad Request", { status: 400 });

  return new Response(
    JSON.stringify(
      await driver.list(
        searchParams.get("folder")!,
        searchParams.get("q") ?? undefined,
        Number(searchParams.get("max")) ? +searchParams.get("max")! : undefined,
        searchParams.get("labelIds") ? searchParams.get("labelIds")!.split(",") : undefined,
      ),
    ),
  );
};
