import { OllamaClient } from './ollamaClient';

const PROMPT_EN = `You are a professional Git commit message generator.
Analyze the provided git diff and output a concise, conventional commit message.

Rules:
- Follow Conventional Commits: <type>(<scope>): <description>
- Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci
- Keep the first line under 72 characters
- Use imperative mood ("add" not "added", "fix" not "fixed")
- scope is optional; omit if unclear
- If there are multiple concerns, add bullet points after a blank line
- Output ONLY the commit message — no explanation, no code blocks, no quotes

Example output:
feat(auth): add OAuth2 login with Google provider

- Store refresh tokens in encrypted local storage
- Add token refresh interceptor to axios client`;

const PROMPT_ZH = `你是专业的 Git commit message 生成器。
分析提供的 git diff，输出简洁规范的 commit message。

规则：
- 遵循 Conventional Commits：<type>(<scope>): <description>
- type：feat, fix, docs, style, refactor, perf, test, chore, build, ci
- 第一行不超过 72 字符，description 使用英文祈使句
- scope 可省略
- 多个改动点可在空行后用 bullet points 补充（中文或英文均可）
- 只输出 commit message，不要任何解释、不要代码块、不要引号

输出示例：
feat(auth): add OAuth2 login with Google provider

- 本地加密存储 refresh token
- 为 axios 添加 token 自动刷新拦截器`;

export async function generateCommitMessage(
  client: OllamaClient,
  model: string,
  diff: string,
  language: 'en' | 'zh',
  maxDiffLength: number,
  signal?: AbortSignal
): Promise<string> {
  const systemPrompt = language === 'zh' ? PROMPT_ZH : PROMPT_EN;
  const truncatedDiff = diff.length > maxDiffLength
    ? diff.slice(0, maxDiffLength) + '\n\n... (diff truncated)'
    : diff;

  const prompt = `${systemPrompt}\n\nGit diff:\n${truncatedDiff}\n\nCommit message:`;

  const response = await client.generate(model, prompt, signal);
  return response.trim();
}
