/**
 * Deno Deploy 入口文件
 * 这个文件专门为 Deno Deploy 优化
 */

import { handler } from "./main.ts";

// Deno Deploy 会自动调用默认导出的函数
// 确保 handler 函数签名符合 Deno Deploy 的要求
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      return await handler(request);
    } catch (error) {
      console.error("Deploy handler error:", error);
      return new Response(
        JSON.stringify({
          error: {
            message: error instanceof Error ? error.message : "Internal server error",
            type: "server_error"
          }
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        }
      );
    }
  }
};
