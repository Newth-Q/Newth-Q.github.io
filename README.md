# Qi 的个人网站

暖白与森林绿、宋体排版的静态个人网站。关于页为个人介绍、经历和奖项；文章、随想和项目仍保留明确标注的示例内容。

## 访问与维护

- 仓库：https://github.com/Newth-Q/Newth-Q.github.io
- 网站：https://newth-q.github.io/
- 发布方式：GitHub Pages 从 `main` 分支的根目录发布，`.nojekyll` 禁用 Jekyll 处理。
- 日常流程：本地修改 → 预览和测试 → 提交 → 推送到 `main` → 等待 Pages 更新。

本地保存或仅执行 commit 不会更新线上网站；push 会触发公开发布。该方式不需要服务器和在线后台，也不需要自定义 GitHub Actions 工作流。测试由本地执行，不会自动作为远程发布的前置条件。

## 本地预览与编辑

用 Proma 预览打开 `index.html`，或在本机浏览器直接打开。文件相对位置应保持不变，无需安装依赖。

| 修改内容 | 文件 |
| --- | --- |
| 文章、随想、项目示例 | `content.js` 中的 `SAMPLE` |
| 教育经历、学生工作、奖项 | `content.js` 中的 `PROFILE` |
| 关于页长文、首页介绍、页面结构 | `app.js` |
| 网站名称、页头、页尾 | `index.html` |
| 字体、配色、布局 | `styles.css` |
| 图标与公开图片 | `assets/` |

添加文章可复制 `articles` 中的现有结构；`id` 必须唯一，发布后尽量不变。`sections` 中每项的首个字符串是小标题，其余为段落。随想目前按数组位置生成链接，长期使用前建议改为稳定 ID。

当前没有网页编辑后台或 Markdown 自动导入。如需 Obsidian 写作，可后续增加本地静态构建，不必引入在线后台。

## 发布修改

在本地项目根目录执行：

```bash
node --check app.js
node --check content.js
node tests/smoke.cjs

git status --short
git diff

# 只添加打算公开的文件，不要盲目使用 git add .
git add index.html styles.css content.js app.js
# 修改图标或新增公开图片时，按需执行 git add assets/对应文件

git commit -m "Update website content"
git push origin main
```

若 Git 提示缺少认证，但本机 GitHub CLI 已授权，可以单次复用 GitHub CLI 的授权，不修改全局配置：

```bash
git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin main
```

也可以使用 GitHub Desktop：检查 Changes → Commit to main → Push origin。没有修改时不需要创建提交。

Agent 代为提交时按 Proma 规则追加 `Made-with: Proma` trailer；用户自行提交无需添加。

## Pages 设置与排错

仓库 Settings → Pages → Build and deployment：

- Source：Deploy from a branch
- Branch：main
- Folder：/ (root)

推送后在 Actions 查看 GitHub 自动生成的 Pages 部署记录。更新可能需要几分钟；成功后刷新网站，必要时强制刷新浏览器缓存。

首次尝试使用自定义 Actions 工作流，但当前 OAuth 授权不含 workflow 权限，因此改用分支发布，不扩大授权范围。本地预留的 `.github/workflows/pages.yml` 已被忽略，不上传、不参与发布。

## 新增图片与隐私边界

公开图片放在 `assets/`，使用 `assets/example.jpg` 这样的相对链接，兼容本地预览与当前根域名部署。

**仓库是公开的，Pages 也从仓库根目录发布。所有提交的文件均应视为公开，包括源码、README 和测试。** 不要提交私人笔记、草稿、账号凭据、个人配置或整个 Obsidian Vault。忽略规则不能保护已跟踪文件，也不能撤回既有公开历史。误提交密钥应立即撤销密钥，而不是仅删除文件。

图标对比稿 `generated-images/`、私人目录和会话资料不上传。新增文件前检查 `git status`，提交前检查 `git diff --cached`。

## 图标与功能

采用 B「琪字印」方向：`assets/qi-seal.svg` 为透明细框 SVG；页头内联同一矢量路径，通过 currentColor 随主题变色。`assets/favicon.svg` 为绿底反白图标。琪字使用本机 Songti SC Bold 单字轮廓，不附带字体文件，落地版不是生成稿的逐像素复刻。

现有功能包括首页、文章和项目详情、随想、关于页三标签、主题筛选、阅读目录、明暗主题与响应式样式。当前使用 hash 路由，尚无独立文章 HTML、RSS、sitemap 或完整 SEO；可后续升级为静态生成站点。

## 测试边界

`tests/smoke.cjs` 使用最小 DOM 替身验证路由、个人资料、标签状态和图标资源，不能替代真实浏览器测试。页面核心交互已在 Proma 浏览器检查，尚未完成真实手机设备兼容性测试。
