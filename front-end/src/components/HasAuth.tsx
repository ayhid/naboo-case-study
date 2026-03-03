import { useAuth } from "@/hooks";
import { ReactNode } from "react";

interface HasAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function HasAuth({
  children,
  fallback = null,
  loadingFallback = null,
}: HasAuthProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <>{loadingFallback}</>;
  if (!user) return <>{fallback}</>;

  return <>{children}</>;
}
