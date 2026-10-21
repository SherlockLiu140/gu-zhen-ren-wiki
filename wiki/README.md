# Wiki 数据

`wiki/entities/` 是百科的权威结构化数据源；每个实体使用一个 JSON 文件，字段规范见 `wiki/schema/entity.schema.json`。

第一批数据只覆盖第一卷《魔性不改》已经核对的内容。事实采用转述，不复制大段原文；`sources` 中的数字对应 `corpus/index.json` 的章节 ID。

```bash
npm run wiki:build  # 校验实体并生成索引
npm run wiki:check  # 只校验，确认生成索引没有过期
```

生成结果：

- `wiki/index.json`：全局实体、分类和关系索引；
- `src/data/wiki.json`：供当前 React 前端读取的数据副本。

## 状态

- `verified-volume-1`：事实已在第一卷指定章节中核对；
- `draft`：尚需复核，不应作为确定事实展示。

仙蛊屋类型已经纳入规范。第一卷没有检索到“仙蛊屋”这一明确概念，因此第一批保持为零条目。
