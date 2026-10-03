# 去人物版：AI 网络攻击视频重建工程

这是独立编写的 Remotion 代码工程，覆盖参考视频完整 358.016625 秒、10740 帧、1280×720。人物和真人素材没有进入工程。原配音与音乐保留为一条独立音轨。

本工程的视觉只依赖实时文字、CSS 图形、SVG、渐变、投影及连续时间函数。`public/` 只有 `narration.m4a`，不包含原片、人物视频、原片截图或逐帧描摹序列。没有使用其他作者的 b-roll skill。

## 打开与渲染

需要 Node.js 20+、npm、FFmpeg、Chrome。参考排版在 macOS 的 Songti SC、Avenir Next Condensed、Arial 上渲染；其他平台需要安装合适字体并重新检查排版。

```sh
npm ci
npm run studio
npm run typecheck
npm run render:final -- rebuild.mp4 --concurrency=4
```

如果 Remotion 没有找到浏览器，可追加：

```sh
--browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

FFmpeg 可用 `FFMPEG=/absolute/path/to/ffmpeg` 指定。`render:final` 先生成画面，再将原始 AAC 音轨无重编码封装进去。`npm run render` 是纯画面导出。

## 怎么修改

| 文件 | 可编辑内容 |
|---|---|
| `src/timeline.json` | 55 个片段的起止时间、标题、类型和关键词 |
| `src/subtitles.json` | 191 条校订字幕的文案、入场和出场时间 |
| `src/components/Stage.tsx` | 场景背景、渐变字、立体字、条形标签 |
| `src/components/Objects.tsx` | 卡片、显示器、锁、放大镜、抽象品牌符号 |
| `src/scenes/Scenes.tsx` | 布局坐标、旋转角度、遮罩/透明度、各片段动画 |
| `src/motion.ts` | 连续 cubic-bezier 时间函数 |
| `src/chart.json` | 从参考图形人工采样的曲线坐标、颜色和标签 |
| `src/config.ts` | 分辨率、帧率与总帧数 |
| `src/Replica.tsx` | 主合成、参数、字幕层 |

模型卡片的文字有自动适配；数字根据位数调整字号。过长的整页文案仍然需要人工排版。

## 可直接传入的参数

- `bugCount`：漏洞数字，默认 900。
- `recordCount`：攻击记录数字，默认 17000。
- `modelName`：模型卡片名称，默认 GPT-5.6 Sol。
- `brandName`：大标题中的仓库名称。
- `accentFrom`、`accentTo`：渐变色起止值。
- `motionSpeed`：大部分场景局部动作的速度倍率；不改变全局分镜时长和音轨。
- `motionEnabled`、`stillFrame`：冻结到任意帧，所有视觉层使用同一个帧时间。
- `showSubtitles`、`showSourceCredit`：字幕和参考作者署名开关。
- `sceneTitleOverrides`：按场景开始秒数字符串覆盖使用场景标题的组件。

实际测试文件：`editability.props.json` 和 `freeze.props.json`。

```sh
npm run render -- editability-demo.mp4 --frames=900-1049 --props=./editability.props.json
npm run still -- freeze.png --frame=5000 --props=./freeze.props.json
```

示例会把 900 改成 1234，换成紫红渐变，并把模型名称改为“自定义模型”。这是验证工程的演示，数字不代表参考内容。

## 复刻边界

这是去人物的参数化重建版，不是原片原工程，也不是 AE 的 .aep 文件。

保留了原片的叙事时间线、讲解音轨、主要 MG 构图与视觉主题。人物讲解、人物照片及带人物的实拍片段改成了关键词、流程、示意图或章节卡。由此产生的构图变化是有意改编。

新闻/资料页使用可编辑文字重新排版，部分正文作了摘录与压缩；字体、立体材质、网页细节、品牌符号、虚化和复杂光影采用近似。曲线按画面人工采样，其点位用于视觉复现，不是原始科学数据。字幕由画面识别后校订，时间边界约有 0.25 秒采样误差。

本次没有使用参考整帧来冒充可编辑画面。对于强调所有字体、材质和运动都完全相同的要求，本版本仍不达标。具体结果见随工程交付的 qa.md。
