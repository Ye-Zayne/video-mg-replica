---
name: video-mg-replica
description: 从参考视频逐帧取证，复刻为可编辑的 Remotion 视频或 MG 动画，涵盖版式、文字、路径、遮罩、镜头运动、音频同步与对照验收。用于“照着视频做”“一模一样复刻”“复刻 MG 动画”；不用于无参考的自由创作或单纯转码。
---

# 视频与 MG 动画复刻

交付参考驱动的可编辑工程、完整 MP4 和对照证据。默认尽可能匹配原片，不重写文案、不重新设计、不添加参考中没有的动效。像素级一致只有在素材、字体、渲染与逐帧证据均支持时才能声称；高相似度指标不等于完全一致。

本 skill 适用于 Codex 与 Claude Code，自带本地取证、对比工具及 Remotion 起始工程，不依赖其他 skill 或付费生成服务。把本文件所在目录记作 `SKILL_DIR`；下列命令中的路径替换成实际绝对路径。

以“动作片段”组织制作：先闭环验证原片中一个代表性短段，再提炼参数化组件扩展到全片。不要等全片所有静帧都做好才发现核心动效不可实现。首次选样板和抽取复用组件时读 [motion-recipes.md](references/motion-recipes.md)。下面的布局、运动和对照步骤对每个动作片段循环执行；最终仍交付全部请求范围。

## 1. 获取证据与范围

- 接受本地视频、可访问的公开视频、原工程、素材目录或关键帧。链接是入口，不是视频本体。先用可用的网页/视频工具检查是否真能读取内容。
- 微信视频号等链接无法播放、要求登录或被安全策略拦截时，如实说明未看见内容，请用户提供 MP4/MOV 或清晰录屏；不猜画面、不绕过访问限制。缺原片时可以搭工程和记录需求，但不能编造分镜或标记复刻通过。
- 默认一个视频对应一个案例，覆盖全长，沿用原片比例、帧率、文案、人物、配色和音轨；用户给了范围或排除项时优先采用。多个视频分别建案例。不要默认剔除人物或铺白底。
- 原画面中的实拍素材可作为媒体层复用；MG 中的文字、几何、图表与可分层装饰应重建。参考整帧与原片只能用于取证和对照，不能把播放原片伪装成可编辑复刻。独立图片/实拍裁片的来源和用途写入素材清单。
- 检查 Python 3.10+、Pillow、FFmpeg/ffprobe、Node.js 20+；渲染需要 Remotion 与 Chrome。缺依赖时先找现有工具；二进制可用 `FFMPEG` / `FFPROBE` 指定，不写死某台机器路径。

执行取证前读 [evidence.md](references/evidence.md)。先 `video_tools.py --help` 和 `video_tools.py doctor`；doctor 是只读检查，一些渲染器自带的精简 FFmpeg 能编码但缺取证滤镜，不能只凭 `-version` 判断可用。然后：

```bash
python3 "$SKILL_DIR/scripts/video_tools.py" inspect /absolute/reference.mp4 --out /absolute/cases/reference-01
python3 "$SKILL_DIR/scripts/video_tools.py" frames /absolute/cases/reference-01/source/reference.mkv --out /absolute/cases/reference-01/evidence/overview --step 15
```

`inspect` 生成来源哈希、归一化参考片、音轨（如有）和 `case.json`；它不自动理解分镜。查看联系表后按切点/构图变化划分场景，再为每场提取原分辨率落定帧与动作密集帧。记录到 `analysis.md`，格式见 evidence 手册。先看图再写观察，区分测量、观察、推测和未知。

## 2. 先匹配静态画面

每个元素使用稳定 ID，记录场景、父层、边界、锚点、遮挡、文字内容/换行/字距、字体依据、颜色和素材来源。先匹配占屏比例、布局、字体与主色，再修纹理。每场选择入场完成、退场开始前的落定帧；持续运动场景选择明确的比较时刻。

读 [remotion.md](references/remotion.md)，将 `assets/remotion/` 复制到案例的 `project/`，按 `case.json` 配置画幅、fps 和帧数。新增场景与 SVG/React 组件，媒体放 `project/public/`，证据放工程外。模板只提供工程入口和连续贝塞尔工具，不能直接当作参考片成品。

先渲染每场静帧，查看 source/render/difference 对照。实现真正生效的 `motionEnabled` 和 `stillFrame`，使加入动效后仍可复查布局。文案、图片、主题色暴露为 props；实际渲染一次长文案/数字或图片替换，分别检查“替换生效”和“版式适配”。

用户要求先确认静帧时，交付这些静帧并等待；否则自行检查修正后继续，不人为插入审批步骤。已获认可的静帧和源码保留快照，后续输出写新目录。

## 3. 逐元素复刻运动

读 [mg-motion.md](references/mg-motion.md)。分别测场景切换、整体镜头、父组、元素、文字内部与特效；对每个动作标记起帧、落定帧、退场帧、关键采样及置信度。短动作逐帧看，不凭视频中点猜 easing。

从落定布局反推位移、缩放、旋转、路径、擦除与遮罩关系。选择能表达观察结果的组件；文字用实时文字，路径/描边用 SVG，复杂 3D 用适当引擎或原素材并披露编辑边界。不要为整片强行套一个效果。

平移、缩放、旋转、路径进度等标量有足够采样时，使用 `scripts/fit_motion.py` 拟合连续曲线，保留残差并用未参与拟合的帧验证。已验证动作可提炼成参数化组件与配方，明确支持的输入和限制；配方留在当前案例内，不依赖外部作者的 skill。

所有动画由帧号驱动；同一帧重复渲染应一致。拟合连续曲线，不能在每个测量点重新启动缓动。用固定种子处理随机性。保留配音和音乐的原始时序，不擅自替换成 TTS。

## 4. 渲染、对照与交付

读 [qa.md](references/qa.md)。完整渲染范围内的全部场景和音频，抽查首尾、切点前后、动作中段及文字落定帧，并正常速度回放。执行：

```bash
python3 "$SKILL_DIR/scripts/video_tools.py" compare /absolute/cases/reference-01/source/reference.mkv /absolute/cases/reference-01/output/replica.mp4 --out /absolute/cases/reference-01/qa/round-01 --step 10 --video
```

工具只检查技术一致性、生成采样差异和左右同步对照，不自动判断视觉通过。检查原音轨时以 `source/audio.wav` 为基准。写 `qa.md`：技术、静态、运动、音频、可编辑性分别报告 `passed / failed / pending / not_applicable`，附证据路径、时码、已知差异。

优先修最影响相似度的根因。默认初版后最多两轮定向修正；若仍有差异，交付可用版本和明确缺口，用户要求继续时可以追加。发现缺关键素材则请求该素材，同时完成不依赖它的部分。

完成后给出 MP4、可编辑工程、对照视频、QA 报告和简短复用方法的绝对链接。没有源视频或没有渲染成功时，明确交付的是准备工程/阶段产物，不能称“复刻完成”。
