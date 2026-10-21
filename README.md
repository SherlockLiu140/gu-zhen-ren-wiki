# 蛊真人 Wiki

基于 React 与 Vite 构建的《蛊真人》资料站。

## 本地开发

```bash
npm install
npm run dev
```

## 生成小说语料索引

将 UTF-8 编码的原始文本放在 `corpus/source/蛊真人.txt`，然后运行：

```bash
npm run corpus:build
```

该命令会：

- 将序言和正文按章生成到 `corpus/chapters/`；
- 生成可检索的 `corpus/index.json`；
- 规范化 BOM 和 CRLF，但不修改原始文本。

原始小说和拆分后的完整正文已被 `.gitignore` 排除，不会发布到公开仓库。转换脚本和轻量索引可以正常提交。
