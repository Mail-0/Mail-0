import { createDriver } from "../../../driver";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export const GET = async ({ headers }: NextRequest) => {
  const session = await auth.api.getSession({ headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const foundAccount = await db.account.findFirst({
    where: {
      userId: session.user.id,
    },
    take: 1,
  });
  if (!foundAccount?.accessToken || !foundAccount.refreshToken)
    return new Response("Unauthorized, reconnect", { status: 401 });
  const driver = await createDriver(foundAccount.providerId, {
    auth: {
      access_token: foundAccount.accessToken,
      refresh_token: foundAccount.refreshToken,
    },
  });
  return new Response(JSON.stringify(await driver.count()));
};
