import { UserButton } from "@clerk/nextjs";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  orgName: string;
  userRole: Role;
}

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline" | "destructive"> = {
  owner: "default",
  admin: "default",
  member: "secondary",
  viewer: "outline",
};

export function Header({ orgName, userRole }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm text-gray-500 font-medium">{orgName}</h2>
        <Badge variant={roleBadgeVariant[userRole]} className="capitalize text-xs">
          {userRole}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <UserButton />
      </div>
    </header>
  );
}
