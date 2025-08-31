# Deno Deploy 部署指南

## 问题修复

已修复的主要问题：
1. ✅ 移除了对旧版 `std/http/server.ts` 的依赖
2. ✅ 使用 `Deno.serve` 替代旧的 `serve` 函数
3. ✅ 优化了环境变量的处理
4. ✅ 创建了专门的 Deploy 入口文件
5. ✅ 更新了 std 库版本到 0.224.0

## 部署步骤

### 方法 1：使用 main.ts（推荐）

1. 登录 [Deno Deploy](https://dash.deno.com)
2. 创建新项目
3. 连接你的 GitHub 仓库
4. 设置入口文件为 `main.ts`
5. 配置环境变量：
   ```
   WANDB_API_KEY=your-wandb-api-key
   ```
6. 点击部署

### 方法 2：使用 deploy.ts（备选）

如果 main.ts 仍有问题，可以使用专门的 deploy.ts：

1. 在 Deno Deploy 中设置入口文件为 `deploy.ts`
2. 其他步骤同上

## 本地测试

```bash
# 测试 main.ts
deno run --allow-net --allow-env main.ts

# 类型检查
deno check main.ts
deno check deploy.ts

# 格式化代码
deno fmt

# 代码检查
deno lint
```

## 环境变量

- `PORT`: 服务器端口（Deno Deploy 会自动设置）
- `WANDB_API_KEY`: WandB API 密钥（可选，也可以通过请求头传递）

## 故障排除

### Warm up 错误

如果仍然遇到 warm up 错误，请检查：

1. **确保使用最新的 Deno 版本**
   ```bash
   deno --version
   ```

2. **清理缓存**
   ```bash
   deno cache --reload main.ts
   ```

3. **检查导入路径**
   - 确保所有相对路径都正确
   - 避免使用需要文件系统访问的功能

4. **查看 Deno Deploy 日志**
   - 在 Deno Deploy 控制台查看详细错误信息

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Module not found | 导入路径错误 | 检查所有 import 语句 |
| Permission denied | 权限不足 | Deno Deploy 自动处理权限 |
| Port already in use | 端口冲突 | 使用环境变量 PORT |
| WANDB_API_KEY not set | 缺少 API 密钥 | 在 Deploy 设置环境变量 |

## 测试部署

部署成功后，可以使用以下命令测试：

```bash
# 测试获取模型列表
curl https://your-app.deno.dev/v1/models \
  -H "Authorization: Bearer YOUR_WANDB_API_KEY"

# 测试聊天完成
curl https://your-app.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WANDB_API_KEY" \
  -d '{
    "model": "meta-llama/Llama-3.3-70B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 更新记录

- 2024-08-31: 修复 Deno Deploy warm up 错误
  - 更新为使用 `Deno.serve`
  - 移除对旧版 std 库的依赖
  - 优化环境变量处理
  - 创建专门的 deploy.ts 入口文件
