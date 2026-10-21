# 小说语料

此目录用于本地保存和索引小说正文。

```text
corpus/
├── source/蛊真人.txt       # 原始 UTF-8 文本，不提交
├── chapters/*.md          # 自动生成的分章正文，不提交
├── chapters/.generated-manifest.json
└── index.json             # 自动生成的轻量章节索引，可提交
```

运行 `npm run corpus:build` 重新生成分章正文和索引。脚本只会清理章节目录中以四位编号开头的生成 Markdown 文件，不会删除其他命名方式的手工文件。
