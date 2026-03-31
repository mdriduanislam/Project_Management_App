import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const acceptSchema = z.object({ token: z.string() });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { token } = acceptSchema.parse(body);

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    const existing = await prisma.membership.findUnique({
      where: { clerkUserId_orgId: { clerkUserId: userId, orgId: invitation.orgId } },
    });

    if (existing) {
      return NextResponse.json({ orgId: invitation.orgId });
    }

    await prisma.membership.create({
      data: {
        clerkUserId: userId,
        orgId: invitation.orgId,
        role: invitation.role,
      },
    });

    await prisma.invitation.delete({ where: { id: invitation.id } });

    return NextResponse.json({ orgId: invitation.orgId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
