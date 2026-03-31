import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name } = createOrgSchema.parse(body);
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        memberships: {
          create: { clerkUserId: userId, role: "owner" },
        },
      },
    });

    return NextResponse.json(org);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
