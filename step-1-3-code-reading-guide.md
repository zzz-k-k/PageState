# Step 1-3 代码阅读指南

这份文档面向第一次接触 TypeScript 项目结构的人。它会解释前三步到底完成了什么、哪些地方还没有完成、应该按什么顺序读文件，以及每个文件在系统里的作用。

你可以先记住这条主线：

```txt
Step 1：定义 Deck IR，说明 deck.json 应该长什么样
Step 2：定义 Command Layer，说明 deck 应该如何被安全修改
Step 3：定义 Reveal Renderer，说明 deck 如何被转换成真正的 HTML
```

## 1. 对照计划文档的完成情况

计划文档是 [tech-stack-and-mvp-plan.md](D:/PageState/tech-stack-and-mvp-plan.md)。

### Step 1：定义最小 Deck IR

计划要求：

```txt
deck：标题、主题、元数据、页面列表
slide：页面 id、类型、布局、blocks、notes、animations
block：文本、图片、图表、列表、引用、代码等基础块
theme：颜色、字体、间距、圆角等 token
exportConfig：导出尺寸、格式、页面比例
```

当前状态：已完成。

已经实现：

```txt
DeckSchema
SlideSchema
BlockSchema
ThemeSchema
ExportConfigSchema
valid-deck.json
invalid-deck.json
deck.schema.json
DeckSchema 测试
```

验收情况：

```txt
npm test 通过
deck.schema.json 可以生成
valid-deck.json 可以被 Zod 接受
invalid-deck.json 会被 Zod 拒绝
```

### Step 2：实现 Command Layer

计划要求：

```txt
每个命令都是纯数据
命令执行前后可测试
支持 undo / redo 的基础历史栈
```

当前状态：核心 Command Layer 已完成，undo / redo 历史栈尚未单独实现。

已经实现：

```txt
CommandSchema
executeCommand
executeCommands
createSlide / deleteSlide / updateBlockText 等 17 个命令
patchDeck 受控逃生口
command.schema.json
commands 测试
```

还没实现：

```txt
Undo / redo 历史栈
Inverse command 自动生成
Command history 存储
```

不过目前的实现已经为 undo / redo 做好了基础，因为命令是纯数据，执行器返回新的 deck，不直接修改原始 deck。

### Step 3：实现 reveal.js Renderer

计划要求：

```txt
将每个 slide 编译为 reveal.js <section>
支持标题、段落、列表、图片、引用、代码、基础图表
支持 speaker notes
支持 fragments 和基础动画映射
注入主题 CSS variables
```

当前状态：核心已完成。

已经实现：

```txt
renderRevealDeck(deck)
slide -> <section>
block -> HTML 元素
theme tokens -> CSS variables
notes -> <aside class="notes">
frame -> absolute positioning style
rendererHints.reveal 扩展字段
exports/valid-deck/index.html 示例导出
```

需要说明：

```txt
已经生成 reveal.js HTML 和本地 reveal 资源。
尚未用 Playwright 做自动浏览器运行验收。
浏览器打开、键盘翻页这一步目前需要人工打开 exports/valid-deck/index.html 验证。
```

## 2. 你应该按什么顺序阅读

不要从 `package.json` 一路硬读到最后。建议按这个顺序读：

```txt
1. packages/ir/examples/valid-deck.json
2. packages/ir/src/deck-schema.ts
3. packages/ir/tests/deck-schema.test.ts
4. packages/commands/src/command-schema.ts
5. packages/commands/src/executor.ts
6. packages/commands/tests/executor.test.ts
7. packages/renderer-reveal/src/render.ts
8. packages/renderer-reveal/scripts/render-valid-deck.ts
9. exports/valid-deck/index.html
```

原因是：

```txt
先看一份真实 deck 数据
再看这份数据为什么合法
再看命令如何修改它
最后看它如何被渲染成 HTML
```

## 3. 根目录文件说明

### package.json

位置：[package.json](D:/PageState/package.json)

作用：整个 monorepo 的总控配置。

关键内容：

```json
"workspaces": [
  "packages/*"
]
```

意思是：`packages/ir`、`packages/commands`、`packages/renderer-reveal` 都是这个项目里的子包。

关键命令：

```json
"test": "...",
"build": "...",
"build:schema": "...",
"render:example": "..."
```

这些命令让你可以在根目录执行：

```bash
npm test
npm run build
npm run build:schema
npm run render:example
```

初学者理解：

```txt
根 package.json 像项目总开关。
它不写业务代码，只负责把各个包组织起来。
```

### package-lock.json

位置：[package-lock.json](D:/PageState/package-lock.json)

作用：npm 自动生成的依赖锁文件。

你通常不用手写它。它保证每次安装依赖时版本一致。

### tsconfig.base.json

位置：[tsconfig.base.json](D:/PageState/tsconfig.base.json)

作用：TypeScript 公共配置。

比如：

```json
"strict": true
```

表示开启严格类型检查。这样代码写错时更容易被提前发现。

### .gitignore

位置：[.gitignore](D:/PageState/.gitignore)

作用：告诉 Git 哪些文件不用提交。

例如：

```txt
node_modules/
dist/
packages/*/dist/
```

这些是依赖或构建产物，不应该作为源码提交。

## 4. Step 1 文件说明：Deck IR

### packages/ir/package.json

位置：[packages/ir/package.json](D:/PageState/packages/ir/package.json)

作用：`@pagestate/ir` 这个包自己的配置。

它声明这个包依赖：

```json
"zod": "^4.1.13"
```

Zod 是用来定义和校验数据结构的。

### packages/ir/tsconfig.json

位置：[packages/ir/tsconfig.json](D:/PageState/packages/ir/tsconfig.json)

作用：IR 包自己的 TypeScript 配置。

```json
"rootDir": "src",
"outDir": "dist"
```

意思是：

```txt
源码在 src
编译后输出到 dist
```

### packages/ir/vitest.config.ts

位置：[packages/ir/vitest.config.ts](D:/PageState/packages/ir/vitest.config.ts)

作用：测试配置。

```ts
include: ["tests/**/*.test.ts"]
```

意思是：只运行 `tests` 目录下以 `.test.ts` 结尾的测试文件。

### packages/ir/src/deck-schema.ts

位置：[packages/ir/src/deck-schema.ts](D:/PageState/packages/ir/src/deck-schema.ts)

作用：定义 Deck IR 的核心数据规则。

这是 Step 1 最重要的文件。

你会看到很多这样的代码：

```ts
export const DeckSchema = z
  .object({
    schemaVersion: z.literal(DeckSchemaVersion),
    type: z.literal("deck"),
    id: IdSchema,
    title: z.string().min(1),
    theme: ThemeSchema,
    slides: z.array(SlideSchema).min(1)
  })
  .strict();
```

逐句解释：

```txt
export
  把 DeckSchema 暴露给其他文件使用。

const
  定义一个常量。这里 DeckSchema 是一个不会被重新赋值的变量。

z.object(...)
  定义一个对象应该有哪些字段。

z.literal("deck")
  这个字段必须严格等于 "deck"。

z.string().min(1)
  必须是字符串，并且不能为空。

z.array(SlideSchema).min(1)
  必须是数组，数组里每一项都要符合 SlideSchema，并且至少有 1 页。

.strict()
  不允许出现 schema 里没有定义的多余字段。
```

这个文件里几个重要 schema：

```txt
DeckSchema
  整份演示文稿。

SlideSchema
  一页演示。

BlockSchema
  页面里的内容块。

ThemeSchema
  主题 token。

ExportConfigSchema
  导出设置。

RendererHintsSchema
  给具体 renderer 的扩展字段。目前包含 reveal。
```

#### BlockSchema 为什么用 discriminatedUnion

你会看到：

```ts
export const BlockSchema = z.discriminatedUnion("type", [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  ListBlockSchema,
  ImageBlockSchema,
  QuoteBlockSchema,
  ChartBlockSchema,
  CodeBlockSchema
]);
```

意思是：根据 `type` 字段判断这个 block 应该按哪套规则校验。

例如：

```json
{
  "type": "heading",
  "text": "Hello"
}
```

会用 `HeadingBlockSchema` 校验。

```json
{
  "type": "chart",
  "chartType": "bar",
  "data": {}
}
```

会用 `ChartBlockSchema` 校验。

这对 AI 很重要，因为 AI 只要写对 `type`，系统就知道应该检查哪些字段。

### packages/ir/src/index.ts

位置：[packages/ir/src/index.ts](D:/PageState/packages/ir/src/index.ts)

作用：统一出口。

它把 `deck-schema.ts` 里的 schema 和类型导出，方便别的包这样使用：

```ts
import { DeckSchema, type Deck } from "@pagestate/ir";
```

如果没有这个文件，别的包就要直接引用内部路径，项目会更乱。

### packages/ir/examples/valid-deck.json

位置：[packages/ir/examples/valid-deck.json](D:/PageState/packages/ir/examples/valid-deck.json)

作用：一份合法的示例 deck。

它不是最终产品里的唯一 deck，只是当前用来测试和演示的样板。

它目前有 3 页：

```txt
slide_001：hero 页
slide_002：comparison 页
slide_003：chart 页
```

初学者建议先读这个文件，因为它比 TypeScript 更直观。

### packages/ir/examples/invalid-deck.json

位置：[packages/ir/examples/invalid-deck.json](D:/PageState/packages/ir/examples/invalid-deck.json)

作用：故意写错的数据。

它用于证明 Zod 真的能发现问题。

比如：

```json
"id": "1-invalid-id"
```

这是错的，因为 id 不能以数字开头。

### packages/ir/tests/deck-schema.test.ts

位置：[packages/ir/tests/deck-schema.test.ts](D:/PageState/packages/ir/tests/deck-schema.test.ts)

作用：测试 DeckSchema 是否正常工作。

你会看到：

```ts
const result = DeckSchema.safeParse(deckJson);
```

`safeParse` 的意思是：尝试校验数据。

结果有两种：

```ts
{ success: true, data: ... }
{ success: false, error: ... }
```

它不会直接抛异常，所以很适合测试和后端服务。

### packages/ir/scripts/export-json-schema.ts

位置：[packages/ir/scripts/export-json-schema.ts](D:/PageState/packages/ir/scripts/export-json-schema.ts)

作用：把 Zod schema 导出成 JSON Schema。

关键代码：

```ts
const jsonSchema = z.toJSONSchema(DeckSchema, {
  io: "input"
});
```

解释：

```txt
Zod schema
  给 TypeScript 程序用。

JSON Schema
  给 AI、外部工具、编辑器插件、后端接口文档用。
```

### packages/ir/schemas/deck.schema.json

位置：[packages/ir/schemas/deck.schema.json](D:/PageState/packages/ir/schemas/deck.schema.json)

作用：自动生成的 Deck JSON Schema。

你通常不手写它，而是运行：

```bash
npm run build:schema
```

生成。

## 5. Step 2 文件说明：Command Layer

### packages/commands/package.json

位置：[packages/commands/package.json](D:/PageState/packages/commands/package.json)

作用：`@pagestate/commands` 包自己的配置。

它依赖：

```json
"@pagestate/ir": "0.1.0"
```

意思是：命令层要复用 Step 1 定义的 Deck、Slide、Block 规则。

### packages/commands/src/command-schema.ts

位置：[packages/commands/src/command-schema.ts](D:/PageState/packages/commands/src/command-schema.ts)

作用：定义所有命令应该长什么样。

例如：

```ts
export const CreateSlideCommandSchema = CommandMetaSchema.extend({
  type: z.literal("createSlide"),
  slide: SlideSchema,
  index: z.number().int().nonnegative().optional()
}).strict();
```

逐句解释：

```txt
CommandMetaSchema.extend(...)
  在公共命令字段基础上，扩展 createSlide 自己的字段。

type: z.literal("createSlide")
  这个命令的 type 必须是 createSlide。

slide: SlideSchema
  传入的新页面必须符合 SlideSchema。

index: z.number().int().nonnegative().optional()
  index 是可选字段。
  如果有，必须是非负整数。
  它决定新 slide 插入 deck.slides 的哪个位置。
```

目前命令包括：

```txt
createSlide
deleteSlide
reorderSlides
updateSlideTitle
setSlideLayout
insertBlock
deleteBlock
replaceBlock
updateBlockText
updateBlockFrame
updateBlockStyle
updateBlockProps
addAnimation
removeAnimation
applyTheme
convertSlideLayout
patchDeck
```

### packages/commands/src/errors.ts

位置：[packages/commands/src/errors.ts](D:/PageState/packages/commands/src/errors.ts)

作用：统一命令执行错误格式。

例如：

```ts
export type CommandExecutionResult<T> =
  | { success: true; data: T }
  | { success: false; error: CommandExecutionError };
```

这是 TypeScript 的联合类型。

意思是结果只有两种：

```txt
成功：success 为 true，并带 data
失败：success 为 false，并带 error
```

这样调用方必须先判断：

```ts
if (result.success) {
  // result.data 可以安全使用
} else {
  // result.error 可以安全使用
}
```

### packages/commands/src/executor.ts

位置：[packages/commands/src/executor.ts](D:/PageState/packages/commands/src/executor.ts)

作用：真正执行命令。

这是 Step 2 最重要的文件。

核心函数：

```ts
export function executeCommand(deckInput: unknown, commandInput: unknown): CommandExecutionResult<Deck>
```

解释：

```txt
deckInput: unknown
  输入 deck，现在先当作未知数据处理。
  不能假设它一定合法。

commandInput: unknown
  输入 command，也先当作未知数据处理。

CommandExecutionResult<Deck>
  返回结果。
  成功时返回新的 Deck。
  失败时返回错误。
```

执行流程：

```txt
1. DeckSchema.safeParse(deckInput)
   先确认 deck 合法。

2. CommandSchema.safeParse(commandInput)
   再确认命令合法。

3. clone(deck)
   复制一份 deck，避免修改原始对象。

4. mutateDeck(nextDeck, command)
   根据命令类型修改 deck。

5. DeckSchema.safeParse(nextDeck)
   修改后再校验一次，防止命令把 deck 改坏。

6. 返回新 deck 或错误。
```

#### mutateDeck 是什么

```ts
function mutateDeck(deck: Deck, command: Command)
```

它是命令分发器。

里面使用：

```ts
switch (command.type) {
  case "createSlide":
    return createSlide(deck, command.slide, command.index);
}
```

`switch` 的意思是：根据 `command.type` 选择不同处理逻辑。

比如：

```txt
createSlide -> 调 createSlide 函数
deleteBlock -> 调 deleteBlock 函数
updateBlockText -> 调 updateBlockText 函数
```

#### createSlide 如何工作

```ts
const insertionIndex = index ?? deck.slides.length;
deck.slides.splice(insertionIndex, 0, slide);
```

解释：

```txt
index ?? deck.slides.length
  如果 index 有值，就用 index。
  如果 index 没传，就用 deck.slides.length，也就是插到最后。

splice(insertionIndex, 0, slide)
  在数组 insertionIndex 位置插入 slide。
  第二个参数 0 表示不删除任何元素。
```

#### findSlide 和 findBlock 是什么

这两个函数负责在 deck 里找东西。

```txt
findSlide(deck, slideId)
  根据 slideId 找到对应 slide。

findBlock(deck, slideId, blockId)
  先找到 slide，再在 slide.blocks 里找到 block。
```

如果找不到，会返回 `NOT_FOUND` 错误，而不是悄悄失败。

#### patchDeck 是什么

`patchDeck` 是给 AI 的受控逃生口。

普通命令不够用时，可以用 JSON Pointer 修改 deck。

例如：

```json
{
  "type": "patchDeck",
  "operations": [
    {
      "op": "replace",
      "path": "/slides/0/blocks/1/text",
      "value": "A local-first workbench for web-native presentations."
    }
  ]
}
```

它不是无限自由的：

```txt
不能改 schemaVersion
不能改 type
改完必须重新通过 DeckSchema
```

### packages/commands/src/index.ts

位置：[packages/commands/src/index.ts](D:/PageState/packages/commands/src/index.ts)

作用：命令包统一出口。

未来其他模块可以这样用：

```ts
import { executeCommand, CommandSchema } from "@pagestate/commands";
```

### packages/commands/tests/executor.test.ts

位置：[packages/commands/tests/executor.test.ts](D:/PageState/packages/commands/tests/executor.test.ts)

作用：测试命令是否真的能安全修改 deck。

它测试了：

```txt
updateBlockText 修改文字
createSlide 插入页面
executeCommands 批量执行
patchDeck 修改 deck
patchDeck 禁止改 schemaVersion
非法修改会返回 SCHEMA_VIOLATION
不存在的 block 返回 NOT_FOUND
convertSlideLayout 语义转换页面
```

### packages/commands/scripts/export-json-schema.ts

位置：[packages/commands/scripts/export-json-schema.ts](D:/PageState/packages/commands/scripts/export-json-schema.ts)

作用：把 CommandSchema 导出成 JSON Schema。

未来 AI 可以根据它知道自己能调用哪些命令，以及每个命令需要哪些字段。

### packages/commands/schemas/command.schema.json

位置：[packages/commands/schemas/command.schema.json](D:/PageState/packages/commands/schemas/command.schema.json)

作用：自动生成的命令 JSON Schema。

它不是手写文件，是由脚本生成的。

## 6. Step 3 文件说明：Reveal Renderer

### packages/renderer-reveal/package.json

位置：[packages/renderer-reveal/package.json](D:/PageState/packages/renderer-reveal/package.json)

作用：`@pagestate/renderer-reveal` 包自己的配置。

它依赖：

```json
"@pagestate/ir": "0.1.0",
"reveal.js": "^5.2.1"
```

意思是：

```txt
它读取 Deck IR
然后使用 reveal.js 的 HTML 结构播放
```

### packages/renderer-reveal/src/html.ts

位置：[packages/renderer-reveal/src/html.ts](D:/PageState/packages/renderer-reveal/src/html.ts)

作用：HTML 小工具。

#### escapeHtml

```ts
export function escapeHtml(value: unknown): string
```

作用：把危险字符转义。

例如：

```txt
< 变成 &lt;
> 变成 &gt;
& 变成 &amp;
" 变成 &quot;
```

为什么需要它：

如果用户标题是：

```txt
<script>alert(1)</script>
```

不转义就可能变成真正脚本。转义后只会显示为文字。

#### toKebabCase

```ts
export function toKebabCase(value: string): string
```

作用：把 token 名转换成 CSS 变量适合的名字。

例如：

```txt
color.text.primary -> color-text-primary
fontHeading -> font-heading
```

### packages/renderer-reveal/src/render.ts

位置：[packages/renderer-reveal/src/render.ts](D:/PageState/packages/renderer-reveal/src/render.ts)

作用：把 Deck IR 转成完整 reveal.js HTML。

这是 Step 3 最重要的文件。

核心函数：

```ts
export function renderRevealDeck(deckInput: unknown, options: RevealRenderOptions = {}): string
```

解释：

```txt
deckInput: unknown
  输入数据，先当作未知。

DeckSchema.safeParse(deckInput)
  渲染前先校验 deck 合法。

options
  渲染选项，比如 reveal 静态资源路径 assetBase。

返回 string
  返回完整 HTML 字符串。
```

#### renderRevealDeck 做什么

它生成：

```txt
<!doctype html>
<html>
<head>
  reveal.css
  theme css
  自定义 CSS variables
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>...</section>
    </div>
  </div>
  reveal.js
  Reveal.initialize(...)
</body>
</html>
```

#### renderSlide

```ts
function renderSlide(slide: Slide): string
```

作用：把一个 slide 转成 reveal.js 的 `<section>`。

例如：

```json
{
  "id": "slide_001",
  "type": "hero"
}
```

会变成：

```html
<section data-slide-id="slide_001" data-slide-type="hero">
```

#### renderBlock

```ts
function renderBlock(block: Block, slide: Slide): string
```

作用：把一个 block 转成 HTML 元素。

目前映射关系：

```txt
heading   -> h1 / h2 / h3
paragraph -> p
list      -> ul / ol
image     -> figure + img
quote     -> blockquote
chart     -> figure + table
code      -> pre + code
```

#### renderBlockStyle

```ts
function renderBlockStyle(block: Block): string
```

作用：把 block 的视觉数据转成 CSS style。

例如：

```json
"frame": {
  "x": 10,
  "y": 8,
  "width": 80,
  "height": 14,
  "unit": "%"
}
```

会变成：

```css
position: absolute;
left: 10%;
top: 8%;
width: 80%;
height: 14%;
```

所以后面用户拖拽标题时，最终就是修改 block.frame，再由 renderer 转成 CSS。

#### renderDeckCss

```ts
function renderDeckCss(deck: Deck): string
```

作用：生成这份 deck 需要的 CSS。

它会把 theme token 转成：

```css
:root {
  --color-text-primary: #0f172a;
  --font-heading: Inter;
}
```

### packages/renderer-reveal/src/index.ts

位置：[packages/renderer-reveal/src/index.ts](D:/PageState/packages/renderer-reveal/src/index.ts)

作用：renderer 包统一出口。

未来其他模块可以：

```ts
import { renderRevealDeck } from "@pagestate/renderer-reveal";
```

### packages/renderer-reveal/scripts/render-valid-deck.ts

位置：[packages/renderer-reveal/scripts/render-valid-deck.ts](D:/PageState/packages/renderer-reveal/scripts/render-valid-deck.ts)

作用：固定示例导出脚本。

它不是通用渲染器。

它做的是：

```txt
读取 packages/ir/examples/valid-deck.json
调用 renderRevealDeck(deck)
写入 exports/valid-deck/index.html
复制 reveal.js 静态资源到 exports/valid-deck/reveal/
```

为什么需要它：

```txt
render.ts 只是函数库，不会自己读写文件。
render-valid-deck.ts 是一次具体任务，用来证明示例 deck 可以导出成真实 HTML。
```

未来可以升级成：

```txt
render-deck --input ./project/deck.json --output ./exports/project
```

### packages/renderer-reveal/tests/render.test.ts

位置：[packages/renderer-reveal/tests/render.test.ts](D:/PageState/packages/renderer-reveal/tests/render.test.ts)

作用：测试渲染器输出的 HTML 是否包含关键结构。

它检查：

```txt
是否有 reveal 容器
是否有 slides 容器
是否生成 3 个 section
是否包含 slide id
是否包含 block id
是否包含 speaker notes
是否包含 CSS variables
frame 是否转换成 position style
rendererHints.reveal 是否转换成 reveal attributes
非法 deck 是否会被拒绝渲染
```

### exports/valid-deck/index.html

位置：[exports/valid-deck/index.html](D:/PageState/exports/valid-deck/index.html)

作用：实际生成出来的 reveal.js 演示页面。

它不是源码，而是导出产物。

你可以打开它看当前效果。

## 7. 现在的完整数据流

现在项目已经有了这条链路：

```txt
valid-deck.json
  ↓
DeckSchema 校验
  ↓
Command Layer 可修改 Deck
  ↓
renderRevealDeck(deck)
  ↓
exports/valid-deck/index.html
  ↓
浏览器播放 reveal.js
```

注意：

```txt
AI 以后主要写 deck.json 或 Command。
AI 不应该直接写最终 HTML。
HTML 是 renderer 的输出物，不是真相源。
```

## 8. 常见 TypeScript 和 JavaScript 语法解释

### import

```ts
import { DeckSchema } from "@pagestate/ir";
```

意思是：从别的模块引入一个变量、函数或类型。

### export

```ts
export const DeckSchema = ...
```

意思是：把这个变量暴露出去，让别的文件可以 import。

### type

```ts
export type Deck = z.infer<typeof DeckSchema>;
```

`type` 是 TypeScript 里的类型定义。

它只在开发和编译时存在，不会出现在最终 JavaScript 运行时代码里。

### z.infer

```ts
z.infer<typeof DeckSchema>
```

意思是：根据 Zod schema 自动推导 TypeScript 类型。

好处是：

```txt
不用手写一份 Deck 类型
schema 变了，类型也跟着变
```

### unknown

```ts
function executeCommand(deckInput: unknown, commandInput: unknown)
```

`unknown` 表示：我现在不知道这个值是什么类型。

这比 `any` 更安全，因为你必须先校验它，才能使用它。

### async / await

```ts
const content = await readFile(path, "utf8");
```

文件读取是异步操作。

`await` 表示：等读取完成，再继续往下执行。

### JSON.parse

```ts
const deck = JSON.parse(content);
```

作用：把 JSON 字符串转换成 JavaScript 对象。

### structuredClone

```ts
return globalThis.structuredClone(value);
```

作用：深拷贝一个对象。

在命令执行器里，它用于避免直接修改原始 deck。

### array.splice

```ts
deck.slides.splice(insertionIndex, 0, slide);
```

作用：修改数组。

这里表示：

```txt
在 insertionIndex 位置插入 slide
删除 0 个元素
```

### map

```ts
deck.slides.map((slide) => renderSlide(slide))
```

作用：把数组里的每一项转换成另一种东西。

这里是：

```txt
每个 slide -> 一段 HTML 字符串
```

### filter

```ts
.filter(Boolean)
```

作用：去掉数组里的空字符串、null、undefined 等假值。

### join

```ts
.join("\n")
```

作用：把字符串数组拼成一个大字符串，中间用换行符连接。

### switch

```ts
switch (command.type) {
  case "createSlide":
    return createSlide(...);
}
```

作用：根据不同类型执行不同分支。

在命令执行器里，它根据 `command.type` 选择具体命令函数。

## 9. 你现在最应该理解的三个核心概念

### 1. Deck IR 是真相源

`deck.json` 是演示文稿真正的数据来源。

HTML 只是由它生成的结果。

### 2. Command 是修改方式

用户操作和 AI 操作都应该变成命令。

例如：

```json
{
  "type": "updateBlockText",
  "slideId": "slide_001",
  "blockId": "title",
  "text": "新的标题"
}
```

然后由 `executeCommand` 安全修改 deck。

### 3. Renderer 是输出方式

`renderRevealDeck` 把 deck 转成 reveal.js HTML。

未来还可以有：

```txt
renderStaticHtml
renderPptx
renderPdf
renderMotionCanvas
```

但它们都应该消费同一份 Deck IR。

## 10. 下一步建议

从计划文档看，下一步是 Step 4：实现 5 到 10 个基础模板。

但在进入 Step 4 前，我建议先补两个小基础：

```txt
1. 做一个通用 render-deck 脚本
   不要只固定渲染 valid-deck.json。

2. 给 Command Layer 补一个最小 history
   让 undo / redo 验收真正闭环。
```

这样 Step 4 做模板时，体验会更稳。
