# Quill

<details open>
<summary>English</summary>

A lightweight VS Code extension to generate conventional commit messages powered by an open‑source LLM (Ollama).

## 🔧 Features

- **Automatic message generation** – Press *Generate Commit Message* from the SCM status bar or via the command palette.
- **Switch AI model** – Change the underlying model on the fly, and even type a custom model name.
- **Built‑in configuration** – Customise the Ollama endpoint, language, model, and maximum diff length.
- **Lightweight & offline** – No internet required once the model is pulled into Ollama.
- **TypeScript source** – Easy to extend or modify if you want to tweak prompts or integration logic.

## 📦 Installation

1. **Install VS Code** – The extension is available on the Marketplace, but you can also install from the source.
2. **Pull a model with Ollama** (see [Ollama](https://github.com/ollama/ollama)):
   ```bash
   ollama pull gpt-oss:20b
   ```
3. **Open the project in VS Code** and press <kbd>F1</kbd>, type *Extensions: Install from VSIX* and provide the `git-commit-ai-0.1.0.vsix` file from this repo.
4. **Run the extension** – The status bar will show `$(hubot) <model-name>`.

## ⚙️ Configuration

Open *Settings* ▶ *Quill* and adjust the following options:

| Key | Description | Default |
|-----|-------------|---------|
| `quill.ollamaEndpoint` | Ollama HTTP endpoint | `http://localhost:11434` |
| `quill.model` | Default model name | `gpt-oss:20b` |
| `quill.language` | Commit‑message language (`en` or `zh`) | `en` |
| `quill.maxDiffLength` | Max characters of diff sent to the model | `8000` |

> **Tip:** After changing the model, hit the status‑bar item again to refresh the displayed model name.

## 💡 Usage

1. **Stage changes** in your repository.
2. Press **Ctrl+Shift+P** → `Quill: Generate Commit Message` (or click the status‑bar icon).
3. The generated message will be populated into the SCM input field.
4. Optionally, click **“查看日志”** to see a log of the request and response.

A quick video walkthrough can be found in the project wiki.

## 🚀 Development

The extension is written in TypeScript. To build locally:

```bash
pnpm install   # install deps (pnpm is required)
pnpm compile   # compile TS → out/
# optional: create a VSIX
pnpm pkg     # VSIX is produced in .vsix file
```

Running tests: none yet – a future task.

## 📜 License

This extension is released under the MIT license. See the `LICENSE` file.

## 🙏 Acknowledgements

- Powered by the [Ollama](https://github.com/ollama/ollama) project.
- Uses TypeScript, VS Code API, and minimal helper libraries.

</details>

<details>
<summary>中文</summary>

一个轻量级的 VS Code 扩展，利用开源 LLM（Ollama）生成符合约定的提交信息。

## 🔧 特性

- **自动生成消息** – 在 SCM 状态栏或命令面板中按 *Generate Commit Message*。
- **切换 AI 模型** – 随时切换底层模型，甚至输入自定义模型名称。
- **内置配置** – 可自定义 Ollama 终端、语言、模型以及发送给模型的最大差异长度。
- **轻量 & 离线** – 模型拉取后无需网络即可使用。
- **TypeScript 源码** – 如需调整提示语或集成逻辑，易于扩展或修改。

## 📦 安装

1. **安装 VS Code** – 扩展可在 Marketplace 获取，亦可从源码安装。
2. **使用 Ollama 拉取模型**（参考 [Ollama](https://github.com/ollama/ollama)）：
   ```bash
   ollama pull gpt-oss:20b
   ```
3. **在 VS Code 打开本项目**，按 <kbd>F1</kbd>，输入 *Extensions: Install from VSIX* 并提供本仓库中的 `git-commit-ai-0.1.0.vsix`。
4. **运行扩展** – 状态栏将显示 `$(hubot) <model-name>`。

## ⚙️ 配置

打开 *设置* ▶ *Quill* 并调整下列选项：

| Key | 说明 | 默认值 |
|-----|------|--------|
| `quill.ollamaEndpoint` | Ollama HTTP 终端 | `http://localhost:11434` |
| `quill.model` | 默认模型名称 | `gpt-oss:20b` |
| `quill.language` | 提交信息语言（`en` 或 `zh`） | `en` |
| `quill.maxDiffLength` | 发送给模型的最大差异字符数 | `8000` |

> **提示：** 修改模型后再次点击状态栏图标即可刷新显示的模型名称。

## 💡 使用方法

1. **暂存更改** 到仓库。
2. 按 **Ctrl+Shift+P** → `Quill: Generate Commit Message`（或点击状态栏图标）。
3. 生成的消息会填充到 SCM 输入框。
4. 可选地，点击 **“查看日志”** 查看请求与响应日志。

项目 Wiki 中有快速视频演示。

## 🚀 开发

此扩展基于 TypeScript 编写。本地构建步骤：

```bash
pnpm install   # 安装依赖（pnpm 必须）
pnpm compile   # 编译 TS → out/
# 可选：创建 VSIX
pnpm pkg     # VSIX 位于 .vsix
```

暂无测试，后续可添加。

## 📜 许可证

本扩展采用 MIT 许可证。详情见 `LICENSE` 文件。

## 🙏 致谢

- 由 [Ollama](https://github.com/ollama/ollama) 项目提供支持。
- 采用 TypeScript、VS Code API 与极简辅助库。

</details>
