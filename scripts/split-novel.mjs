import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.resolve(
  projectRoot,
  process.argv[2] ?? 'corpus/source/蛊真人.txt',
)
const corpusDir = path.join(projectRoot, 'corpus')
const chaptersDir = path.join(corpusDir, 'chapters')
const indexPath = path.join(corpusDir, 'index.json')
const manifestPath = path.join(chaptersDir, '.generated-manifest.json')

const chineseNumber = '[零一二三四五六七八九十百千万两0-9]+'
const volumePattern = new RegExp(`^第${chineseNumber}卷(?:\\s.*)?$`)
const sectionPattern = new RegExp(`^第${chineseNumber}节[：:].*$`)
const appendixPattern = new RegExp(`^第${chineseNumber}章[^，,。）、)].+$`)

function trimBlankLines(lines) {
  let start = 0
  let end = lines.length

  while (start < end && lines[start].trim() === '') start += 1
  while (end > start && lines[end - 1].trim() === '') end -= 1

  return lines.slice(start, end)
}

function safeFilename(title) {
  const withoutOrdinal = title.replace(
    new RegExp(`^第${chineseNumber}(?:节[：:]?|章)`),
    '',
  )
  const cleaned = withoutOrdinal
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()

  return Array.from(cleaned || '未命名').slice(0, 60).join('')
}

async function writeIfChanged(filePath, content) {
  try {
    if ((await readFile(filePath, 'utf8')) === content) return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  await writeFile(filePath, content, 'utf8')
}

async function removeStaleGeneratedChapterFiles(expectedFiles) {
  const entries = await readdir(chaptersDir, { withFileTypes: true })

  for (const entry of entries) {
    if (
      entry.isFile() &&
      /^\d{4}-.+\.md$/u.test(entry.name) &&
      !expectedFiles.has(entry.name)
    ) {
      await unlink(path.join(chaptersDir, entry.name))
    }
  }
}

const sourceBuffer = await readFile(sourcePath)
const normalizedText = sourceBuffer
  .toString('utf8')
  .replace(/^\uFEFF/, '')
  .replace(/\r\n?/g, '\n')
const lines = normalizedText.split('\n')
const lastSectionIndex = lines.findLastIndex((line) =>
  sectionPattern.test(line.trim()),
)

if (lastSectionIndex === -1) {
  throw new Error('没有识别到“第…节：标题”格式的章节。')
}

const firstVolumeIndex = lines.findIndex((line) =>
  volumePattern.test(line.trim()),
)
const prefaceLines = trimBlankLines(
  lines.slice(0, firstVolumeIndex === -1 ? 0 : firstVolumeIndex),
)
const volumes = []
const chapters = []
let currentVolume = null
let currentChapter = null
let volumePreamble = []

function finishChapter(endLine) {
  if (!currentChapter) return

  currentChapter.endLine = endLine
  currentChapter.body = trimBlankLines(currentChapter.body)

  if (/[：:]$/.test(currentChapter.title) && currentChapter.body.length > 0) {
    currentChapter.title += currentChapter.body.shift().trim()
    currentChapter.body = trimBlankLines(currentChapter.body)
  }

  chapters.push(currentChapter)
  currentChapter = null
}

function finishVolumePreamble() {
  if (!currentVolume || volumePreamble.length === 0) return

  currentVolume.subtitle =
    trimBlankLines(volumePreamble).find((line) => line.trim())?.trim() ?? ''
  volumePreamble = []
}

for (let index = Math.max(firstVolumeIndex, 0); index < lines.length; index += 1) {
  const rawLine = lines[index]
  const line = rawLine.trim()
  const isVolume = volumePattern.test(line)
  const isSection = sectionPattern.test(line)
  const isAppendix = index > lastSectionIndex && appendixPattern.test(line)

  if (isVolume) {
    finishChapter(index)
    finishVolumePreamble()
    currentVolume = {
      id: volumes.length + 1,
      title: line,
      subtitle: '',
      sourceLine: index + 1,
    }
    volumes.push(currentVolume)
    continue
  }

  if (isSection || isAppendix) {
    finishChapter(index)
    finishVolumePreamble()
    currentChapter = {
      id: chapters.length + 1,
      title: line,
      volumeId: currentVolume?.id ?? null,
      startLine: index + 1,
      endLine: null,
      body: [],
    }
    continue
  }

  if (currentChapter) {
    currentChapter.body.push(rawLine)
  } else if (currentVolume) {
    volumePreamble.push(rawLine)
  }
}

finishChapter(lines.length)
finishVolumePreamble()

if (chapters.length === 0) {
  throw new Error('章节解析结果为空。')
}

await mkdir(chaptersDir, { recursive: true })

const generatedFiles = []
let preface = null

if (prefaceLines.length > 0) {
  const filename = '0000-序言与简介.md'
  await writeIfChanged(
    path.join(chaptersDir, filename),
    `# 序言与简介\n\n${prefaceLines.join('\n')}\n`,
  )
  generatedFiles.push(filename)
  preface = {
    title: '序言与简介',
    file: `chapters/${filename}`,
    source: { startLine: 1, endLine: firstVolumeIndex },
    characters: prefaceLines.join('\n').length,
  }
}

const chapterIndex = []

for (const chapter of chapters) {
  const number = String(chapter.id).padStart(4, '0')
  const filename = `${number}-${safeFilename(chapter.title)}.md`
  const body = chapter.body.join('\n')
  await writeIfChanged(
    path.join(chaptersDir, filename),
    `# ${chapter.title}\n\n${body}\n`,
  )
  generatedFiles.push(filename)
  chapterIndex.push({
    id: chapter.id,
    title: chapter.title,
    volumeId: chapter.volumeId,
    file: `chapters/${filename}`,
    source: { startLine: chapter.startLine, endLine: chapter.endLine },
    characters: body.length,
  })
}

for (const volume of volumes) {
  const ids = chapterIndex
    .filter((chapter) => chapter.volumeId === volume.id)
    .map((chapter) => chapter.id)
  volume.chapterStart = ids.at(0) ?? null
  volume.chapterEnd = ids.at(-1) ?? null
  volume.chapterCount = ids.length
}

const index = {
  source: path.relative(projectRoot, sourcePath),
  encoding: 'UTF-8',
  lineEndings: 'LF in generated files',
  chapterCount: chapterIndex.length,
  preface,
  volumes,
  chapters: chapterIndex,
}

await writeIfChanged(indexPath, `${JSON.stringify(index, null, 2)}\n`)
await writeIfChanged(
  manifestPath,
  `${JSON.stringify(generatedFiles, null, 2)}\n`,
)
await removeStaleGeneratedChapterFiles(new Set(generatedFiles))

const chapterFilesOnDisk = (await readdir(chaptersDir)).filter((filename) =>
  filename.endsWith('.md'),
)

console.log(`已生成 ${chapterIndex.length} 章和 ${preface ? 1 : 0} 个序言文件。`)
console.log(`章节目录：${path.relative(projectRoot, chaptersDir)}`)
console.log(`索引文件：${path.relative(projectRoot, indexPath)}`)
console.log(`当前 Markdown 文件数：${chapterFilesOnDisk.length}`)
