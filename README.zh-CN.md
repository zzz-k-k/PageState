# PageState

用结构化 Web 项目来创建 AI 原生演示文稿，而不是把演示文稿锁在封闭的幻灯片文件里。

[English README](README.md)

PageState 是一个早期实验中的本地优先演示文稿工作台。它的核心想法是：演示文稿的真相源不应该是手写 HTML，也不应该是二进制 PPT 文件，而应该是一份结构化、可校验、可编辑的 `deck.json`。

## 为什么做这个项目

传统演示文稿文件很难被 AI 稳定读取、修改和修复。网页天然由结构、组件、样式、资源、状态和数据组成，更适合被 AI 理解和重组。

PageState 当前探索的是这条路线：

```txt
Deck IR
  -> 命令式编辑
  -> 渲染器适配层
  -> HTML / PDF / 未来更多格式
```

当前 MVP 聚焦于：把结构化 Deck IR 渲染成可播放的 reveal.js 网页演示。

## 当前状态

项目仍处于早期 MVP 阶段。

已经完成：

- 使用 Zod 定义 Deck IR schema
- 合法和非法 deck 示例
- 为 AI 和工具导出 JSON Schema
- 用于安全修改 deck 的 Command Layer
- 给 AI 使用的受控 JSON Patch 逃生口
- reveal.js 渲染器
- 示例 HTML 演示导出
- IR、命令层、渲染器的单元测试

暂未完成：

- 可视化编辑器 UI
- 本地项目管理
- AI 生成管线
- undo / redo 历史栈
- PDF 导出
- 截图 QA
- PPTX 导出

## 项目结构

```txt
packages/
  ir/                 # Deck IR schema、示例数据、JSON Schema 导出
  commands/           # 命令 schema 和命令执行器
  renderer-reveal/    # Deck IR -> reveal.js HTML 渲染器

exports/
  valid-deck/         # 生成出来的 demo 演示
```

当前主流程：

```txt
packages/ir/examples/valid-deck.json
  -> DeckSchema 校验
  -> renderRevealDeck(deck)
  -> exports/valid-deck/index.html
```

## 核心包

### `@pagestate/ir`

定义结构化演示文稿模型。

关键文件：

- `packages/ir/src/deck-schema.ts`
- `packages/ir/examples/valid-deck.json`
- `packages/ir/schemas/deck.schema.json`

### `@pagestate/commands`

定义安全修改 Deck IR 的操作。

示例命令：

- `createSlide`
- `deleteSlide`
- `updateBlockText`
- `updateBlockFrame`
- `convertSlideLayout`
- `patchDeck`

关键文件：

- `packages/commands/src/command-schema.ts`
- `packages/commands/src/executor.ts`
- `packages/commands/schemas/command.schema.json`

### `@pagestate/renderer-reveal`

把 Deck IR 转换成可播放的 reveal.js HTML 演示。

关键文件：

- `packages/renderer-reveal/src/render.ts`
- `packages/renderer-reveal/scripts/render-valid-deck.ts`
- `exports/valid-deck/index.html`

## 快速开始

安装依赖：

```bash
npm install
```

运行测试：

```bash
npm test
```

构建所有包：

```bash
npm run build
```

生成 JSON Schema：

```bash
npm run build:schema
```

渲染示例演示：

```bash
npm run render:example
```

然后打开：

```txt
exports/valid-deck/index.html
```

## Demo 展示方案

当前 demo 是由 Deck IR 生成的静态 reveal.js 演示：

```txt
exports/valid-deck/index.html
```

GitHub Pages 很适合当前阶段，因为 demo 输出就是普通静态 HTML、CSS 和 JavaScript。

短期推荐：

- 用 GitHub Actions 运行 `npm run render:example`
- 把 `exports/valid-deck` 作为 Pages artifact 发布
- README 负责介绍项目，GitHub Pages 负责展示可播放 demo

后续推荐：

- 增加一个 demo gallery
- 首页展示项目介绍
- 挂多个由 Deck IR 生成的演示
- 每个 demo 仍然保持静态导出

## 核心原则

PageState 把演示文稿看成结构化、可编辑、可渲染的项目：

```txt
AI 和用户修改 Deck IR。
渲染器生成 HTML 和未来更多导出格式。
生成的 HTML 是输出物，不是真相源。
```

## 开发说明

长篇规划、学习笔记和阶段性解释文档放在本地 `docs/` 目录中。该目录用于本地开发阅读，默认不提交到仓库。

## License

暂未选择许可证。
