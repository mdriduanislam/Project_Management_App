import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MembersClient } from "@/components/members/members-client";

export default async function MembersPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [members, membership] = await Promise.all([
    prisma.membership.findMany({
      where: { orgId: params.orgId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.membership.findUnique({
      where: { clerkUserId_orgId: { clerkUserId: userId, orgId: params.orgId } },
    }),
  ]);

  if (!membership) redirect("/dashboard");

  return (
    <MembersClient
      members={members.map((m) => ({
        id: m.id,
        clerkUserId: m.clerkUserId,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
        isCurrentUser: m.clerkUserId === userId,
      }))}
      orgId={params.orgId}
      userRole={membership.role}
    />
  );
}
