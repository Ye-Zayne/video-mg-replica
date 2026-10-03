# Lovart 参考视频复刻工程

完整 596 帧，1280 × 720，24 fps，24.833 秒。使用自己编写的 Remotion、SVG 与本地取证脚本制作，没有使用参考 GitHub 项目的 skill 或实现。

## 运行

需要 Node.js 20+、npm、FFmpeg 和可供 Remotion 使用的 Chrome。FFmpeg 可通过 FFMPEG 环境变量指定。最终渲染脚本会无损保留视频码流，将原音轨从零时刻重新封装，避免本机首次渲染实测的 2048 个采样音频延迟。

```sh
npm ci
npm run studio
npm run typecheck
npm run render:final -- replica.mp4
```

本机 Chrome 可通过 `--browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` 指定。锁文件固定了本次实际使用的依赖。

## 编辑位置

- `src/Replica.tsx`：分场景逻辑、图层顺序、字幕、遮罩、标志和画幅。
- `src/config.ts`：时长、尺寸和帧率。当前时间轴按 24 fps 测量，修改 fps 时需要重定时全部帧数据。
- `src/captions.json`：每帧字幕边界；普通英文字幕是实时 SVG text。
- `public/replica-serif.ttf`：从用户参考视频测得的有限字形集。并非原字体文件；缺失字符会回退到系统字体，新增文案需要检查字形和排版。
- `src/geometry.json`：旋转字形、超大横移文字、HEAVY 挤压文字、白色膨胀字形和品牌图标的矢量状态。
- `src/vectors.json`：喷漆字、插画分色轮廓和 White 面板曲线。
- `src/guides.json`：可修改的参考线位置。
- `src/assets.json` 与 `public/assets/`：独立图片素材及每帧位置，可替换素材、改变图层顺序或重新定义运动。
- `public/audio.wav`：原音轨，保持原始时间关系。

## 传入参数

`motionEnabled: false` 配合 `stillFrame` 固定所有视觉层，便于静帧检查。
`words` 修改普通字幕，如 `{"light":"classic","plain":"black"}`；`title` 修改片尾 Just design.；`accent` 修改喷漆主色。
`assetOverrides` 将 `assets.json` 中的素材路径映射到新的 public 相对路径。`audioEnabled` 控制音轨。

实际验证用例见 `editability.props.json`。原片版式使用固定边界，长字符串会被横向压缩；换成长文案需要进一步调整边界和字距。

## 可编辑范围与近似部分

普通字幕是实时文字；特殊字形和喷漆文字是逐帧 SVG 轮廓，并非换一个字符串就能生成任意同款动画的字体系统。其颜色、路径、位置、帧状态可以修改。插画采用分色矢量轮廓，保留原片的动作状态。

椅子、玻璃、人物、珠宝、彩球、产品小图与蚂蚁是从原视频提取的独立媒体层；可以替换、移动和重排，但不是可任意旋转的 3D 模型。人物与椅子等处的边缘仍有抠像近似。白桦林是原照片背景，字幕遮挡区域使用邻近纹理补全；该区域与原片存在差异。

喷漆颗粒、细描边、部分 White 面板标注、普通字体细节、片尾字标与抗锯齿存在近似。未宣称像素级完全相同。工程没有将参考整帧或原视频作为最终播放层。
