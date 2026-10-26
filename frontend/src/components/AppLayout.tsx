import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "./AuthContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">BuildLog</Link>
        {user && (
          <nav className="site-nav" aria-label="주요 메뉴">
            <span className="user-chip">{user.nickname}</span>
            <Link to="/settings">계정 설정</Link>
          </nav>
        )}
      </header>
      <main className="content-shell">{children}</main>
    </div>
  );
}
