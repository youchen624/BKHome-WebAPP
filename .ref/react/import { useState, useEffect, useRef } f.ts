import { useState, useEffect, useRef } from 'react';

export default function ChatRoom({ roomId = 'general' }) {
  const [messages, setMessages] = useState([]);      // 聊天訊息列表
  const [inputText, setInputText] = useState('');    // 輸入框文字
  const [status, setStatus] = useState('連線中...'); // 連線狀態
  
  // 使用 useRef 保存 WebSocket 實例，避免每次重新渲染都遺失連線參考
  const wsRef = useRef(null);

  // 核心：透過 useEffect 管理 WebSocket 生命週期
  useEffect(() => {
    setStatus('連線中...');
    
    // 1. 建立連線（這裡使用公開測試伺服器，實務上換成你的後端 wss:// 網址）
    const ws = new WebSocket(`wss://echo.websocket.org`);
    wsRef.current = ws;

    // 2. 監聽：連線成功開啟
    ws.onopen = () => {
      setStatus('已連線 🟢');
      // 實務上常在這裡送出「加入特定房間」或「身分驗證 Token」的初始封包
      ws.send(JSON.stringify({ type: 'JOIN', room: roomId }));
    };

    // 3. 監聽：收到伺服器推播的訊息
    ws.onmessage = (event) => {
      // 注意：必須使用函式更新 (prev => ...)，才能拿到最新的訊息陣列，避免閉包陷阱
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), text: event.data, time: new Date().toLocaleTimeString() }
      ]);
    };

    // 4. 監聽：發生錯誤或連線關閉
    ws.onerror = () => setStatus('連線錯誤 🔴');
    ws.onclose = () => setStatus('已斷線 ⚫');

    // 5. 清理函式：離開頁面或切換 roomId 時，務必關閉舊連線
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]); // 當 roomId 改變時，會自動斷開舊房間並連上新房間

  // 發送訊息的函式（由使用者點擊按鈕或按 Enter 觸發）
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 確認連線狀態為 OPEN (readyState === 1) 才發送
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(inputText);
      setInputText(''); // 清空輸入框
    } else {
      alert('尚未連線，無法發送訊息');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h3>房間：{roomId}（{status}）</h3>

      {/* 訊息顯示區 */}
      <div style={{ height: 250, overflowY: 'auto', border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 6 }}>
            <small style={{ color: '#888' }}>[{msg.time}] </small>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      {/* 輸入與發送表單 */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="輸入訊息..."
          style={{ flex: 1, padding: 6 }}
        />
        <button type="submit">發送</button>
      </form>
    </div>
  );
}
