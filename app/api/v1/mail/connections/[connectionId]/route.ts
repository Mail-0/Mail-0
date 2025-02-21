import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { connectionId } = await params;

    await db.connection.delete({
      where: {
        id: connectionId,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete connection:", error);
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { connectionId } = await params;

    const foundConnection = await db.connection.findFirst({
      where: {
        id: connectionId,
        userId: userId,
      },
      take: 1,
    });

    if (!foundConnection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        defaultConnectionId: foundConnection.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update connection:", error);
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}
