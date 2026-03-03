import { UserRole } from "@/constants/role";
import { useAuth } from "@/hooks";
import { hasRole } from "@/utils";
import { ReactNode } from "react";

interface HasRoleProps {
  role: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function HasRole({ role, children, fallback = null }: HasRoleProps) {
  const { user } = useAuth();

  if (!hasRole(user?.role, role)) return <>{fallback}</>;

  return <>{children}</>;
}
