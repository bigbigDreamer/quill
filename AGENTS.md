# Quill — Agent Rules

## 红线（最高优先级，禁止违反）

**禁止修改以下文件或目录，无论任何理由：**

- `src/` — 所有源代码
- `scripts/` — 构建脚本
- `tsconfig.json` — 编译配置
- `package.json` — 依赖与脚本配置
- `pnpm-lock.yaml` — 锁文件
- `icon.svg` — 图标源文件
- `.vscodeignore` / `.gitignore`

如果任务需要改动上述文件，必须先告知用户并等待明确授权，不得自行修改。

## 允许操作

- 读取任意文件以理解项目结构
- 创建或修改 `README.md`
- 创建或修改 `AGENTS.md` 本文件
