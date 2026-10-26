import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  timezone: string;
};

type ConnectionState =
  | { kind: "loading" }
  | { kind: "connected"; data: HealthResponse }
  | { kind: "error" };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function App() {
  const [connection, setConnection] = useState<ConnectionState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function checkBackend() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/health`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Backend health check failed");
        }

        const data = (await response.json()) as HealthResponse;
        setConnection({ kind: "connected", data });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setConnection({ kind: "error" });
      }
    }

    void checkBackend();

    return () => controller.abort();
  }, []);

  return (
    <main className="page-shell">
      <section className="welcome-card" aria-labelledby="page-title">
        <p className="eyebrow">Study · Build · Remember</p>
        <h1 id="page-title">BuildLog</h1>
        <p className="description">
          공부한 내용과 해결한 오류, 앞으로 할 일을 한곳에 기록하는 공간입니다.
        </p>

        <div className={`connection connection--${connection.kind}`} aria-live="polite">
          {connection.kind === "loading" && "백엔드 연결을 확인하고 있습니다…"}
          {connection.kind === "error" &&
            "백엔드에 연결하지 못했습니다. FastAPI 서버가 실행 중인지 확인해주세요."}
          {connection.kind === "connected" && (
            <>
              <span className="connection__dot" aria-hidden="true" />
              {connection.data.service} 연결 완료 · {connection.data.timezone}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
