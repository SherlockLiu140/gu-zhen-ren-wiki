# 蛊真人 Wiki

[![CI](https://github.com/SherlockLiu140/gu-zhen-ren-wiki/actions/workflows/ci.yml/badge.svg)](https://github.com/SherlockLiu140/gu-zhen-ren-wiki/actions/workflows/ci.yml)

在线站点：<https://guzhenren-wiki.app.workbuddy.host/?sharecode=3TXARMUA23>

《蛊真人》的结构化设定资料库。前端是 React + Vite 的单页应用，数据是逐条标注出处的 JSON 实体，
构建脚本负责校验一致性并生成前端索引。

项目的核心约束只有一条：**任何事实都必须能追溯到具体章节**。所以每一条 `facts` 和 `relations`
都带 `sources`，构建时会拿它去 `corpus/index.json` 里核对章节是否存在、是否属于同一卷、是否超出
实体声明的范围。来源对不上，构建直接失败。

> 本项目为非官方读者整理，资料条目仅供学习研究使用。原著权利、内容性质与使用范围见 [NOTICE.md](NOTICE.md)。

## 当前进度

| 分类 | 条目数 |
| --- | ---: |
| 蛊虫 | 210 |
| 兽类 | 10 |
| 人物 | 25 |
| 修炼体系 | 5 |
| 地区 | 14 |
| 势力 | 7 |
| 仙蛊屋 | 0 |
| **合计** | **271** |

| 卷 | 节 | 条目数 |
| --- | --- | ---: |
| 第一卷《魔性不改》 | 1–199 | 210 |
| 第二卷《魔子出山》 | 200–405 | 61 |

语料层已切分全部 **6 卷 2343 章**，实体目前覆盖前两卷。第二卷仍在扩充——
`gu-house`（仙蛊屋）至今没有可确认的条目，因此保留为 0。

按卷统计的是 `scope.volume`，即「已核对到的最高卷」。跨卷人物只算在最新一卷，
所以第一卷是 210 而不是原始条数。

## 数据结构

数据分三层，每一层都能独立重建下一层：

```
corpus/source/蛊真人.txt     原始文本（不入库）
        │  npm run corpus:build
        ▼
corpus/chapters/*.md         按章拆分（不入库）
corpus/index.json            章节索引：标题、行号区间、字数、所属卷（入库）
        │  npm run wiki:build
        ▼
wiki/entities/**/*.json      单一实体，人工整理，权威数据源（入库）
wiki/index.json              全局索引（生成物，入库便于 diff）
src/data/wiki.json           前端读取的数据副本（生成物，与上面逐字节相同）
```

`wiki/index.json` 和 `src/data/wiki.json` 是同一份内容，后者只是给前端用。两者都由脚本生成，
**不要手改**——`npm run wiki:check` 会逐字节比对，改过就会报「已过期」。

### 实体字段

规范见 [`wiki/schema/entity.schema.json`](wiki/schema/entity.schema.json)。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `schemaVersion` | `1` | 当前固定为 1 |
| `id` | string | `{type}.{slug}`，如 `character.fang-yuan`、`gu.kuang-feng-gu` |
| `type` | string | `cultivation` / `character` / `gu` / `beast` / `location` / `faction` / `gu-house` |
| `name` | string | 正名 |
| `aliases` | string[] | 别名，不得重复 |
| `summary` | string | 一段话简介，用自己的话写 |
| `status` | string | `verified-volume-1` 或 `draft` |
| `scope` | object | `{ volume, maxChapter }`，声明本条目核对到哪 |
| `attributes` | object | 资料卡键值，值必须是字符串 |
| `facts` | object[] | 已核对事实，每条 `{ text, sources }`，**至少一条** |
| `relations` | object[] | 关联条目，每条 `{ target, label, sources }` |
| `tags` | string[] | 标签，不得重复 |
| `firstMention` | object | 首次提及章节 `{ chapterId }`，可选 |
| `firstAppearance` | object | 首次登场章节 `{ chapterId }`，可选 |

`scope.volume` 表示**已核对的最高卷**，不是「属于哪一卷」：`sources` 可以引用该卷以及更早各卷的章节。
所以同一个人物随剧情推进时，只需提高 `scope` 并追加事实，不必拆成多个条目。

### ID 约定

`id` 的 slug 部分一律使用**拼音**，例如：

```
gu.kuang-feng-gu         狂风蛊
gu.chun-qiu-chan         春秋蝉
beast.bi-yan-quan-wang   碧眼犬王
character.fang-yuan      方源
faction.gu-yue-clan      古月一族
```

蛊类实体的 name → slug 映射存放在 [`scripts/gu-slug-map.json`](scripts/gu-slug-map.json)，
审计脚本新增条目时会查这张表，缺映射会直接报错。

### 状态

- `verified-volume-1`：事实已在第一卷指定章节中逐条核对过；
- `draft`：尚未复核，**不应作为确定事实展示**。

## 命令

```bash
npm install
npm run dev          # 本地开发
npm run build        # 生产构建
npm run lint         # ESLint

npm run corpus:build # 原始文本 → corpus/chapters + corpus/index.json
npm run wiki:build   # 校验实体并重新生成 wiki/index.json 与 src/data/wiki.json
npm run wiki:check   # 只校验，不写文件；索引过期会失败
npm run wiki:audit:gu # 按审计表复核第一卷蛊虫，缺条目会补齐
```

`corpus:build` 需要先准备 `corpus/source/蛊真人.txt`（UTF-8）。原始文本和拆分后的正文都被
`.gitignore` 排除，不会进入仓库。

## 新增一个条目的步骤

1. 在 `wiki/entities/<type>/` 下新建 `<slug>.json`，按上面的字段填；
2. 每条 `facts` 都要给出 `sources`，章节号必须真实存在于 `corpus/index.json`；
3. `scope.maxChapter` 不小于你引用的最大章节号；
4. 运行 `npm run wiki:build` 生成索引（会有校验，出错会指出具体文件和字段）；
5. 运行 `npm run build` 确认前端能正常渲染。

`relations.target` 必须是已存在的实体 `id`，否则构建失败——这样不会留下悬空链接。

## 目录

```
corpus/          语料层：章节索引与说明（正文不入库）
scripts/         split-novel.mjs / build-wiki.mjs / audit-volume-1-gu.mjs
wiki/
  entities/      实体 JSON，按类型分目录
  schema/        实体规范
  audits/        审计报告（第一卷蛊虫专项）
src/             React 前端
```

## 许可

代码采用 MIT，见 [LICENSE](LICENSE)。`wiki/` 下的资料条目是对原著情节的转述，
其授权状态与使用限制见 [NOTICE.md](NOTICE.md)。
