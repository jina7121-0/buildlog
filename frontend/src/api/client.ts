export type User = {
  id: number;
  email: string;
  nickname: string;
};

type ValidationDetail = {
  msg?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function errorMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: ValidationDetail) => item.msg)
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) return messages.join(" ");
  }
  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    throw new ApiError(errorMessage(body?.detail), response.status);
  }

  return (await response.json()) as T;
}

export function signup(email: string, password: string, nickname: string): Promise<User> {
  return apiRequest<User>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname }),
  });
}

export function login(email: string, password: string): Promise<User> {
  return apiRequest<User>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function readCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/auth/me");
}

export function updateNickname(nickname: string): Promise<User> {
  return apiRequest<User>("/api/users/me/nickname", {
    method: "PATCH",
    body: JSON.stringify({ nickname }),
  });
}
