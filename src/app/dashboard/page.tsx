import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const membership = await prisma.membership.findFirst({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) redirect("/onboarding");
  redirect(`/org/${membership.orgId}/dashboard`);
}
