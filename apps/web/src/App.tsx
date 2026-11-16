import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  env: string;
  timestamp: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = () => {
    setError(null);
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "4rem auto",
        fontFamily: "system-ui, sans-serif",
        padding: "0 1rem",
      }}
    >
      <h1>BKHome 主頁</h1>
      <p>系統基礎架構已啟動，準備進入使用者與 SSO 模組開發。</p>

      <div
        style={{
          padding: "1.25rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "1.5rem",
        }}
      >
        <h3>後端 API 連線狀態</h3>
        {error ? (
          <p style={{ color: "crimson" }}>連線失敗：{error}</p>
        ) : health ? (
          <ul>
            <li>
              狀態：<strong>{health.status}</strong>
            </li>
            <li>
              運行環境：<strong>{health.env}</strong>
            </li>
            <li>伺服器時間：{health.timestamp}</li>
          </ul>
        ) : (
          <p>正在連線至後端...</p>
        )}
        <button
          onClick={checkHealth}
          style={{
            marginTop: "0.5rem",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
          }}
        >
          重新檢測
        </button>
      </div>
    </div>
  );
}

/*
import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState<string>("Checking API...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(`API Online (${data.env})`))
      .catch(() => setStatus("API Offline"));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>BKHome System</h1>
      <p>
        Backend Status: <strong>{status}</strong>
      </p>
    </main>
  );
}
*/
