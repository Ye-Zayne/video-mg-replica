# 从参考动作生成可复用组件

本 skill 的制作单元是一个可验证的“动作片段”，可以只有路径描边，也可以是遮罩与文字共同作用。先从原片选有代表性的 1–3 秒完整动作，完成测量 → 实现 → 同帧对照，再把组件复用到其余场景。这个样板不替代全片范围，也不是等待用户审批的强制关卡。

## 拟合实测运动

把至少 5 个真实测量样本写入 JSON；例子只是格式，不是任何参考视频的测量：

```json
{
  "elementId": "headline",
  "property": "translateY",
  "units": "px",
  "samples": [
    {"frame": 0, "value": 100},
    {"frame": 4, "value": 49},
    {"frame": 8, "value": 19},
    {"frame": 12, "value": 5},
    {"frame": 18, "value": 0}
  ]
}
```

```bash
python3 "$SKILL_DIR/scripts/fit_motion.py" --input /absolute/measurements.json --output /absolute/fits/headline-y.json
```

脚本求一条 CSS cubic-bezier，报告像素/角度等原单位的误差及逐样本残差。用结果中的 `startFrame,endFrame,from,to,bezier` 调用模板 `tween()`。它只拟合数字，不看视频；测量来自看帧，不可把自己设计的数值当作取证。首尾需覆盖实际动作，firstVisible 不一定是实际起点；被遮挡部分不能声称精确还原。

每次再提取未用于拟合的中间帧验证。误差集中于过冲或停顿时，先查看是否有独立动作阶段；多个反向、循环、相同端值或复杂路径不适合单条曲线。x/y 可以分别拟合，但相对速度要一起核对；有几何轨迹证据时使用路径进度，将空间路径与速度曲线分开。误差小也只代表观测样本吻合。

## 组件配方

模板 `src/primitives.tsx` 提供四个独立实现的帧驱动组件：Wipe（定向遮罩）、DrawPath（路径描边）、StaggerText（按 grapheme 错峰）、MotionGroup（父组变换）。共用 `frame,start,end,curve`，无内部时钟；将拟合后的曲线直接传入。它们是制作积木，不是已经匹配任何参考的预设。文字复杂断行、动态羽化和多段反向仍需按证据扩展实现。

将验证过的动作以 `project/src/motions/<name>.tsx` 保存，配套 `recipes/<name>.json`：

- 来源案例、原片哈希、证据帧、测量单位。
- 组件入口、输入 props、起止帧、曲线参数、锚点/坐标系。
- 可替换的文字/形状/图片、默认字重与布局约束。
- 参考速度下的 still 与视频路径，替换测试路径。
- 未适配条件，比如长文案溢出、路径拓扑不同、字体缺失。

用实际验证过的案例增加配方，不提前虚构“几十种已验证模板”。组件复用仍需匹配新参考的时序与结构；不因已有同类动作就跳过测量。用户要求只复刻当前视频时，将配方保存在当前案例，不顺便建立全局库或发布到外部服务。
