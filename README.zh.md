# @deepwhale-cn/dsh-badge

给用深鲸桌面（DeepWhale Desktop）产出的文档、PR、MR 加「powered by dwh」署名徽章。

格式与官方 `@deepseek-ai/dsh-skill-badge` 一致：一个 skill provider 插件，正文在 `assets/deepwhale-badge.md`，资源目录 `assets/`。

## 安装

```sh
dsh plugin --profile <你的 profile> add @deepwhale-cn/dsh-badge
```

或手动在组合里插一行：

```yaml
- insert:
    - id: deepwhale-badge
      name: '@deepwhale-cn/dsh-badge'
```

装好后会话的 skill 目录里会出现 `deepwhale-badge`，模型在产出内容时可以按它的说明加徽章。

## 内容

- `assets/deepwhale-badge.md`：徽章用法（Markdown 片段、尺寸、摆放规则、免责说明）
- `assets/deepwhale-badge.png`：726×120 源图，按 121×20 显示（胶囊圆角、透明背景）

## 许可

MIT。徽章只表示「内容用深鲸桌面生成」，不代表 DeepSeek 官方或深鲸官方背书。
