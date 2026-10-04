# 参与贡献

项目由 [Ye-Zayne](https://github.com/Ye-Zayne) 与 [jinny-wj](https://github.com/jinny-wj) 共同制作与维护。欢迎改进文档、工具、Remotion 组件和案例。

## 报告问题

在 [Issues](https://github.com/Ye-Zayne/video-mg-replica/issues) 中提供：

- 系统、Python、Node.js、FFmpeg 和相关 npm 依赖版本。
- 执行命令、预期结果、实际结果与必要的错误日志。
- 涉及视频差异时，标明时间码或帧号，并附可分享的对照图。
- 能复现问题的最小素材或工程；大文件无需直接塞进问题描述。

## 提交修改

1. 基于最新 `main` 创建分支；共同维护者也建议通过 Pull Request 审阅修改。
2. 说明具体问题、最终行为和验证结果。纯文档修改检查链接、命令与事实即可。
3. 修改 Remotion 工程时，在对应工程中执行 `npm ci` 和 `npm run typecheck`，渲染受影响的帧或片段。
4. 修改取证或拟合工具时，在依赖齐全的环境运行 `python -m unittest discover -s tests -v`，并补充与问题相关的验证。
5. 案例修订保留旧版与证据，优先放入 `revisions/`；在 QA 中记录修改范围和保留差异。

Python 工具测试需要 Pillow、完整 FFmpeg / ffprobe；可通过 `FFMPEG`、`FFPROBE` 指定路径。完整准备方式见 [README](README.md#快速开始)。

## 共同作者署名

本项目由 Zayne / Ye-Zayne 与 jinny-wj 共创。两人共同完成的修改，应在提交记录中保留实际参与者的署名；单独完成的修改按实际作者提交。

共同提交时，一人作为提交作者，另一人使用 `Co-authored-by` 尾行署名。邮箱需关联对应 GitHub 帐号，推荐使用帐号设置中提供的 `noreply` 邮箱，避免公开私人邮箱。以 jinny-wj 提交、Zayne 共同参与为例：

```text
完善 Zayne 与 jinny-wj 的共同作者署名

Co-authored-by: Ye-Zayne <Ye-Zayne@users.noreply.github.com>
```

提交到 `main` 后，可以在提交详情中查看共同作者。仓库名旁的头像表示仓库所有者；提交栏与 Contributors 表示提交参与者，和 README 中的项目共创介绍分别展示。

完整格式见 [GitHub 共同作者提交说明](https://docs.github.com/en/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors)。

## 素材与工程

- 大型图片、视频、音频和压缩包遵循仓库 `.gitattributes`，使用 Git LFS；README 的小预览图直接保存在 Git 中。
- 不提交 `node_modules`、`.runtime`、`.venv`、缓存、密钥或本机凭据。
- 记录参考素材来源、独立媒体层的使用方式和可编辑边界；提交前确认你有权分享相应内容。
- 将测量、观察、推测和未验证部分区分清楚。不得把直接播放原片标记为可编辑复刻，也不要仅凭误差指标宣称完全一致。

有关执行边界和敏感信息的说明，见 [SECURITY.md](SECURITY.md)。
