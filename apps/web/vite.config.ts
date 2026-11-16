import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envDir: "../../", // 指向最外層根目錄 bkhome/.env
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // 如果未來聊天功能用到 WebSocket，順手把這段打開即可：
      // '/ws': {
      //   target: 'ws://localhost:3000',
      //   ws: true,
      // },
    },
  },
});
