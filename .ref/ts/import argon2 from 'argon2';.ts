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
