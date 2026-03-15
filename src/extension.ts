import * as vscode from 'vscode';
import { OllamaClient } from './ollamaClient';
import { generateCommitMessage } from './commitGenerator';

// VSCode 内置 git 扩展暴露的 API 类型
interface GitInputBox {
  value: string;
}

interface GitRepository {
  rootUri: vscode.Uri;
  inputBox: GitInputBox;
  diff(cached?: boolean): Promise<string>;
}

interface GitAPI {
  repositories: GitRepository[];
}

interface GitExtension {
  enabled: boolean;
  getAPI(version: 1): GitAPI;
}

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext): void {
  outputChannel = vscode.window.createOutputChannel('Quill');

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  statusBarItem.command = 'quill.switchModel';
  statusBarItem.tooltip = '点击切换 AI 模型';
  refreshStatusBar();
  statusBarItem.show();

  context.subscriptions.push(
    outputChannel,
    statusBarItem,
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('quill')) {
        refreshStatusBar();
      }
    }),
    vscode.commands.registerCommand('quill.generateMessage', handleGenerate),
    vscode.commands.registerCommand('quill.switchModel', handleSwitchModel),
  );
}

export function deactivate(): void {
  statusBarItem?.dispose();
  outputChannel?.dispose();
}

// ────────────────────────────────────────────────────────────────────────────

function log(msg: string): void {
  outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function refreshStatusBar(): void {
  const model = cfg().get<string>('model', 'gpt-oss:20b');
  statusBarItem.text = `$(hubot) ${model}`;
}

function cfg(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('quill');
}

function getGitRepo(): GitRepository | undefined {
  const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!ext) {
    vscode.window.showErrorMessage('找不到内置 Git 扩展（vscode.git），请确认已启用。');
    return undefined;
  }
  if (!ext.isActive) {
    vscode.window.showErrorMessage('Git 扩展尚未激活，请稍后重试。');
    return undefined;
  }

  const gitExt = ext.exports;
  if (!gitExt.enabled) {
    vscode.window.showErrorMessage('Git 功能已禁用，请在设置中启用 Git。');
    return undefined;
  }

  const api = gitExt.getAPI(1);
  log(`检测到 ${api.repositories.length} 个仓库`);

  if (!api.repositories.length) {
    vscode.window.showErrorMessage('当前工作区未检测到 Git 仓库。');
    return undefined;
  }

  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (activeUri && api.repositories.length > 1) {
    const matched = api.repositories.find(
      (r) => activeUri.fsPath.startsWith(r.rootUri.fsPath)
    );
    if (matched) {
      log(`使用匹配仓库：${matched.rootUri.fsPath}`);
      return matched;
    }
  }

  const repo = api.repositories[0];
  log(`使用第一个仓库：${repo.rootUri.fsPath}`);
  return repo;
}

// ── 生成 commit message ──────────────────────────────────────────────────────

async function handleGenerate(): Promise<void> {
  const repo = getGitRepo();
  if (!repo) { return; }

  if (!repo.inputBox) {
    vscode.window.showErrorMessage('无法访问 Git 提交输入框，请检查 Git 扩展版本。');
    return;
  }

  let diff: string;
  try {
    diff = await repo.diff(true);
    log(`staged diff 长度：${diff.length} 字符`);
  } catch (err: unknown) {
    vscode.window.showErrorMessage(`读取 staged diff 失败：${String(err)}`);
    return;
  }

  if (!diff || diff.trim().length === 0) {
    vscode.window.showWarningMessage('没有已 stage 的改动，请先 git add 后再生成。');
    return;
  }

  const config = cfg();
  const endpoint = config.get<string>('ollamaEndpoint', 'http://localhost:11434');
  const model = config.get<string>('model', 'gpt-oss:20b');
  const language = config.get<'en' | 'zh'>('language', 'en');
  const maxDiffLength = config.get<number>('maxDiffLength', 8000);

  log(`调用模型 ${model}，endpoint: ${endpoint}`);

  const client = new OllamaClient(endpoint);
  const controller = new AbortController();
  let generatedMessage = '';

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Quill：正在用 ${model} 生成...`,
        cancellable: true,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          log('用户取消生成');
          controller.abort();
        });

        generatedMessage = await generateCommitMessage(
          client, model, diff, language, maxDiffLength, controller.signal
        );
        log(`生成结果：${generatedMessage}`);
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg !== 'ABORTED') {
      log(`生成失败：${msg}`);
      vscode.window.showErrorMessage(`生成失败：${msg}`);
    }
    return;
  }

  const trimmed = generatedMessage.trim();
  if (!trimmed) {
    vscode.window.showWarningMessage('模型返回了空内容，请检查模型是否正常运行。');
    return;
  }

  repo.inputBox.value = trimmed;
  log(`已回填到输入框：${trimmed}`);

  const action = await vscode.window.showInformationMessage(
    `Commit message 已生成 (${model})`,
    '查看日志'
  );
  if (action === '查看日志') {
    outputChannel.show();
  }
}

// ── 切换模型 ─────────────────────────────────────────────────────────────────

async function handleSwitchModel(): Promise<void> {
  const config = cfg();
  const endpoint = config.get<string>('ollamaEndpoint', 'http://localhost:11434');
  const currentModel = config.get<string>('model', 'gpt-oss:20b');

  const client = new OllamaClient(endpoint);

  let modelNames: string[] = [];
  try {
    const models = await client.listModels();
    modelNames = models.map((m) => m.name);
    log(`从 Ollama 获取到 ${modelNames.length} 个模型`);
  } catch {
    vscode.window.showWarningMessage(
      `无法连接 Ollama（${endpoint}），仅显示当前已配置模型。`
    );
    modelNames = [currentModel];
  }

  if (modelNames.length === 0) {
    vscode.window.showWarningMessage('Ollama 中没有已安装的模型，请先运行 `ollama pull <model>`。');
    return;
  }

  const items: vscode.QuickPickItem[] = modelNames.map((name) => ({
    label: name,
    description: name === currentModel ? '当前使用' : undefined,
  }));
  items.push({ label: '$(edit) 手动输入模型名...', description: '' });

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: `当前模型：${currentModel}，选择新模型或手动输入`,
    matchOnDescription: true,
  });

  if (!picked) { return; }

  let newModel: string;
  if (picked.label.startsWith('$(edit)')) {
    const input = await vscode.window.showInputBox({
      prompt: '输入 Ollama 模型名（如 qwen2.5:14b）',
      value: currentModel,
    });
    if (!input?.trim()) { return; }
    newModel = input.trim();
  } else {
    newModel = picked.label;
  }

  await config.update('model', newModel, vscode.ConfigurationTarget.Global);
  refreshStatusBar();
  vscode.window.showInformationMessage(`已切换至模型：${newModel}`);
}
