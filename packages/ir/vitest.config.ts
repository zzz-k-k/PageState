//在package里命令里有test，所以运行运行时会加载这个脚本
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",//运行在node环境不是浏览器环境
    include: ["tests/**/*.test.ts"]//只运行tests目录下的test.ts文件
  }
});
