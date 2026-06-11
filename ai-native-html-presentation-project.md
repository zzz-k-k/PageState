# AI Native HTML Presentation Workbench

## 1. 项目概述

本项目希望构建一个面向 AI 时代的网页原生演示文稿创作系统。它不是传统意义上的 PowerPoint 替代品，也不是简单的 AI 生成 PPT 工具，而是一个以 HTML、CSS、JavaScript、组件、模板和自动化 Skill 为基础的演示内容工作台。

传统 PPT 的核心对象是幻灯片文件，AI 很难稳定理解和修改其中的版式、动画、母版、资源和交互逻辑。相比之下，网页天然由结构化代码、样式、组件、状态和数据组成，更适合被 AI 读取、生成、修改和重组。因此，本项目将“演示文稿”重新定义为一组可编排的网页场景，而不是一个封闭的办公软件文件。

项目的基本方向是：

- 本地优先 / 私有化部署；
- HTML / Web 原生表达；
- AI 和 Skill 可编排；
- 支持可视化编辑；
- 兼容传统幻灯片播放体验；
- 扩展到非传统 PPT 表达，例如滚动叙事、交互演示、数据故事、3D 场景、网页应用式 presentation。

早期阶段，项目可以借用 reveal.js、Slidev、Motion Canvas、impress.js 等成熟生态的能力，快速获得播放、转场、导出、演讲者模式、动画等基础能力。但长期来看，项目的核心不应绑定在某一个现成框架上，而应该建立自己的中间表示层和可插拔渲染引擎。

## 2. 背景与问题

AI 生成 PPT 这个方向已经出现了很多产品和开源项目。它们大致可以分为三类：

第一类是传统 PPT 增强工具。它们的目标是让 AI 生成或修改 `.pptx` 文件，例如自动生成页面、整理大纲、套用模板、导出 PowerPoint。这类工具适合进入现有办公流程，但受限于 PPTX 本身的封闭结构和传统页面范式。

第二类是在线 AI presentation SaaS。它们通常提供从 prompt 到 deck 的生成能力，并支持云端编辑、协作、导出 PDF/PPTX 等。这类产品体验完整，但多数是云端封闭系统，用户难以本地部署，也难以把内容作为代码、组件或项目资产来长期维护。

第三类是网页演示框架，例如 reveal.js、Slidev、Marp、impress.js、Motion Canvas 等。它们天然使用 HTML、Markdown、Vue、React、Canvas 或 TypeScript 表达演示内容，对开发者和 AI 都更友好。但这些框架多数偏底层，没有完整的 AI 编辑、可视化编辑、模板市场、私有化工作台和多模态表达系统。

本项目要解决的核心问题是：

如何把“网页原生演示能力”和“AI 结构化创作能力”结合起来，形成一个既能被人可视化编辑、又能被 AI 稳定操作的 presentation workbench？

## 3. 产品定位

本项目可以被定位为：

一个本地优先、AI 原生、网页原生的演示内容 IDE。

它既不是单纯的 PPT 编辑器，也不是单纯的 HTML slide 播放器，而是一个围绕演示表达构建的创作环境。用户可以通过自然语言、模板、组件、数据、可视化操作和代码共同完成一份演示作品。

更具体地说，它有几个关键词：

- AI Native：AI 不是外层附加功能，而是核心创作方式之一。
- HTML Native：内容最终可以以网页方式运行、部署和分享。
- Local First：支持本地项目、本地模型、本地资源和私有化部署。
- Skill Oriented：通过可复用 Skill 把不同类型的页面、动画、图表、风格和交互封装起来。
- Visual Editable：用户不需要只通过代码编辑，也可以像使用设计工具一样选择、拖拽、修改页面元素。
- Beyond Slides：既兼容一页一页的传统演示，也支持网页式、交互式、故事式和应用式表达。

## 4. 目标用户

### 4.1 开发者和技术团队

这类用户习惯使用代码、Markdown、Git、组件库和自动化工具。他们希望演示内容可以像代码一样被维护、复用和部署。

典型场景包括：

- 技术分享；
- 产品方案介绍；
- 开源项目发布；
- API / SDK 教程；
- 架构图和流程图讲解；
- 自动从文档、代码仓库、issue、PR 中生成演示材料。

### 4.2 创业团队和产品团队

这类用户需要频繁制作 pitch deck、产品介绍、路演材料、功能说明和市场分析。他们希望 AI 可以帮助快速生成初稿，并且可以结合品牌模板、数据图表和交互演示。

典型场景包括：

- 投资人路演；
- 产品发布；
- 客户提案；
- 销售演示；
- 内部战略汇报；
- 用户研究和产品复盘。

### 4.3 研究者、教育者和内容创作者

这类用户需要把复杂知识变成更清晰、更有表现力的内容。他们可能需要数学公式、动画解释、交互模型、数据可视化和长篇叙事。

典型场景包括：

- 课程课件；
- 研究展示；
- 科普内容；
- 数据故事；
- 动画解释；
- 交互式学习材料。

### 4.4 企业私有化用户

企业用户关注数据安全、品牌一致性、权限管理和内部知识复用。他们可能不愿意把内部材料上传到外部 SaaS 平台。

典型场景包括：

- 内部知识库生成演示；
- 销售和售前材料自动化；
- 私有模型生成内容；
- 品牌模板统一管理；
- 本地部署和权限控制。

## 5. 核心产品形态

项目可以包含以下几个主要模块。

### 5.1 本地项目空间

每一份演示作品不是一个单独的 `.pptx` 文件，而是一个本地项目目录。项目中可以包含：

- `deck.json` 或 `deck.yaml`：演示结构和元数据；
- `slides/`：页面或场景定义；
- `components/`：可复用组件；
- `skills/`：项目内可用的 AI Skill；
- `assets/`：图片、视频、字体、数据文件；
- `themes/`：主题和设计 token；
- `exports/`：导出的 HTML、PDF、PPTX、视频等文件。

这种项目化结构有几个好处：

- 便于 Git 管理；
- 便于 AI 读取和修改；
- 便于模板复用；
- 便于私有化和离线工作；
- 便于和其他工具链集成。

### 5.2 AI 创作入口

用户可以用自然语言完成以下操作：

- 从主题生成完整演示大纲；
- 生成某一页内容；
- 重写已有页面；
- 修改视觉风格；
- 把一页变成图表页、时间线页、对比页、故事页；
- 为页面增加动画；
- 生成演讲稿和备注；
- 检查页面是否信息过载；
- 自动修复文字溢出、层级混乱、视觉不一致等问题。

AI 不应该直接粗暴修改最终 HTML，而应该优先修改项目的结构化中间表示。这样可以提高稳定性，也方便可视化编辑器和导出器复用同一份内容。

### 5.3 可视化编辑器

项目需要提供一个网页端或桌面端可视化编辑器。它应支持：

- 页面缩略图管理；
- 画布预览；
- 元素选择；
- 拖拽移动；
- 尺寸调整；
- 对齐和分布；
- 层级管理；
- 文本编辑；
- 图片替换；
- 主题切换；
- 动画设置；
- 组件参数调整；
- 历史记录和撤销重做；
- AI 对当前选区进行编辑。

可视化编辑器的目标不是完全复刻 PowerPoint，而是让用户能直观控制 AI 生成的网页演示内容。

### 5.4 Skill 系统

Skill 是项目的关键壁垒之一。它不是简单模板，而是一组可被 AI 调用的能力包。

一个 Skill 可以包含：

- 使用场景说明；
- 输入参数 schema；
- 组件代码；
- 示例页面；
- 样式约束；
- 动画策略；
- 质量检查规则；
- AI prompt 指令；
- 渲染和导出注意事项。

例如可以有：

- 投资人 pitch deck skill；
- 技术架构图 skill；
- 数据故事 skill；
- 产品发布 skill；
- 教学课件 skill；
- 3D 展示 skill；
- 滚动叙事 skill；
- 时间线页面 skill；
- 竞品对比 skill；
- Motion Canvas 动画 skill。

通过 Skill，AI 不只是“生成一页好看的 HTML”，而是可以稳定调用经过设计的表达模式。

### 5.5 播放与渲染引擎

早期可以使用 reveal.js 作为主要播放引擎。reveal.js 已经提供了很多成熟能力：

- slide 导航；
- 转场；
- fragments；
- speaker notes；
- overview；
- keyboard controls；
- touch controls；
- PDF export；
- plugin 机制；
- HTML / Markdown slide 支持。

但系统不应该把 reveal.js 作为唯一核心。更好的方式是建立一个引擎适配层。

```txt
Deck IR
  ↓
Engine Adapter
  ├─ reveal.js adapter
  ├─ Slidev adapter
  ├─ Motion Canvas adapter
  ├─ impress.js adapter
  ├─ custom web runtime
  └─ future 3D / scrollytelling runtime
```

这样项目可以先借用 reveal.js 的成熟能力，同时为未来扩展留下空间。

## 6. 核心架构

建议采用分层架构。

```txt
用户输入 / AI Prompt / 可视化编辑
          ↓
Command Layer
          ↓
Deck IR / Scene IR
          ↓
Renderer Adapter Layer
          ↓
reveal.js / custom runtime / Motion Canvas / 3D runtime
          ↓
HTML / PDF / PPTX / Video / Web Package
```

### 6.1 Deck IR

Deck IR 是整个系统最重要的核心。它是 AI、编辑器、渲染器和导出器之间的共同语言。

一个简化的 IR 示例：

```json
{
  "type": "deck",
  "title": "AI Native HTML Presentation",
  "theme": "modern-product",
  "slides": [
    {
      "id": "slide-001",
      "type": "hero",
      "layout": "centered",
      "blocks": [
        {
          "id": "title",
          "type": "heading",
          "text": "重新定义 AI 时代的演示文稿"
        },
        {
          "id": "subtitle",
          "type": "paragraph",
          "text": "用 HTML、组件和 Skill 构建可编排的 presentation workbench"
        }
      ],
      "animations": [
        {
          "target": "title",
          "type": "fade-up",
          "trigger": "enter"
        }
      ]
    }
  ]
}
```

Deck IR 应该表达：

- 页面结构；
- 文本内容；
- 组件类型；
- 布局约束；
- 主题 token；
- 动画；
- 交互；
- 数据绑定；
- 演讲备注；
- 导出配置。

### 6.2 Command Layer

AI 和用户操作不应该直接修改文件，而应该转换成命令。

例如：

- `createSlide`
- `updateBlockText`
- `applyTheme`
- `replaceImage`
- `generateChart`
- `addAnimation`
- `convertSlideType`
- `splitSlide`
- `mergeSlides`
- `runQualityCheck`

这样可以实现：

- 撤销重做；
- 操作历史；
- 多人协作；
- AI 操作可审计；
- 更稳定的自动化。

### 6.3 Renderer Adapter

Renderer Adapter 负责把 Deck IR 编译成具体运行时。

第一阶段可以实现：

- `RevealRenderer`：把 slide 编译成 reveal.js 的 `<section>`；
- `StaticHtmlRenderer`：导出独立 HTML；
- `PdfRenderer`：通过浏览器截图或 print CSS 导出 PDF；
- `ImageRenderer`：导出 PNG；

第二阶段可以扩展：

- `PptxRenderer`：导出可编辑 PPTX；
- `VideoRenderer`：导出 MP4；
- `MotionCanvasRenderer`：生成代码动画；
- `ScrollyRenderer`：生成滚动叙事网页；
- `ThreeRenderer`：生成 3D presentation。

### 6.4 Runtime Layer

Runtime 负责实际播放和交互。

早期可以依赖 reveal.js：

```txt
Deck IR → reveal.js HTML → browser presentation
```

后续可以自研 runtime：

```txt
Deck IR → custom runtime → iframe/pages/scenes/components
```

自研 runtime 可以重点补足 reveal.js 不擅长的能力：

- 更强的元素级状态同步；
- 更适合可视化编辑的 runtime API；
- 更细的动画时间轴控制；
- 更好的导出一致性；
- 多种页面表达模式混排；
- 交互组件和数据组件；
- AI 可调用的页面检查接口。

## 7. 与现有产品和项目的差异

### 7.1 与 reveal.js 的差异

reveal.js 是一个成熟的 HTML presentation framework，适合作为播放和导出底座。但它本身不是完整产品，也不提供 AI 创作、可视化编辑、Skill 编排、本地项目管理和多 runtime 架构。

本项目可以借用 reveal.js，但核心价值不在 reveal.js，而在上层的 AI-native 创作系统。

### 7.2 与 Slides.com 的差异

Slides.com 是基于 reveal.js 的成熟在线编辑平台，具备云端编辑、协作、AI、模板和开发者能力。但它主要是云端 SaaS，用户对底层项目结构、私有化、本地模型、Skill 编排和深度自定义的掌控有限。

本项目更强调本地优先、私有化、可扩展 runtime、项目文件结构和 AI 可编排能力。

### 7.3 与 Gamma 等 AI presentation SaaS 的差异

Gamma 这类产品重在从 prompt 生成漂亮的演示、文档或网页，适合非技术用户快速产出内容。但它们通常是封闭平台，用户很难把作品作为代码项目持续维护，也很难自定义底层表达和自动化流程。

本项目更偏向开放工作台，用户可以控制代码、模板、Skill、数据和导出管线。

### 7.4 与 PPTist 的差异

PPTist 更像网页端 PowerPoint 编辑器，重点是复刻 PPT 的编辑体验，并支持导入导出 PPTX。它的优势是用户熟悉，缺点是仍然比较接近传统 PPT 范式。

本项目不以复刻 PowerPoint 为目标，而是以网页原生表达为目标。PPT 只是可选导出格式，不是核心数据模型。

### 7.5 与 Oh My PPT 的差异

Oh My PPT 已经非常接近本项目方向：本地优先、AI 生成 HTML slide、可视化编辑、导出多格式，并且自研了播放 runtime。它证明了这个方向是可行的。

本项目可以在此基础上进一步突破：

- 把 Deck IR 和 Skill 系统做得更开放；
- 支持多个 runtime，而不是只有自研 HTML slide runtime；
- 更强调插件化、模板包、组件生态；
- 更强调非传统 presentation，如滚动叙事、交互 demo、数据故事、3D 场景；
- 更强调 AI 的可审计命令系统和质量检查闭环。

## 8. 产品关键能力

### 8.1 Prompt to Deck

用户输入主题、目标受众、风格、时长和资料，系统生成完整演示大纲和初稿。

### 8.2 Document to Deck

系统从 PDF、Markdown、网页、Notion、代码仓库、会议纪要或研究报告中提取结构，生成 presentation。

### 8.3 AI Edit Current Slide

用户选中某一页或某个元素后，可以让 AI 执行局部修改。

例如：

- “把这一页改成三栏对比。”
- “让标题更像投资人路演。”
- “把这段文字变成时间线。”
- “增加一个可视化图表。”
- “把这页做得更克制、更像 B2B SaaS 风格。”

### 8.4 Visual Editing

用户可以在画布上直接编辑 AI 生成的内容，而不是只能通过 prompt 反复生成。

### 8.5 Skill Marketplace

项目可以内置一组高质量 Skill，也可以允许用户或团队添加自己的 Skill。

例如：

- 企业品牌 Skill；
- 研究汇报 Skill；
- 投融资 Skill；
- 产品发布 Skill；
- 数据可视化 Skill；
- 动画解释 Skill；
- 课程课件 Skill。

### 8.6 Auto QA

系统可以自动检查演示质量：

- 文本是否溢出；
- 对比度是否不足；
- 元素是否重叠；
- 页面是否信息过载；
- 图表是否缺标题或单位；
- 页面风格是否不一致；
- 导出 PDF 后是否变形；
- 移动端或不同尺寸下是否破版。

AI 可以根据 QA 结果自动修复。

### 8.7 Multi Export

支持导出：

- HTML package；
- 静态网站；
- PDF；
- PNG；
- PPTX；
- MP4；
- reveal.js 项目；
- 可嵌入 iframe；
- 可部署网页链接。

## 9. MVP 建议

第一版不要试图一次性做完整 PowerPoint 替代品。建议做一个足够锋利的 MVP。

### 9.1 MVP 目标

做出一个本地运行的 AI HTML presentation workbench：

- 用户输入主题；
- AI 生成 Deck IR；
- 系统编译成 reveal.js 演示；
- 用户可以在网页中预览和播放；
- 用户可以可视化修改文本和基础布局；
- 用户可以通过 AI 修改某一页；
- 支持导出独立 HTML 和 PDF；
- 支持少量高质量 Skill。

### 9.2 MVP 功能范围

第一阶段建议包含：

- 本地项目创建；
- Deck IR schema；
- reveal.js renderer；
- 基础主题系统；
- 5 到 10 个页面模板；
- AI 生成大纲；
- AI 生成单页；
- AI 修改当前页；
- 基础可视化编辑；
- HTML 导出；
- PDF 导出；
- 自动截图检查。

暂时不要做：

- 完整 PPTX 编辑导入；
- 多人实时协作；
- 复杂权限系统；
- 大型模板市场；
- 复杂 3D 编辑器；
- 过度自由的画布编辑。

### 9.3 MVP 推荐 Skill

第一批 Skill 应该少而精：

- `pitch-deck`：创业路演；
- `product-demo`：产品介绍；
- `technical-talk`：技术分享；
- `data-story`：数据故事；
- `comparison`：竞品对比；
- `timeline`：时间线；
- `architecture`：架构图；
- `quote-hero`：观点页；
- `chart-slide`：图表页；
- `closing`：结尾页。

## 10. 技术选型建议

### 10.1 前端

可以选择：

- React；
- TypeScript；
- Vite；
- Zustand 或 Jotai；
- Tiptap / Slate 用于富文本；
- dnd-kit 用于拖拽；
- Tailwind 或 CSS variables 用于主题；
- Playwright 用于截图和 QA。

### 10.2 播放层

第一阶段：

- reveal.js；
- 自定义 reveal adapter；
- 自定义插件注入；
- print / PDF export 流程。

第二阶段：

- 自研 runtime；
- iframe/page scene 管理；
- 动画时间轴；
- 编辑器 bridge；
- 导出 bridge。

### 10.3 AI 层

AI 层应该围绕结构化操作设计：

- schema-based generation；
- JSON patch；
- command execution；
- tool calling；
- Skill registry；
- validation and repair；
- screenshot feedback loop。

不要让 AI 长期直接改最终 HTML。HTML 可以作为输出物，但不应该是唯一真相源。

### 10.4 存储

本地优先可以采用：

- 文件系统项目；
- SQLite；
- JSON/YAML；
- Git；
- 本地资源目录；
- 可选云同步。

### 10.5 导出

可以分阶段实现：

- HTML：直接打包；
- PDF：浏览器 print 或 Playwright；
- PNG：Playwright 截图；
- PPTX：后续通过 PptxGenJS 或自研转换；
- MP4：通过浏览器录制或帧导出合成。

## 11. 为什么借用 reveal.js，而不是一开始自研

reveal.js 已经解决了很多基础问题：

- 翻页；
- 转场；
- 快捷键；
- 演讲模式；
- fragments；
- notes；
- overview；
- 插件生态；
- PDF 导出；
- 移动端适配。

如果一开始自研 runtime，很容易把大量时间耗在基础播放器细节上，而不是验证真正的产品命题。

项目真正要验证的是：

AI 能不能可靠地生成、修改、重组网页原生演示内容？

用户是否愿意在一个网页原生工作台里制作 presentation？

Skill 系统是否能显著提高 AI 输出质量和可控性？

因此，第一阶段应该借用 reveal.js，快速做出可用体验。与此同时，项目必须保留自己的 Deck IR 和 renderer adapter，避免被 reveal.js 锁死。

## 12. 长期突破方向

### 12.1 从 Slide 到 Scene

传统 PPT 的单位是 slide。本项目可以把单位扩展为 scene。

一个 scene 可以是：

- 普通幻灯片；
- 交互页面；
- 滚动段落；
- 数据仪表盘；
- 代码演示；
- 3D 场景；
- 动画解释；
- 嵌入式网页应用。

这样 presentation 不再只是“下一页、下一页”，而可以变成一种更广义的表达容器。

### 12.2 AI 可审计创作

AI 每次修改都生成明确命令，而不是黑盒覆盖文件。

例如：

```json
{
  "command": "convertSlideLayout",
  "slideId": "slide-004",
  "from": "paragraph",
  "to": "comparison",
  "reason": "当前页面信息过密，适合拆成左右对比结构"
}
```

这样用户可以知道 AI 做了什么，也可以撤销、重放和微调。

### 12.3 自动视觉 QA

系统可以像前端测试一样测试 presentation：

- 渲染每一页；
- 截图；
- 检查文字溢出；
- 检查元素重叠；
- 检查可读性；
- 检查导出结果；
- 让 AI 基于截图修复问题。

这是传统 PPT 工具和很多 AI 生成工具都没有做深的地方。

### 12.4 组件和 Skill 生态

长期壁垒不是“能生成 HTML”，而是拥有高质量、可组合、可参数化的表达组件和 Skill。

例如：

- `MarketSizeSlide`
- `ArchitectureDiagram`
- `BeforeAfterComparison`
- `InteractiveProductDemo`
- `AnimatedAlgorithmExplanation`
- `FinancialProjection`
- `3DModelShowcase`

AI 可以根据用户目标选择合适组件，而不是从零乱写页面。

### 12.5 非传统表达

这是项目区别于传统 PPT 和普通 AI PPT 工具的关键。

可以重点探索：

- scrollytelling；
- zoomable canvas；
- interactive dashboard；
- live demo presentation；
- branching presentation；
- 3D product walkthrough；
- animated explainer；
- notebook-like presentation；
- data-driven presentation；
- mini web app as presentation。

## 13. 风险与挑战

### 13.1 可视化编辑复杂度高

网页布局比 PPT 自由，但也更复杂。需要限制自由度，优先使用结构化组件和布局系统，而不是一开始就做完全自由画布。

### 13.2 AI 输出不稳定

AI 如果直接生成任意 HTML，质量会不稳定。必须通过 Deck IR、Skill、schema、校验和截图 QA 来约束。

### 13.3 导出一致性困难

HTML、PDF、PPTX、视频之间的一致性很难保证。建议先把 HTML/PDF 做好，再逐步支持 PPTX 和 MP4。

### 13.4 与现有产品差异需要清晰

市场上已经有 Gamma、Slides.com、Pitch、Canva、Beautiful.ai、PPTist、Oh My PPT 等产品。项目必须明确自己的差异：

- 本地优先；
- HTML 原生；
- Skill 可编排；
- 开放项目结构；
- 多 runtime；
- 非传统 presentation；
- AI 可审计编辑；
- 自动视觉 QA。

### 13.5 不要过早做大而全

如果一开始同时做 PPTX、云协作、模板市场、3D、可视化编辑、AI agent、视频导出，项目会失焦。

第一阶段应该聚焦在：

AI + HTML + reveal.js + Deck IR + 基础编辑 + 本地导出。

## 14. 推荐路线图

### Phase 1：技术验证

目标：证明 Deck IR 可以生成 reveal.js 演示，并且 AI 可以稳定修改它。

内容：

- 定义 Deck IR；
- 实现 reveal.js renderer；
- 实现 5 个模板；
- 实现 prompt to deck；
- 实现 AI edit slide；
- 实现 HTML/PDF 导出；
- 实现截图 QA 原型。

### Phase 2：可视化编辑

目标：让用户可以真正编辑 AI 生成的页面。

内容：

- 页面缩略图；
- 画布预览；
- 元素选中；
- 文本编辑；
- 拖拽和对齐；
- 主题切换；
- 动画设置；
- AI 针对选区编辑。

### Phase 3：Skill 系统

目标：让项目从“AI 生成页面”进化为“AI 调用表达能力”。

内容：

- Skill manifest；
- Skill 参数 schema；
- Skill 示例；
- Skill registry；
- Skill 调用日志；
- 团队自定义 Skill。

### Phase 4：自研 runtime

目标：补足 reveal.js 无法很好支持的表达。

内容：

- scene runtime；
- iframe/page 管理；
- 复杂动画；
- 交互组件；
- 数据组件；
- scrollytelling；
- 3D scene；
- app-like presentation。

### Phase 5：企业和生态

目标：面向私有化、团队和生态扩展。

内容：

- 私有模型接入；
- 企业品牌模板；
- 权限管理；
- Git / CI 集成；
- 模板市场；
- Skill 市场；
- 插件系统；
- API / MCP / automation。

## 15. 一句话愿景

把演示文稿从封闭的 PPT 文件，升级为 AI 可编排、网页原生、可视化编辑、可本地部署的表达系统。

## 16. 项目口号备选

- Presentation as Code, Edited by AI.
- AI-native slides, built on the web.
- 用网页重新发明演示文稿。
- 让 AI 像操作代码一样操作演示文稿。
- 不只是生成 PPT，而是生成可运行的表达系统。
- A local-first workbench for web-native presentations.

## 17. 当前最推荐的产品切入点

最推荐的切入点不是“再做一个 AI PPT 生成器”，而是：

面向开发者、产品团队和创业团队的本地 AI presentation workbench。

第一版可以主打：

- 本地运行；
- AI 生成 reveal.js 演示；
- HTML 项目可编辑；
- 可导出独立网页和 PDF；
- 内置高质量 pitch / technical / product demo Skill；
- 支持用户逐步沉淀自己的模板和 Skill。

这个切入点足够具体，也能和现有云端 AI PPT 产品形成明显差异。

## 18. 核心判断

本项目应该借用 reveal.js 等成熟工具的已有能力，但不能把 reveal.js 当成项目的最终边界。

更合理的策略是：

```txt
第一阶段：借 reveal.js 快速获得成熟播放能力
第二阶段：用 Deck IR 和 Skill 系统建立自己的核心
第三阶段：补足 reveal.js 缺失的编辑、AI、非传统表达能力
第四阶段：在必要时发展自研 runtime
```

也就是说：

借用成熟生态，避免重复造基础播放器；
建立自己的中间层，避免被现有框架锁死；
把真正的壁垒放在 AI 可编排、可视化编辑、Skill 生态和网页原生表达上。

