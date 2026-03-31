import { Role } from "@prisma/client";

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function canManageMembers(role: Role) {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["admin"];
}

export function canManageProjects(role: Role) {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["member"];
}

export function canDeleteProjects(role: Role) {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["admin"];
}
