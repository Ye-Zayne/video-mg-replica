# 视频 / MG 动画复刻 Skill

从参考视频逐帧取证，复刻为可编辑的 Remotion 视频或 MG 动画，包含工作流程、实用脚本、工程模板、测试、完整案例素材与成片。

## 获取完整项目

本仓库使用 **Git LFS** 保存视频、音频、图片和压缩包。完整项目约 3.1 GiB，请安装 Git LFS 后克隆：

```bash
git lfs install
git clone https://github.com/Ye-Zayne/video-mg-replica.git
cd video-mg-replica
git lfs pull
```

仅查看 Skill 和代码、暂不下载素材：

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/Ye-Zayne/video-mg-replica.git
```

## 内容

- `video-mg-replica/`：Skill、参考规范、Python 工具和 Remotion 模板。
- `examples/mg-demo/`：自制 MG 示例、渲染结果和验证素材。
- `cases/`：参考素材、取证帧、可编辑工程、修订版本及输出成片。
- `tests/`：工具测试。
- [使用说明](使用说明.md)：调用方式、安装与依赖。
- [参考与实现说明](参考与实现说明.md)：设计依据与实现说明。
- [验证记录](验证记录.md)：已有验证结果和局限。

安装 Skill 时，将 `video-mg-replica/` 文件夹复制到 `~/.codex/skills/`，再在新任务中调用 `$video-mg-replica`。依赖目录 `node_modules/`、本地运行时 `.runtime/` 和缓存不纳入仓库，使用前按说明安装依赖。

案例和验证记录保留各自的制作状态；渲染成功不代表与参考视频完全一致。
