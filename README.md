# Qi 的个人网站

灰白纸张、浅绿标题标记与宋体正文的静态个人网站。关于页包含个人介绍、经历、奖项与出版物；文章、随想与项目内容可在本地继续维护。

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
| 文章与随想、项目内容 | `content.js` 中的 `SAMPLE` |
| 教育经历、学生工作、奖项 | `content.js` 中的 `PROFILE` |
| 关于页长文、首页介绍、页面结构 | `app.js` |
| 网站名称、页头、页尾 | `index.html` |
| 基础内容样式 | `styles.css` |
| 阅读空间主题、响应式布局 | `design.css`（加载在基础样式之后） |
| 文章与随想双页/滚动阅读增强 | `reader.js` |
| 图标与公开图片 | `assets/` |

无小标题的全文使用 `paragraphs` 数组，作者可用 `author` 字段。添加文章可复制 `articles` 中的现有结构；`id` 必须唯一，发布后尽量不变。`sections` 中每项的首个字符串是小标题，其余为段落。随想使用固定 `id` 生成链接；新增时必须指定唯一且不变的 ID。既有数字链接由 `legacyIndex` 冻结映射，不能重排或复用该字段。迁移前已经漂移的更早链接无法仅凭数字自动恢复。

日期未知的旧笔记使用实际发布日期并设置 `dateKind: "published"`，页面仅显示“YYYY.MM.DD”，不带“发布于”前缀；不要猜测写作日期。`sourceNote` 用于阅读来源、引文核验情况及编辑说明。原始 Vault 文件不随网站上传。

当前没有网页编辑后台或 Markdown 自动导入。如需 Obsidian 写作，可后续增加本地静态构建，不必引入在线后台。

## 发布修改

在本地项目根目录执行：

```bash
node --check app.js
node --check content.js
node --check reader.js
node tests/smoke.cjs

git status --short
git diff

# 只添加打算公开的文件，不要盲目使用 git add .
git add index.html styles.css design.css content.js app.js reader.js
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

现有功能包括首页、文章和项目详情、随想、关于页四标签、文章阅读目录、明暗主题与响应式样式。当前使用 hash 路由，尚无独立文章 HTML、RSS、sitemap 或完整 SEO；可后续升级为静态生成站点。

## 测试边界

`tests/smoke.cjs` 使用最小 DOM 替身验证路由、个人资料、标签状态和图标资源，不能替代真实浏览器测试。页面核心交互已在 Proma 浏览器检查，尚未完成真实手机设备兼容性测试。

## 随想与阅读信息

文章和随想均取消分类标签、分组及筛选。数据中的 `category`、`topic`、`kind` 保留以免破坏原始资料，但不再生成分类UI；`topic: health` 仍用于必要的医疗提示。原 `#/notes/category/<topic>` 合法旧链接兼容展示全部随想；固定ID与数字别名不变。`book` 仅作为原始来源数据保留；首页、随想列表及详情均不显示书名副标题（2026.11.05用户要求），正文中出现的书名不删改。

随想按原数据顺序连续排列。首页及列表中超过220字符的内容显示摘要与“继续阅读”，完整展示的随想无底部按钮，标题仍可打开详情；详情保留全文。原写作日期未知时仍记录实际发布日期和 `dateKind: published`，所有日期只显示 YYYY.MM.DD。

文章列表及详情通过 `articleStats` 统一计算字数：仅统计正文段落，不包括标题、副标题、小节标题及界面文案；一个汉字计1字，一个英文/数字词计1个单位，标点与空白不计。阅读时长按每分钟300字向上取整，最少1分钟。原数据中的 `minutes` 保留但不再作为显示依据。

## 阅读空间设计（2026.11.05）

参考 polebug.com 的克制导航、灰白底色与书页式阅读，自行实现布局，不复制其代码、文字、头像或三维资源。首页的 `assets/reading-room.webp` 是原创 AI 书房场景的压缩网页版本，不代表真实居所；原始生成图保留在私人会话工作台，不随网站发布。

文章详情通过 `reader.js` 渐进增强：宽度超过760px默认双页，支持上一页/下一页、正文聚焦后的方向键与Home/End、章节目录和滚动模式切换。阅读模式保存在浏览器本地；窄屏自动使用完整滚动正文。关闭阅读增强仍可按原有文章结构阅读，不修改内容ID或正文。打印时使用完整滚动排版。

本轮核验：既有内容/路由冒烟测试通过；Proma浏览器实测首页浅深色、翻页/目录/末页；使用载入真实站点的1280px与390px iframe完成28个路由布局/全文一致性检查，包括10篇文章全文、末页可达与模式切换、关于页出版物标签。窄屏检查不是实体手机验收。

2026.11.05用户确认发布阅读空间改版。新增随想《精神劳动与体力劳动》，当前共10篇文章、55条随想；新增正文按用户提供的文字原样保留，日期为本次发布日期。

### 随想连续双栏阅读

随想页采用日期置顶、浅绿标题标记和正文摘要，宽屏从左栏连续流向右栏，底部整页切换；无分类目录。文章与随想的阅读模式分别保存在 `qi-reading-mode` 和 `qi-notes-reading-mode`，互不覆盖。窄屏采用单栏滚动。

2026.11.05 10:20更新：日期、阅读信息与按钮规则按用户要求精简。原文数据未改；本地冒烟测试覆盖全部内容日期、分类移除、54条随想条件链接及文章统计。浏览器确认54条标题均翻页可达，9条截断摘要具有继续阅读链接、45条完整内容无底部链接。本次展示规则随2026.11.05发布版本生效。
