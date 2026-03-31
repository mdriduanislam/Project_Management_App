import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const membership = await prisma.membership.findUnique({
    where: { clerkUserId_orgId: { clerkUserId: userId, orgId: params.orgId } },
    include: { organization: true },
  });

  if (!membership) redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar orgId={params.orgId} orgName={membership.organization.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header orgName={membership.organization.name} userRole={membership.role} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
