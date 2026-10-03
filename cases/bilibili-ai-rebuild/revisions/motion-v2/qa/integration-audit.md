# 只读集成审查

审查时间：2026-09-08。当前完整渲染已经启动；本审查没有修改任何生产源码、没有增加测试文件、没有启动 Chrome。读取代码、现有取证图、时间表与音轨元数据，并计算全部帧的分镜归属。

## 结论

**发现 1 个影响默认成片的跨场景连续性问题：133.8 秒品牌标题重复入场。已通知 root，root 决定局部修正后重渲该段；此项目前为 pending_reverification。**

其余要求的集成检查通过：56 个片段全部有唯一 dispatcher，10740 帧全部恰好属于一个片段，冻结模式共用帧时钟，生产工程没有原片视觉媒体，最终整片音轨映射正确。以下两个非默认导出/参数限制不影响正在进行的默认整片渲染。

## 实际问题与修正建议

### A. 133.8 秒标题重复入场（默认成片，待复验）

位置：`project/src/scenes/MiddleMotion.tsx`，`Records` 末尾与 `Brand(response)` 起始。

- `Records` 现有 `exit` 在 133.46–133.8 秒从 0 到 1，使旧电脑移出，并把新品牌标题升到 `x=150, y≈260, scale≈1, opacity≈1`。
- 切到 `Brand(response)`，`u` 重新为 0，其 `intro=0`，同一标题突然变为 `y=600, scale=1.65, opacity=0`，随后再次入场。这会产生消失/跳位，并非原片的单次接力。
- `evidence/middle/hug-response.jpg` 的 133.70、133.95、134.20 秒显示原片只进行一次从底部上升、缩小落定；`records.jpg` 同样显示 133.65 秒已经开始接力。

建议把这一个接力动作改为两场景共同使用的绝对源时钟。可以采用下列连续近似，具体曲线为基于现有接触表的视觉推断，不是重新测量拟合：

```text
sourceTime = 130.473 + (p.t - 130.473) * motionSpeed
q = cubicBezier((sourceTime - 133.48) / 0.72, [0.55, 0, 0.25, 1])
brand.x = 150
brand.y = 720 - 480 * q
brand.scale = 1.65 - 0.65 * q
brand.opacity = q
brand.blur = 13 * (1 - q)
oldRecords.translateY = -700 * q
```

`Records` 与 `Brand(response)` 使用同一品牌组件/字体、宽度、锚点和上述进度。旧电脑只在 Records 场景负责绘制，或在接力完成前由同一连续组件绘制；不要在切点把入场进度归零。其余 response 旁注的时间仍可使用原局部时钟。

建议接管值：

| 时刻 | q | 标题 y | 标题 scale | opacity | blur(px) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 133.48 | 0 | 720 | 1.65 | 0 | 13 |
| 133.70 | 0.194512 | 626.634 | 1.523567 | 0.194512 | 10.471 |
| **133.80 切点** | **0.554087** | **454.038** | **1.289843** | **0.554087** | **5.797** |
| 133.95 | 0.889528 | 293.027 | 1.071807 | 0.889528 | 1.436 |
| 134.20 | 1 | 240 | 1 | 1 | 0 |

代码变更主要影响约 **133.46–134.35 秒**。建议补渲染 **帧 4004–4031（两端包含，28 帧）** 覆盖 133.46–134.40 秒并留边界余量。拼接前确认新旧在首尾相同；若为接力补画旧电脑超过此范围，则相应扩大窗口。验收应重点比较 4012、4013、4014、4015 和接力落定帧，并正常速度回放。

状态：**pending_reverification**。root 已接手修正；审查者没有改源。

### B. 非 1 倍动作速度下，79.6 秒镜头时钟回跳（不影响默认整片）

`MiddleMotion.tsx` 的 darkwords 末尾传给 `Online` 的时间是 `(t - 74.4) * motionSpeed - 4.64`，online 分镜传入 `(t - 79.6) * motionSpeed + 0.56`。

- `motionSpeed=1`：两边在 79.6 秒均为 0.56，连续，通过。
- `motionSpeed=1.35`：前者为 2.38，后者为 0.56，镜头角度/平移会回跳。

现有默认交付 speed=1，因此不阻断本次整片。将来要支持全片任意速度时，应让这两个片段使用同一绝对锚点，而不是固定的 `+0.56`。

### C. render:final 的片段导出音轨范围不匹配（不影响当前全长命令）

`scripts/render-final.mjs` 会把后续参数全部转发给 Remotion，但最终 FFmpeg 固定使用从音轨 0 秒开始的完整音频，固定 `-t 358.016625`，没有按 `--frames` 裁剪或偏移音轨。因此若给 `render:final` 传 `--frames=900-1049`，画面只有该 5 秒片段，封装却仍包含原音轨的全长，起点也不相符。

README 的片段示例用的是直接 `npm run render`，不经过该脚本，正确；当前整片日志也没有传 `--frames`，所以不影响本次输出。该封装脚本应暂限定全长导出；片段导出继续使用已文档化的直接 Remotion 命令。

## 已通过的集成检查

### 1. 时间表与 dispatcher

- 56 个片段、32 种 type。
- 时间表从 0 到 358.016625 秒，邻接片段没有间隙、没有重叠。
- 对 0–10739 的全部 10740 帧计算 `t = frame / (28640000/954711)`，每帧恰好落入一个片段。
- 没有未知类型或重复抢占的分支，分配如下：

| 组件 | 实际片段数 | type |
| --- | ---: | --- |
| EarlyMotion | 8 | opening, escape, refuse, news, collaboration, bugs, models, limits |
| MiddleMotion | 10 | article, darkwords, online, hugging, records, sandbox, misread |
| LateMotion | 11 | route, safety, obedience, isolation, investigation, chat, intent, glm, ranking, control |
| EndingMotion | 3 | money, cassette-second, chart |
| NarrativeMotion | 24 | explain, principle, closing, defense |

仅 `src/index.tsx` 有 1 次 `registerRoot`。不存在临时预览合成入口。

### 2. 共享帧与冻结

- `Replica.tsx:9` 先统一选择 `f = motionEnabled ? live : stillFrame`，再计算 `t = f / fps`。
- 分镜选择、字幕、所有场景都使用这个 f/t；场景模块没有另行读取 `useCurrentFrame`、浏览器实时计时器或无固定种子的随机状态。
- 图表使用 `p.frame`，收到的也是统一冻结后的 f。冻结时 Audio 不挂载，因此不会出现画面冻结而预览音频继续播放。
- 片头 opening/escape 共用 0 秒锚点；bugs/models/limits 共用 29.968 秒锚点；safety/obedience 共用 168.641 秒；chat/intent 共用 225.577 秒。上述连续段不会在相邻分镜切换时重启。
- 图表 8970 帧测量锚点使用同一全局帧；最后一帧时间 357.9832901187151 秒，仍处于 closing 范围。

### 3. 生产视觉媒体隔离

- 对 `public/` 与 `src/` 的完整文件枚举显示，`public/` 只有 `narration.m4a`。
- FFmpeg 元数据确认此文件只有 AAC 音频流，44100 Hz、stereo，没有视频轨、封面视频轨。
- 源码没有 `<img>`、`<video>`、`Img`、`Video`、`OffthreadVideo`、图片 data URI 或外部视觉媒体 URL。SVG 的 `url(#...)` / `href="#..."` 只引用内部矢量定义。
- 现有 `chart.json` 是曲线几何采样，不是逐帧图形状态；OpenAI 标志为标准品牌 SVG path，来源记在 ATTRIBUTION.md。
- 人物/会议背景等是 CSS/SVG 几何改编，不是原片画面。

### 4. 最终音轨映射

- `render-final.mjs:13` 显式 `-map 0:v:0 -map 1:a:0`，画面来自本次渲染，音频来自独立 `public/narration.m4a`。
- 使用 `-c copy`，原 AAC 不重新编码；不会混入 Remotion 临时视频中的重编码音轨，也不会双重叠音。
- 本次音频和原案例独立音轨的 SHA256 完全一致：`11f7dcf40996ddfcfaf46d23ca0a1d7af4716cf38728ccc1d92efaff6993e43a`，6,989,536 字节。
- 当前实际命令：`render:final ../output/动效优化版.mp4 --browser-executable=... --concurrency=4`，未使用片段范围或修改 props，适用上述正确的全长映射。
- 输出尚在渲染，最终文件的流信息、首尾/同步和补丁接缝仍须在完成后复核；本审查没有提前标记成片技术验收通过。

## Root 完成后的处理

A：已改为共用 `ResponseTitle` 和130.473秒锚点，133.62–134.21秒单次入场；帧4004–4039共36帧重渲并合回成片。两边调用同一对象/坐标/样式；完整帧数通过，67.5263秒同步对照含此接缝并以1×播至结尾。动作时点仍为视觉近似。

B：online接管改为 `(p.t-74.4)*motionSpeed-4.64`，与darkwords共享时间原点，默认1倍效果不变。

C：render:final显式拒绝--frames参数；局部导出按README使用直接npm run render，避免错误封装全长音频。
