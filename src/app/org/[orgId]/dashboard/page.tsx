import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TasksChart } from "@/components/dashboard/tasks-chart";
import { ProjectProgressList } from "@/components/dashboard/project-progress-list";

export default async function OrgDashboardPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalTasks, completedTasks, overdueTasks, projects, recentTasks] =
    await Promise.all([
      prisma.task.count({ where: { orgId: params.orgId } }),
      prisma.task.count({ where: { orgId: params.orgId, status: "done" } }),
      prisma.task.count({
        where: {
          orgId: params.orgId,
          status: { not: "done" },
          dueDate: { lt: now },
        },
      }),
      prisma.project.findMany({
        where: { orgId: params.orgId, status: "active" },
        include: {
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          orgId: params.orgId,
          status: "done",
          updatedAt: { gte: sevenDaysAgo },
        },
        select: { updatedAt: true },
      }),
    ]);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
    const count = recentTasks.filter((t) => {
      const d = new Date(t.updatedAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    }).length;
    return { day: dateStr, completed: count };
  });

  const projectProgress = projects.map((p) => ({
    id: p.id,
    name: p.name,
    total: p._count.tasks,
    completed: p.tasks.filter((t) => t.status === "done").length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your organization&apos;s progress</p>
      </div>
      <StatsCards
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        overdueTasks={overdueTasks}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksChart data={chartData} />
        <ProjectProgressList projects={projectProgress} orgId={params.orgId} />
      </div>
    </div>
  );
}
