import express from "express";
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db/index.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// 1. 基礎健康檢查路由
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "DEV",
    timestamp: new Date().toISOString(),
  });
});

// 2. 正式環境：由 Express 直接託管編譯後的 Web 前端檔案
if (process.env.NODE_ENV === "PROD") {
  // Node 22 內建 import.meta.dirname，編譯後位於 apps/api/dist，退兩層即為 apps/
  const webDistPath = path.resolve(import.meta.dirname, "../../web/dist");
  app.use(express.static(webDistPath));

  // Express 5 標準 SPA 路由寫法（取代舊版 '*'）
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(webDistPath, "index.html"));
  });
}

async function startServer() {
  if (process.env.NODE_ENV === "PROD") {
    const migrationsFolder = path.resolve(import.meta.dirname, "../drizzle");
    console.log("[bkhome-api] Running database migrations...");
    await migrate(db, { migrationsFolder });
    console.log("[bkhome-api] Database migrations completed.");
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    // await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log(
      `[bkhome-api] Running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "DEV"})`,
    );
  });

  process.on("SIGTERM", () => {
    server.close(() => process.exit(0));
  });
}

startServer().catch(e=>{
  console.error("[API] Failed to start server", e);
  process.exit(1);
});
