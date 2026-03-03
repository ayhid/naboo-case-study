import { UserRole } from "@/constants/role";

export function hasRole(
  userRole: string | null | undefined,
  allowedRole: UserRole
): boolean {
  if (!userRole) return false;
  return userRole === allowedRole;
}
