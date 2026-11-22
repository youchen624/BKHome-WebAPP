import { useState } from 'react';

export default function CopyButton({ textToCopy = '這是要複製的文字內容' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      // 2 秒後恢復原本的按鈕文字
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  return (
    <button onClick={handleCopy} type="button">
      {copied ? '✅ 已複製！' : '📋 複製內容'}
    </button>
  );
}
