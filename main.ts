// 使用更新的 std 版本以确保兼容性
import { handleModelsRequest, handleChatCompletionsRequest } from "./src/handlers.ts";
import {
  addCorsHeaders,
  validateAuth,
  methodNotAllowed,
  notFound,
  internalError,
  createOptionsResponse
} from "./src/utils.ts";

// Deno Deploy 会自动设置 PORT 环境变量
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const WANDB_API_KEY = Deno.env.get("WANDB_API_KEY") || "";

export async function handler(request: Request): Promise<Response> {
  try {
    // 处理预检请求
    if (request.method === "OPTIONS") {
      return createOptionsResponse();
    }

    // 处理基本HTTP方法限制
    if (request.method !== "GET" && request.method !== "POST") {
      return addCorsHeaders(methodNotAllowed());
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // 验证授权
    let authHeader = request.headers.get("Authorization");
    
    // 如果环境变量设置了WANDB_API_KEY，则使用它
    if (!authHeader && WANDB_API_KEY) {
      authHeader = `Bearer ${WANDB_API_KEY}`;
    }
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return addCorsHeaders(
        new Response(JSON.stringify({
          error: {
            message: "Missing or invalid Authorization header. Use Bearer token.",
            type: "invalid_request_error"
          }
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        })
      );
    }

    // 路由分发
    if (pathname === "/v1/models" && request.method === "GET") {
      return handleModelsRequest(authHeader, request).then(addCorsHeaders);
    } else if (pathname === "/v1/chat/completions" && request.method === "POST") {
      return handleChatCompletionsRequest(authHeader, request).then(addCorsHeaders);
    } else {
      return addCorsHeaders(notFound());
    }

  } catch (error) {
    console.error("Server error:", error);
    return addCorsHeaders(internalError(error));
  }
}

// Deno Deploy 兼容性处理
// Deno Deploy 会自动调用默认导出的 handler
export default handler;

// 本地开发环境
if (import.meta.main) {
  console.log(`Server starting...`);
  
  if (!WANDB_API_KEY) {
    console.warn(`⚠️  WARNING: WANDB_API_KEY environment variable is not set.`);
    console.warn(`   You must provide Authorization header with requests.`);
  } else {
    console.log(`✅ Using WANDB_API_KEY from environment`);
  }

  // 使用 Deno.serve 替代旧的 serve 函数（Deno 1.35+ 推荐）
  Deno.serve({
    port: PORT,
    handler,
    onListen: ({ hostname, port }) => {
      console.log(`🚀 Server listening on http://${hostname}:${port}`);
    },
  });
}
