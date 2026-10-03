# 原片与取证

## 输入规范

`inspect` 只处理本地媒体，不抓取链接。保留原文件，输出目录必须不存在，防止覆盖既有案例。使用 `--start 2.5 --end 12.5` 表达左闭右开秒数范围；省略 end 为视频末尾。可选 `--fps 30000/1001`，默认沿用 ffprobe 的平均帧率。长片可先取一个代表片段验证工艺，但最终范围不能擅自缩短。

脚本对选定范围解码并转换为 CFR、方形像素的无损 FFV1 参考片，写 `source/reference.mkv`。若非方形像素则调整显示宽度，旋转按 FFmpeg 元数据自动应用。输出帧数按请求时长×fps 四舍五入，至多补不足一帧的尾帧；归一化前后时长、原始元数据和转换规则都写入 `case.json`。VFR、旋转、宽高比与颜色转换会影响和原始文件的像素比较，报告中不要混称“原始编码帧”。HDR/10-bit 要单独确认色彩管理，默认此工具不做 HDR 转 SDR。

`case.json` 内 timebase 的 `fpsNumerator/fpsDenominator` 是时间基准；工程使用两者之比。帧号从 0 开始，`[startFrame,endFrame)`，最后可见帧是 `frameCount-1`。参考时间 `f/fps`，对应请求源时间近似 `start+f/fps`；VFR 不能由这个公式声称恢复原始帧索引。要追溯原始采样，另用 ffprobe 导出原片逐帧 PTS。

## 抽帧

```bash
# 总览缩略图：仅用于定位，不据此判断小字或细线
python3 "$SKILL_DIR/scripts/video_tools.py" frames case/source/reference.mkv --out case/evidence/overview --step 15 --width 480
# 动作区域逐帧；end 不包含该帧；width=0 保留原分辨率
python3 "$SKILL_DIR/scripts/video_tools.py" frames case/source/reference.mkv --out case/evidence/action-01 --start-frame 30 --end-frame 48 --step 1 --width 0
```

文件名与 index.json 标注真实归一化帧号，联系表分页（每页 20 张）。抽帧不是 OCR 或动作识别；由代理实际查看图片。需要更密采样时选新目录，避免旧帧混入。可从声音听辨/可用转录工具获取文案，但只由字幕 OCR 不能推断配音内容。

## analysis.md 最小记录

- **范围**：来源、请求时码、归一化 fps/分辨率/帧数、保留/排除项、音频处理。
- **场景表**：scene ID、全局 `[start,end)`、落定帧、切换类型、source frame 路径。
- **元素表**：ID、scene/parent ID、类型、x/y/w/h（原片像素）、锚点、z 层、遮罩关系、颜色、文字/字体、素材路径、可替换项。
- **动作表**：element ID、属性、起止帧、端值、采样 `(frame,value)`、曲线、入场/落定/退出、证据路径。
- **来源和缺口**：事实标 `measured/observed`，推测标 `inferred` 并给高/中/低置信度；未见内容标 `unknown`。

切点候选可借 FFmpeg scene filter，但文字变化、推镜和渐变可能没有明显场景分数，最终靠逐段看图决定。两场过渡交叠属于同一全局时间线，不能用拼接重复时长。

字体先核对是否本机可用、字重、数字和中文轮廓、行距及换行。不确定时比较最多三个有依据的候选；不能伪称精确识别。素材缺失优先复用用户原素材，简单几何重建；生成图片只在用户接受近似时考虑，生成结果无法保证与原片相同。
