"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Copy, Check, Mail } from "lucide-react";
import { canManageMembers } from "@/lib/rbac-utils";
import { format } from "date-fns";

interface Member {
  id: string;
  clerkUserId: string;
  role: Role;
  createdAt: string;
  isCurrentUser: boolean;
}

interface MembersClientProps {
  members: Member[];
  orgId: string;
  userRole: Role;
}

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "default",
  member: "secondary",
  viewer: "outline",
};

export function MembersClient({ members, orgId, userRole }: MembersClientProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const canInvite = canManageMembers(userRole);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (data.inviteUrl) {
        setInviteUrl(data.inviteUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500">{members.length} member{members.length !== 1 ? "s" : ""} in this organization</p>
        </div>
        {canInvite && (
          <Dialog open={inviteOpen} onOpenChange={(v) => { setInviteOpen(v); if (!v) { setEmail(""); setInviteUrl(""); } }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              {!inviteUrl ? (
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Invite Link"}</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 truncate flex-1">{inviteUrl}</p>
                    <Button size="sm" variant="outline" onClick={handleCopy} className="flex-shrink-0">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Share this link with {email}. It expires in 7 days.</p>
                  <Button className="w-full" onClick={() => setInviteOpen(false)}>Done</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 px-4 py-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.clerkUserId.slice(0, 12)}...
                  {member.isCurrentUser && <span className="text-xs text-blue-600 ml-1">(You)</span>}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Joined {format(new Date(member.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <Badge variant={roleBadgeVariant[member.role]} className="capitalize text-xs">
              {member.role}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
