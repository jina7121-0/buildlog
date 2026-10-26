import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import {
  ApiError,
  login as loginRequest,
  readCurrentUser,
  signup as signupRequest,
  updateNickname as updateNicknameRequest,
  type User,
} from "../api/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    readCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (active && (!(error instanceof ApiError) || error.status !== 401)) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signup: async (email, password, nickname) => {
        setUser(await signupRequest(email, password, nickname));
      },
      login: async (email, password) => {
        setUser(await loginRequest(email, password));
      },
      updateNickname: async (nickname) => {
        setUser(await updateNicknameRequest(nickname));
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
