import * as http from 'http';
import * as https from 'https';

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export class OllamaClient {
  constructor(private readonly endpoint: string) {}

  async listModels(): Promise<OllamaModel[]> {
    const url = new URL('/api/tags', this.endpoint);
    const data = await this.request<{ models: OllamaModel[] }>('GET', url.toString());
    return data.models ?? [];
  }

  async generate(
    model: string,
    prompt: string,
    signal?: AbortSignal
  ): Promise<string> {
    const url = new URL('/api/generate', this.endpoint);
    const body = JSON.stringify({ model, prompt, stream: false });
    const data = await this.request<{ response?: string; error?: string }>(
      'POST', url.toString(), body, signal
    );
    if (data.error) {
      throw new Error(`Ollama 错误：${data.error}`);
    }
    if (!data.response) {
      throw new Error(`Ollama 返回了空响应，原始数据：${JSON.stringify(data)}`);
    }
    return data.response;
  }

  private request<T>(
    method: string,
    urlStr: string,
    body?: string,
    signal?: AbortSignal
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(urlStr);
      const lib = url.protocol === 'https:' ? https : http;

      const options: http.RequestOptions = {
        method,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
        timeout: 300_000,
      };

      const req = lib.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw) as T);
          } catch {
            reject(new Error(`Ollama 返回了非 JSON 响应: ${raw.slice(0, 200)}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`连接 Ollama 失败: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时（120s），请检查模型是否正常运行'));
      });

      if (signal) {
        signal.addEventListener('abort', () => {
          req.destroy();
          reject(new Error('ABORTED'));
        });
      }

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }
}
