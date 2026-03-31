import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "@/components/projects/projects-client";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [projects, membership] = await Promise.all([
    prisma.project.findMany({
      where: { orgId },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membership.findUnique({
      where: { clerkUserId_orgId: { clerkUserId: userId, orgId } },
    }),
  ]);

  if (!membership) redirect("/dashboard");

  const projectData = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    totalTasks: p._count.tasks,
    completedTasks: p.tasks.filter((t) => t.status === "done").length,
  }));

  return (
    <ProjectsClient
      projects={projectData}
      orgId={orgId}
      userRole={membership.role}
    />
  );
}
