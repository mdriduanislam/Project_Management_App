import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export { ROLE_HIERARCHY, canManageMembers, canManageProjects, canDeleteProjects } from "./rbac-utils";

export async function getOrgMembership(orgId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.membership.findUnique({
    where: { clerkUserId_orgId: { clerkUserId: userId, orgId } },
  });
}

export async function requireOrgMembership(orgId: string, minRole: Role = "viewer") {
  const { ROLE_HIERARCHY } = await import("./rbac-utils");
  const membership = await getOrgMembership(orgId);
  if (!membership) throw new Error("Not a member of this organization");
  if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error("Insufficient permissions");
  }
  return membership;
}
