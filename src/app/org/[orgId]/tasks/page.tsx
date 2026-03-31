import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [tasks, projects, members, membership] = await Promise.all([
    prisma.task.findMany({
      where: { orgId },
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, clerkUserId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { orgId, status: "active" },
      select: { id: true, name: true },
    }),
    prisma.membership.findMany({
      where: { orgId },
      select: { id: true, clerkUserId: true, role: true },
    }),
    prisma.membership.findUnique({
      where: { clerkUserId_orgId: { clerkUserId: userId, orgId } },
    }),
  ]);

  if (!membership) redirect("/dashboard");

  const taskData = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() || null,
    projectId: t.projectId,
    projectName: t.project.name,
    assigneeId: t.assigneeId,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <TasksClient
      tasks={taskData}
      projects={projects}
      members={members}
      orgId={orgId}
      userRole={membership.role}
    />
  );
}
