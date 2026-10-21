import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entitiesRoot = path.join(projectRoot, 'wiki', 'entities')
const corpusIndexPath = path.join(projectRoot, 'corpus', 'index.json')
const outputs = [
  path.join(projectRoot, 'wiki', 'index.json'),
  path.join(projectRoot, 'src', 'data', 'wiki.json'),
]
const checkOnly = process.argv.includes('--check')

const typeConfig = {
  cultivation: { key: 'cultivation', label: '修炼体系' },
  character: { key: 'characters', label: '人物' },
  gu: { key: 'gu', label: '蛊虫' },
  location: { key: 'locations', label: '地区' },
  faction: { key: 'factions', label: '势力' },
  'gu-house': { key: 'guHouses', label: '仙蛊屋' },
}
const validTypes = new Set(Object.keys(typeConfig))
const statusPattern = /^(verified-volume-([1-9][0-9]*)|draft)$/
const idPattern = /^(cultivation|character|gu|location|faction|gu-house)\.[a-z0-9-]+$/

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return collectJsonFiles(entryPath)
      return entry.isFile() && entry.name.endsWith('.json') ? [entryPath] : []
    }),
  )
  return nested.flat().sort()
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function validateStringArray(value, label, file) {
  assert(Array.isArray(value), `${file}: ${label} 必须是数组`)
  assert(value.every((item) => typeof item === 'string' && item.trim()), `${file}: ${label} 包含无效值`)
  assert(new Set(value).size === value.length, `${file}: ${label} 包含重复值`)
}

function validateSources(sources, entity, chapterById, label, file) {
  assert(Array.isArray(sources) && sources.length > 0, `${file}: ${label}.sources 不能为空`)
  for (const chapterId of sources) {
    const chapter = chapterById.get(chapterId)
    assert(chapter, `${file}: ${label} 引用了不存在的章节 ${chapterId}`)
    assert(
      chapter.volumeId <= entity.scope.volume,
      `${file}: ${label} 引用了第 ${chapter.volumeId} 卷，超出已覆盖的第 ${entity.scope.volume} 卷`,
    )
    assert(chapterId <= entity.scope.maxChapter, `${file}: ${label} 引用了范围外的章节 ${chapterId}`)
  }
}

function validateEntity(entity, file, chapterById, volumesById) {
  assert(entity && typeof entity === 'object' && !Array.isArray(entity), `${file}: 根节点必须是对象`)
  assert(entity.schemaVersion === 1, `${file}: schemaVersion 必须为 1`)
  assert(typeof entity.id === 'string' && idPattern.test(entity.id), `${file}: id 格式无效`)
  assert(validTypes.has(entity.type), `${file}: type 无效`)
  assert(entity.id.startsWith(`${entity.type}.`), `${file}: id 前缀必须与 type 一致`)
  assert(typeof entity.name === 'string' && entity.name.trim(), `${file}: name 不能为空`)
  validateStringArray(entity.aliases, 'aliases', file)
  validateStringArray(entity.tags, 'tags', file)
  assert(typeof entity.summary === 'string' && entity.summary.trim(), `${file}: summary 不能为空`)
  assert(statusPattern.test(entity.status), `${file}: status 无效`)

  const volumeId = entity.scope?.volume
  const volume = volumesById.get(volumeId)
  assert(volume, `${file}: scope.volume ${volumeId} 在语料索引中不存在`)
  assert(
    Number.isInteger(entity.scope.maxChapter) &&
      entity.scope.maxChapter >= volume.chapterStart &&
      entity.scope.maxChapter <= volume.chapterEnd,
    `${file}: scope.maxChapter 必须落在第 ${volumeId} 卷的 ${volume.chapterStart}-${volume.chapterEnd} 之间`,
  )
  const statusVolume = statusPattern.exec(entity.status)?.[2]
  if (statusVolume) {
    assert(Number(statusVolume) === volumeId, `${file}: status 标注的卷号（${statusVolume}）与 scope.volume（${volumeId}）不一致`)
  }
  assert(entity.attributes && typeof entity.attributes === 'object' && !Array.isArray(entity.attributes), `${file}: attributes 必须是对象`)
  assert(Object.values(entity.attributes).every((value) => typeof value === 'string'), `${file}: attributes 的值必须是字符串`)
  assert(Array.isArray(entity.facts) && entity.facts.length > 0, `${file}: facts 不能为空`)
  assert(Array.isArray(entity.relations), `${file}: relations 必须是数组`)

  for (const [index, fact] of entity.facts.entries()) {
    assert(typeof fact.text === 'string' && fact.text.trim(), `${file}: facts[${index}].text 不能为空`)
    validateSources(fact.sources, entity, chapterById, `facts[${index}]`, file)
  }

  for (const [index, relation] of entity.relations.entries()) {
    assert(typeof relation.target === 'string' && relation.target.trim(), `${file}: relations[${index}].target 无效`)
    assert(typeof relation.label === 'string' && relation.label.trim(), `${file}: relations[${index}].label 无效`)
    validateSources(relation.sources, entity, chapterById, `relations[${index}]`, file)
  }

  for (const key of ['firstMention', 'firstAppearance']) {
    if (!entity[key]) continue
    validateSources([entity[key].chapterId], entity, chapterById, key, file)
  }
}

const corpusIndex = JSON.parse(await readFile(corpusIndexPath, 'utf8'))
const chapterById = new Map(corpusIndex.chapters.map((chapter) => [chapter.id, chapter]))
const volumesById = new Map(corpusIndex.volumes.map((volume) => [volume.id, volume]))
const entityFiles = await collectJsonFiles(entitiesRoot)
const entities = []

for (const file of entityFiles) {
  const entity = JSON.parse(await readFile(file, 'utf8'))
  validateEntity(entity, path.relative(projectRoot, file), chapterById, volumesById)
  entities.push(entity)
}

const entityById = new Map()
for (const entity of entities) {
  assert(!entityById.has(entity.id), `重复实体 ID：${entity.id}`)
  entityById.set(entity.id, entity)
}

for (const entity of entities) {
  for (const relation of entity.relations) {
    assert(entityById.has(relation.target), `${entity.id}: 关系目标不存在：${relation.target}`)
  }
}

entities.sort((left, right) => {
  const typeOrder = Object.keys(typeConfig)
  return typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type) || left.id.localeCompare(right.id)
})

const enrichedEntities = entities.map((entity) => ({
  ...entity,
  volume: entity.scope.volume,
  category: typeConfig[entity.type].key,
  categoryLabel: typeConfig[entity.type].label,
  facts: entity.facts.map((fact) => ({
    ...fact,
    sourceChapters: fact.sources.map((chapterId) => ({
      id: chapterId,
      title: chapterById.get(chapterId).title,
    })),
  })),
}))
const typeCounts = Object.fromEntries(
  Object.entries(typeConfig).map(([type, config]) => [
    config.key,
    entities.filter((entity) => entity.type === type).length,
  ]),
)
const result = {
  schemaVersion: 1,
  volumes: corpusIndex.volumes.map((volume) => ({
    id: volume.id,
    title: volume.title,
    subtitle: volume.subtitle,
    chapterStart: volume.chapterStart,
    chapterEnd: volume.chapterEnd,
    entityCount: entities.filter((entity) => entity.scope.volume === volume.id).length,
  })),
  categories: Object.entries(typeConfig).map(([type, config]) => ({
    type,
    ...config,
    count: typeCounts[config.key],
  })),
  typeCounts,
  entities: enrichedEntities,
}
const serialized = `${JSON.stringify(result, null, 2)}\n`

for (const output of outputs) {
  if (checkOnly) {
    let existing = ''
    try {
      existing = await readFile(output, 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    assert(existing === serialized, `${path.relative(projectRoot, output)} 已过期，请运行 npm run wiki:build`)
  } else {
    let existing = ''
    try {
      existing = await readFile(output, 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    if (existing !== serialized) await writeFile(output, serialized, 'utf8')
  }
}

console.log(`${checkOnly ? '已校验' : '已生成'} ${entities.length} 个实体。`)
console.log(Object.entries(typeCounts).map(([key, count]) => `${key}=${count}`).join('，'))
