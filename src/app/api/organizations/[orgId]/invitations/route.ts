import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireOrgMembership } from "@/lib/rbac";
import { z } from "zod";

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await requireOrgMembership(orgId, "admin");

    const body = await req.json();
    const { email, role } = createInviteSchema.parse(body);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: { orgId, email, role, expiresAt },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invitation.token}`;

    return NextResponse.json({ ...invitation, inviteUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await requireOrgMembership(orgId, "admin");

    const invitations = await prisma.invitation.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
