import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext";

function LoadingScreen() {
  return <div className="loading-screen">로그인 상태를 확인하고 있습니다…</div>;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user !== null) return <Navigate to="/" replace />;
  return children;
}
