import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  total: number;
  completed: number;
}

interface ProjectProgressListProps {
  projects: Project[];
  orgId: string;
}

export function ProjectProgressList({ projects, orgId }: ProjectProgressListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Project Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No projects yet.{" "}
            <Link href={`/org/${orgId}/projects`} className="text-blue-600 hover:underline">
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const pct = project.total > 0 ? Math.round((project.completed / project.total) * 100) : 0;
              return (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/org/${orgId}/projects`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate max-w-[200px]"
                    >
                      {project.name}
                    </Link>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {project.completed}/{project.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}%</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
