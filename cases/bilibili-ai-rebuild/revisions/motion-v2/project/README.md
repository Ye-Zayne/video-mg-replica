# MG 复刻工程 · 动效修订版 v2

完整 358.016625 秒、10740 帧、1280×720。保留原音轨；人物及手部实拍改成图形讲解。此版修正了前一版缺少连续转场、文字时序、镜头运动和对象误识别的问题。

这是 Remotion 工程；文字、数字、布局、独立矢量图形与动作都能改。不是 AE 的 .aep 文件，也没有嵌入原片画面。`public/` 只有原音轨。OpenAI 标志用公开品牌 SVG 形状，来源见 ATTRIBUTION.md。

## 打开和导出

需要 Node.js 20+、npm、Chrome 和 FFmpeg。按以下命令执行：

```sh
npm ci
npm run studio
npm run typecheck
npm run render:final -- rebuild-v2.mp4 --concurrency=4
```

Studio 的音轨与帧时间同步。最终导出会把画面与原始 AAC 音轨无重编码封装，保持原始音乐和音效。

FFmpeg 不在 PATH 时设置 `FFMPEG=/absolute/path/to/ffmpeg`。Chrome 未自动找到时追加 `--browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`。在 macOS 使用 Songti SC、STSong、DIN Condensed、Avenir Next Condensed 等字体；其他系统需要匹配字体并重新检查排版。未打包系统字体。

## 动效文件

| 文件 | 修改内容 |
|---|---|
| `src/scenes/EarlyMotion.tsx` | 片头倾斜落下、文字展开、标签、新闻擦入、模型卡上下接力、标题更替 |
| `src/scenes/MiddleMotion.tsx` | 资料页纵向推镜/高亮、黑场大字、Hugging Face 标签/标题/三张彩卡、记录数字 |
| `src/scenes/LateMotion.tsx` | 累积逐字、锁与主动检查、查案镜头、聊天内容替换、GLM 和排行榜、能力/控制权 |
| `src/scenes/EndingMotion.tsx` | 实测曲线图推镜、三层磁带入场/文字退场/前磁带旋转 |
| `src/scenes/NarrativeMotion.tsx` | 人物替代段：按讲解阶段展开的三种图形版式；属于改编 |
| `src/scenes/Scenes.tsx` | 分镜组件入口，所有场景共享全局帧时间 |
| `src/timeline.json` | 56 个片段的时长与场景参数，补回 333.182–334.716 秒磁带段 |
| `src/subtitles.json` | 字幕文案和起止时间 |
| `src/components/Objects.tsx` | OpenAI 矢量形状与通用图形 |
| `src/Replica.tsx` | 时间、字幕、音频、冻结模式、主题色 |

同一连续动作跨过多个分镜时，组件保留共同时间原点。例如 29.968–43.302 秒的漏洞卡/模型卡/限制标题是同一时间轴，不会每次分镜切换重新入场。

## 替换参数

使用 `editability.props.json` 改漏洞数、模型名、品牌名、渐变、速度；`freeze.props.json` 冻结到某帧。

```sh
npm run render -- changed.mp4 --frames=900-1049 --props=./editability.props.json
npm run still -- frozen.png --frame=5000 --props=./freeze.props.json
```

- `bugCount / recordCount / modelName / brandName`：数值、模型/仓库名称。
- `accentFrom / accentTo`：渐变配色。
- `motionSpeed`：局部动作速度，不改变总时长及音轨；极端速度会改变动作与旁白关系。
- `motionEnabled / stillFrame`：统一冻结到指定帧。
- `showSubtitles / showSourceCredit`：字幕/参考署名。
- `sceneTitleOverrides`：按场景开始秒数字符串覆盖使用该标题的组件；资料页面有单独正文和固定词组，请在相应模块改。

## 边界

文字、布局、摄影材质、复杂三维物件和景深仍有近似。多数动作根据密集取样时点重建，只有图表推镜有独立特征测量、连续曲线拟合和留出帧验证。不能称为逐帧一致。人物相关镜头的图形替代为重新设计，不能称为原片对应动效。

随附 qa.md 和分段报告说明具体检查、修改和差异。原版工程保留在案例原路径，本修订独立存放。
