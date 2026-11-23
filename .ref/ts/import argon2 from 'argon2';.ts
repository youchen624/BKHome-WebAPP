import argon2 from 'argon2';

// 雜湊密碼
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB (OWASP 推薦最低基準)
    timeCost: 2,       // 迭代次數
    parallelism: 1,    // 平行執行緒數
  });
}

// 驗證密碼
export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  return argon2.verify(hash, plainPassword);
}

/*
const argon2 = require('argon2');

async function verifyLogin(userInput) {
  const storedHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  // 1. 檢查登入是否被禁用（未設定、空字串，或設為 '*'）
  if (!storedHash || storedHash === '*') {
    return false;
  }

  // 2. 檢查輸入是否合法
  if (typeof userInput !== 'string' || userInput.length === 0) {
    return false;
  }

  try {
    // 3. argon2.verify 內部已包含常數時間比對
    return await argon2.verify(storedHash, userInput);
  } catch (err) {
    // 若 .env 裡的雜湊字串格式損毀，verify 會拋出錯誤，這裡安全地回傳 false
    return false;
  }
}

 */