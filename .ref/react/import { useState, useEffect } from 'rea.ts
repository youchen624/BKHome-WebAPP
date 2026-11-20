import { useState, useEffect } from 'react';

function LiveDashboard() {
  const [time, setTime] = useState(new Date());
  const [messages, setMessages] = useState([]);

  // 1. 自動跳動的時鐘
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date()); // 每秒自動更新 State -> 觸發畫面重繪
    }, 1000);

    return () => clearInterval(timer); // 元件移除時關閉計時器
  }, []);

  // 2. WebSocket 聊天室即時接收
  useEffect(() => {
    const ws = new WebSocket('wss://://example.com');

    // 只要伺服器推播訊息過來，就會自動執行這裡，不用使用者點擊
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => ws.close(); // 元件移除時斷開連線
  }, []);

  return (
    <div>
      <h3>現在時間：{time.toLocaleTimeString()}</h3>
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
}
