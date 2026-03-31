import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export function StatsCards({ totalTasks, completedTasks, overdueTasks }: StatsCardsProps) {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
          <Clock className="w-5 h-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
          <p className="text-xs text-gray-500 mt-1">Across all projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
          <p className="text-xs text-gray-500 mt-1">{completionRate}% completion rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900">{overdueTasks}</p>
          <p className="text-xs text-gray-500 mt-1">Needs attention</p>
        </CardContent>
      </Card>
    </div>
  );
}
