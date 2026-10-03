# Remotion 工程与渲染

模板使用锁定版本的 Remotion/React；先复制 `assets/remotion/` 到案例 `project/`。已有工程先检查依赖，不重复初始化或升级。新工程有 lockfile 时 `npm ci`，否则 `npm install` 并保留生成的 lockfile。所有 @remotion/* 与 remotion 应同版本。

修改 `src/config.ts` 的画幅、fps 和帧数；将 `src/Replica.tsx` 中的空白入口换成实际组件。该模板不会自动识别视频。将可复用文案/颜色/图片放在 props，场景按照原片拆分；用 `<Sequence from={...} durationInFrames={...}>` 表达场景。父层 camera、mask 与字内部动画要独立管理。

模板 `motionEnabled=false` 使用 `stillFrame`；所有局部组件要消费同一个被控制的帧号。Sequence 场景须按全局 stillFrame 手动映射局部帧，避免只冻结外层却保留 Sequence 自身播放状态。复杂工程可为静帧创建独立 scene selection 入口。

图片和媒体使用 Remotion 的加载组件，字体采用本地文件并等待加载。素材应在 `public/` 内以 staticFile 引用。源视频、联系表和差异图留在工程外；独立实拍素材可复制进 public，但在 analysis.md 说明用途。通过工程引用检查和替换渲染共同验证可编辑性，单纯代码中存在 props 不够。

在 project 目录运行（初次渲染可能下载 Chrome，或显式传已安装的 `--browser-executable`）：

```bash
npm run typecheck
npm run studio
# motion-off.json: {"motionEnabled":false,"stillFrame":60}
npm run still -- ../evidence/layout-01.png --frame=60 --props=../motion-off.json --overwrite=false
npm run render -- ../output/replica-silent.mp4 --codec=h264 --image-format=png --overwrite=false
```

音频有两种实现：在 composition 中使用音频层；或完成画面后合并 `inspect` 生成的 `source/audio.wav`。不要重复叠加。使用后者时：

```bash
ffmpeg -n -i ../output/replica-silent.mp4 -i ../source/audio.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest ../output/replica.mp4
```

无音轨则直接以 replica.mp4 导出。H.264 yuv420p 需要偶数尺寸，若原片尺寸为奇数，应明确约定 padding/裁切，参考和复刻使用同一变换，不悄悄改变画幅。

导出时保留原 fps、尺寸、时间线，不用 `--scale` 的小图结果验收全分辨率。渲染的帧范围是闭区间，例如 0–29 为 30 帧；分析表采用半开区间，传 CLI 时减一。不要在并行渲染帧之间依赖可变全局状态。

接口依据：[Remotion render](https://www.remotion.dev/docs/cli/render)、[still](https://www.remotion.dev/docs/cli/still)、[Sequence](https://www.remotion.dev/docs/sequence)。命令不适配时先查已安装版本的 `--help`，不要靠更换引擎或忽略失败掩盖问题。

若用户已有 HyperFrames、AE 或其他工程，优先沿用其可编辑格式，并加载环境中实际可用的对应工具说明；不要假设未安装的 skill 一定存在。仅切换技术栈不能解决缺原素材的问题。
