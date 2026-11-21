import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router";
import { LoginForm } from "./features/auth/LoginForm";
import { RegisterForm } from "./features/auth/RegisterForm";
import logoPNG from "./assets/BKHome-128.png";

interface HealthResponse {
  status: string;
  env: string;
  timestamp: string;
}

function HomePage() {
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={checkHealth}
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.8rem",
            }}
          >
            重新檢測
          </button>
          <a
            className="a-button"
            href="login"
            style={{
              padding: "0.2rem 0.8rem",
              cursor: "pointer",
            }}
          >
            登入帳號
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <a
        href="/"
        style={{
          display: "inline-block",
          width: "64px",
          height: "64px",
        }}
      >
        <img
          src={logoPNG}
          alt="BKHome Home Page"
          style={{
            display: "inline-block",
            width: "64px",
            height: "64px",
          }}
        ></img>
      </a>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
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
