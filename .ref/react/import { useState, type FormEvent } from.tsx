import { useState, type FormEvent } from "react";
import { LoginSchema, type PublicUser } from "@bkhome/core";

interface LoginFormProps {
  onLoginSuccess: (user: PublicUser) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  // 1. JS 狀態與邏輯寫在 return 上方
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 阻止瀏覽器預設送出表單導致整頁重整
    setErrorMsg(null);

    // 用 @bkhome/core 的 Zod Schema 先檢查格式
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "輸入格式不正確");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/tokens", {
        method: "POST",
        credentials: "include", // 關鍵：允許接收後端的 HttpOnly Cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "登入失敗");
        return;
      }

      // 登入成功！通知父元件更新 user 狀態（不需要 location.reload()）
      onLoginSuccess(data.user);
    } catch {
      setErrorMsg("無法連線至伺服器");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. return 裡面只放單純的 JSX 畫面與事件綁定
  return (
    <div style={{ maxWidth: 360, margin: "4rem auto" }}>
      <h2>登入 BKHome</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}