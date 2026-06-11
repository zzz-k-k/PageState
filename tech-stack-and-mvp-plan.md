# AI Native HTML Presentation Workbench 技术栈与 MVP 构建顺序

## 1. 技术选型原则

这个项目的核心不是再做一个 PPT 编辑器，而是构建一个本地优先、AI 原生、网页原生的 presentation workbench。

因此技术选型应优先满足以下目标：

- 内容必须有结构化真相源，而不是直接以 HTML 作为唯一数据源。
- AI 修改必须可校验、可回放、可撤销，而不是黑盒覆盖文件。
- 播放层可以借用成熟生态，但核心模型不能绑定在单一播放框架上。
- MVP 应先验证 `AI + Deck IR + reveal.js + 基础编辑 + 本地导出` 的闭环。
- 第一版不追求完整替代 PowerPoint，而是做出一个锋利、可扩展的工作台原型。

## 2. 推荐技术栈

### 2.1 工程底座

- TypeScript：统一前端、渲染器、命令系统、AI 层和导出工具链。
- pnpm workspace：组织 monorepo，方便拆分 `apps/` 和 `packages/`。
- Zod：定义 Deck IR、Command、Skill manifest 等 schema，同时用于运行时校验。
- JSON Schema：由 Zod 导出，供 AI 结构化生成、工具调用和数据修复使用。
- Vitest：核心数据结构、命令系统、渲染器的单元测试。
- Playwright：预览、截图、PDF 导出和视觉 QA。

### 2.2 前端工作台

- React：构建复杂编辑器 UI、属性面板、预览面板和组件化交互。
- Vite：作为前端构建和开发服务底座，启动快，配置轻。
- Zustand：管理编辑器状态，例如当前 deck、选区、历史记录、面板状态。
- Tiptap：用于富文本编辑。MVP 早期也可以先用简单文本编辑，后续再接入。
- dnd-kit：用于页面缩略图排序、元素拖拽、组件拖入和基础画布操作。
- CSS variables：作为主题 token 系统的主要实现方式。
- Tailwind CSS：可用于工作台 UI，但不建议让导出的 deck 强依赖 Tailwind class。

### 2.3 播放与渲染层

第一阶段使用 reveal.js：

- 成熟的翻页、快捷键、触控、演讲者模式、notes、fragments、overview。
- 已有 PDF 打印支持。
- 适合作为 MVP 的播放和预览底座。

但 reveal.js 不能成为核心数据模型。项目应通过 Renderer Adapter 隔离播放框架：

```txt
Deck IR
  ↓
Renderer Adapter
  ├─ RevealRenderer
  ├─ StaticHtmlRenderer
  ├─ PdfRenderer
  ├─ ImageRenderer
  ├─ PptxRenderer
  ├─ MotionCanvasRenderer
  ├─ ScrollyRenderer
  └─ ThreeRenderer
```

### 2.4 AI 层

AI 层应围绕结构化操作设计：

- schema-based generation：生成符合 Deck IR schema 的结构化内容。
- command generation：AI 输出 `Command[]`，而不是直接改文件。
- JSON Patch：适合局部修改和可审计变更。
- tool calling：让 AI 调用创建页面、改布局、生成图表、运行 QA 等工具。
- validation and repair：所有 AI 输出先校验，不合格则修复。
- screenshot feedback loop：通过截图结果让 AI 或规则系统修复溢出、重叠、对比度问题。

推荐的 AI 修改流程：

```txt
用户 prompt
  ↓
AI 生成 Deck IR 或 Command[]
  ↓
Zod / JSON Schema 校验
  ↓
Command Layer 执行
  ↓
Renderer 渲染
  ↓
Playwright 截图 / PDF / QA
  ↓
必要时自动修复
```

### 2.5 本地优先与桌面端

MVP 阶段建议先做成本地 Web app + Node 本地服务或 CLI。

稳定后再使用 Tauri 2 包装为桌面端：

- Tauri：提供桌面壳、窗口、菜单、文件系统权限、系统集成。
- Node sidecar：承载 AI 调用、Playwright 导出、文件打包、PDF/PNG 生成等任务。
- 本地项目目录：作为 deck、assets、themes、skills、exports 的主要存储形式。

第一版不建议直接把复杂业务塞进 Rust/Tauri 层。Tauri 主要负责桌面能力，核心逻辑仍放在 TypeScript 包中。

### 2.6 存储

MVP 推荐：

- 本地文件系统项目。
- `deck.json` 或 `deck.yaml` 作为主要真相源。
- `assets/` 保存图片、视频、字体、数据文件。
- `themes/` 保存主题 token。
- `skills/` 保存项目级 Skill。
- `exports/` 保存导出结果。

后续可以补充：

- SQLite：保存操作历史、索引、资源元数据、近期项目列表。
- Git：作为版本管理和团队协作基础。
- 可选云同步：作为后期能力，不进入 MVP。

### 2.7 导出

第一阶段：

- HTML package：打包为可独立打开和部署的静态网页。
- PDF：通过 Playwright 或浏览器 print 流程导出。
- PNG：通过 Playwright 对单页或整套 deck 截图。

第二阶段：

- PPTX：通过 PptxGenJS 实现有限保真导出。
- MP4：通过浏览器录制、逐帧导出或动画时间轴合成。
- iframe embed：导出可嵌入版本。

## 3. 推荐 Monorepo 结构

```txt
apps/
  workbench/          # React + Vite 可视化编辑器
  preview-server/     # 本地预览、渲染和导出服务
  desktop/            # Tauri 桌面壳，第二阶段再做

packages/
  ir/                 # Deck IR、Scene IR、Zod schema、migrations
  commands/           # createSlide、updateBlockText、applyTheme 等命令
  renderer-reveal/    # Deck IR -> reveal.js
  renderer-static/    # Deck IR -> standalone HTML
  export/             # HTML/PDF/PNG/PPTX 导出
  ai/                 # 模型适配、结构化生成、修复流程
  skills/             # Skill manifest、registry、内置 Skill
  themes/             # 设计 token、默认主题
  qa/                 # 截图、溢出、重叠、对比度检查
  ui/                 # 工作台通用 UI 组件
```

## 4. MVP 构建顺序

### Step 1：定义最小 Deck IR

目标：先明确系统的共同语言。

需要包含：

- `deck`：标题、主题、元数据、页面列表。
- `slide`：页面 id、类型、布局、blocks、notes、animations。
- `block`：文本、图片、图表、列表、引用、代码、容器等基础块。
- `theme`：颜色、字体、间距、圆角、阴影等设计 token。
- `exportConfig`：导出尺寸、格式、页面比例。

验收标准：

- 可以用 Zod 校验一份 deck。
- 可以生成 JSON Schema。
- 可以保存和读取 `deck.json`。

### Step 2：实现 Command Layer

目标：让所有编辑操作都可审计、可撤销、可重放。

首批命令：

- `createDeck`
- `createSlide`
- `deleteSlide`
- `reorderSlides`
- `updateBlockText`
- `replaceBlock`
- `updateBlockProps`
- `applyTheme`
- `addAnimation`
- `convertSlideLayout`

验收标准：

- 每个命令都是纯数据。
- 命令执行前后可测试。
- 支持 undo / redo 的基础历史栈。

### Step 3：实现 reveal.js Renderer

目标：把 Deck IR 编译成可播放的 reveal.js 演示。

内容：

- 将每个 slide 编译为 reveal.js `<section>`。
- 支持标题、段落、列表、图片、引用、代码、基础图表。
- 支持 speaker notes。
- 支持 fragments 和基础动画映射。
- 注入主题 CSS variables。

验收标准：

- 一份 `deck.json` 可以生成完整 reveal.js 页面。
- 可以在浏览器中播放。
- 可以通过键盘翻页。

### Step 4：实现 5 到 10 个基础模板

目标：让 AI 和用户不是从空白页面开始。

首批模板建议：

- `hero`
- `section`
- `two-column`
- `comparison`
- `timeline`
- `chart-slide`
- `quote-hero`
- `architecture`
- `product-demo`
- `closing`

验收标准：

- 每个模板都有 schema 和默认数据。
- 每个模板能渲染到 reveal.js。
- 每个模板能被 AI 通过结构化参数调用。

### Step 5：实现本地项目创建和加载

目标：形成真正的本地项目空间。

项目结构：

```txt
my-deck/
  deck.json
  assets/
  themes/
  skills/
  exports/
```

验收标准：

- 可以创建项目目录。
- 可以打开已有项目。
- 修改后可以保存回 `deck.json`。

### Step 6：实现 Workbench 基础界面

目标：用户可以看见、选择、编辑 deck。

界面结构：

- 左侧：页面缩略图列表。
- 中间：当前页面预览。
- 右侧：属性面板。
- 顶部：播放、导出、AI 编辑入口。

MVP 编辑能力：

- 切换页面。
- 编辑文本。
- 修改基础布局参数。
- 替换图片。
- 切换主题。
- 撤销重做。

验收标准：

- 不写代码也可以修改一份 AI 生成的 deck。
- 用户操作全部走 Command Layer。

### Step 7：接入 AI 生成

目标：完成 prompt to deck 和 AI edit current slide。

首批 AI 能力：

- 根据主题生成 deck 大纲。
- 根据大纲生成完整 Deck IR。
- 生成单页。
- 改写当前页。
- 把当前页转换为对比、时间线、图表、架构图等模板。
- 生成 speaker notes。

验收标准：

- AI 输出必须通过 schema 校验。
- AI 修改必须生成命令或 JSON Patch。
- 不允许 AI 直接覆盖最终 HTML。

### Step 8：实现 HTML 和 PDF 导出

目标：让 MVP 有真实可交付产物。

导出能力：

- standalone HTML。
- reveal.js project。
- PDF。
- 单页 PNG 或整套 PNG。

验收标准：

- 导出的 HTML 可以脱离开发环境打开。
- PDF 页面比例正确。
- 字体、图片、主题样式能被正确打包。

### Step 9：实现自动截图 QA 原型

目标：建立这个项目区别于普通 AI PPT 工具的质量闭环。

首批 QA：

- 文本是否溢出。
- 元素是否重叠。
- 页面是否空白。
- 对比度是否过低。
- 导出 PDF 后尺寸是否异常。

验收标准：

- 每次导出前可以跑 QA。
- QA 结果能定位到 slide 和 block。
- 后续可以把 QA 结果交给 AI 修复。

### Step 10：沉淀首批 Skill

目标：从“AI 生成页面”进化为“AI 调用表达能力”。

首批 Skill：

- `pitch-deck`
- `product-demo`
- `technical-talk`
- `data-story`
- `comparison`
- `timeline`
- `architecture`
- `chart-slide`
- `quote-hero`
- `closing`

每个 Skill 至少包含：

- manifest。
- 输入参数 schema。
- 默认模板。
- AI 使用说明。
- 渲染约束。
- QA 规则。

## 5. MVP 暂不做的内容

第一版不建议投入以下能力：

- 完整 PPTX 导入。
- 完整 PPTX 可编辑导出。
- 多人实时协作。
- 复杂权限系统。
- 大型模板市场。
- 复杂 3D 编辑器。
- 完全自由画布。
- 视频导出。
- 云端同步。
- 企业级管理后台。

这些能力不是不重要，而是不适合进入第一阶段。MVP 应优先证明核心闭环：

```txt
Prompt
  ↓
Deck IR
  ↓
Command Layer
  ↓
Visual Editing
  ↓
Reveal Renderer
  ↓
HTML / PDF Export
  ↓
Screenshot QA
```

## 6. 第一阶段里程碑

### Milestone 1：Deck IR 技术验证

- 完成 schema。
- 完成示例 deck。
- 完成 reveal.js renderer。
- 可以播放一个静态 deck。

### Milestone 2：基础编辑器

- 完成缩略图、预览、属性面板。
- 支持文本编辑和主题切换。
- 支持 undo / redo。

### Milestone 3：AI 生成闭环

- 支持 prompt to deck。
- 支持 AI edit current slide。
- 支持结构化校验和修复。

### Milestone 4：导出和 QA

- 支持 standalone HTML。
- 支持 PDF / PNG。
- 支持截图 QA 原型。

### Milestone 5：首批 Skill

- 完成 5 到 10 个高质量 Skill。
- AI 可以根据用户意图选择 Skill。
- Skill 可以稳定生成对应类型页面。

## 7. 核心判断

这个项目第一阶段最应该做的不是自研完整 runtime，也不是复刻 PowerPoint，而是尽快跑通下面这条主线：

```txt
本地项目
  + Deck IR
  + Command Layer
  + AI 结构化生成
  + reveal.js 播放
  + 基础可视化编辑
  + HTML/PDF 导出
  + 截图 QA
```

只要这条链路成立，后续无论扩展自研 runtime、Skill marketplace、PPTX、视频、3D、滚动叙事还是企业私有化，都会有一个稳定的架构基础。
