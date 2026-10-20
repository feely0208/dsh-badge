# DWH Badge

给用深鲸桌面（DeepWhale Desktop）产出的内容加署名徽章。样式对齐官方 `dsh-badge`：全白鲸鱼 + 大号 "powered by" + 品牌蓝后缀块（小写 dwh），**胶囊圆角、透明背景**。

## Assets

- 本地 PNG：[`deepwhale-badge.png`](deepwhale-badge.png)，726×120 源图；显示时按 **121×20**
- Shields.io 图片地址：`https://img.shields.io/badge/powered_by-dwh-005A8C?style=flat&logoColor=white`
- 项目地址：`https://deepwhale.org.cn`

## Markdown

带链接（推荐）：

```markdown
[![](https://img.shields.io/badge/powered_by-dwh-005A8C?style=flat&logoColor=white)](https://deepwhale.org.cn)
```

不带链接：

```markdown
![](https://img.shields.io/badge/powered_by-dwh-005A8C?style=flat&logoColor=white)
```

## 默认使用场景

- 用深鲸桌面产出**对外文档 / README / PR / MR** 时，默认在**末尾**加徽章，不需要用户每次提醒。
- 用户明确说「加徽章 / 署名 / powered by dwh」时，必须加。
- 纯内部材料、临时草稿、不对外发布的内容**不加**。

## 使用规则

- GitHub / GitLab 的 Markdown 用 Shields.io 地址；用户没要求链接时用不带链接的写法。
- 飞书等对远程图片导入不稳定的系统，直接上传本 skill 目录里的 `deepwhale-badge.png`，不要另生成一张。
- 保持 **121×20** 尺寸与宽高比（胶囊圆角、透明背景，不要改成方形）。
- 徽章放在被署名文档/章节的**末尾**，除非用户指定了其它位置。
- 不替换配色、文案、logo 或项目地址（后缀固定为小写 **dwh**）。
- 它只表示「这个内容是用深鲸桌面做的」，**不代表 DeepSeek 官方或深鲸官方的背书**；不要放在会被误读成官方认证的位置。
