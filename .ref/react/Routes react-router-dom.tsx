import { Routes, Route, Link } from "react-router-dom";

// 假設這是你的兩個頁面元件
function HomePage() {
  return <h1>這是首頁 (/)</h1>;
}

function LoginPage() {
  return <h1>這是登入頁面 (/login)</h1>;
}

export default function App() {
  return (
    <div>
      {/* 導覽列：使用 Link 進行無刷新跳轉 */}
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/">回首頁</Link>
        <Link to="/login">前往登入</Link>
      </nav>

      {/* 路由表：根據目前網址決定要渲染哪個元件 */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* 找不到頁面時的預設處理 (404) */}
        <Route path="*" element={<h1>404 找不到此頁面</h1>} />
      </Routes>
    </div>
  );
}