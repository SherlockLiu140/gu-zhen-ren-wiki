import { useMemo, useState } from 'react'
import wiki from './data/wiki.json'

const CATEGORY_ICONS = {
  cultivation: '✦',
  characters: '人',
  gu: '蛊',
  locations: '图',
  factions: '门',
  guHouses: '屋',
}

const CATEGORIES = [
  { key: 'all', label: '全部', icon: '卷', count: wiki.entities.length },
  ...wiki.categories.map((category) => ({
    key: category.key,
    label: category.label,
    icon: CATEGORY_ICONS[category.key] ?? '卷',
    count: category.count,
  })),
]

const statusLabels = {
  'verified-volume-1': '第一卷已校对',
  draft: '待复核',
}

function getSubtitle(item) {
  const values = Object.values(item.attributes)
  return values.slice(0, 2).join(' · ') || '资料待补充'
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-amber-300/20 bg-amber-200/10 px-2 py-1 text-xs text-amber-100">
      {children}
    </span>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-amber-200/15 bg-stone-950/60 p-4 shadow-lg shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-amber-100">{value}</p>
        </div>
        <span className="text-xl font-semibold text-amber-300/80">{icon}</span>
      </div>
    </div>
  )
}

function DetailPanel({ item, entityById, onSelectRelated }) {
  if (!item) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-amber-200/15 bg-stone-950/50 p-8 text-center text-stone-400">
        <div>
          <span className="mx-auto mb-4 block text-4xl text-amber-300/50">卷</span>
          <p className="text-lg text-stone-200">选择一个条目查看详情</p>
        </div>
      </div>
    )
  }

  return (
    <article
      key={item.id}
      className="rounded-3xl border border-amber-200/15 bg-gradient-to-br from-stone-950 to-stone-900 p-6 shadow-2xl shadow-black/30"
    >
      <div className="mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{item.categoryLabel}</Badge>
          <Badge>{statusLabels[item.status] ?? item.status}</Badge>
        </div>
        <h2 className="text-3xl font-bold tracking-wide text-amber-100">{item.name}</h2>
        <p className="mt-2 text-sm text-stone-400">{getSubtitle(item)}</p>
      </div>

      {item.aliases.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-amber-200">别名</h3>
          <div className="flex flex-wrap gap-2">
            {item.aliases.map((alias) => <Badge key={alias}>{alias}</Badge>)}
          </div>
        </section>
      )}

      <section className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-amber-200">第一卷简介</h3>
        <p className="leading-8 text-stone-200">{item.summary}</p>
      </section>

      {Object.keys(item.attributes).length > 0 && (
        <section className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-amber-200">资料卡</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(item.attributes).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-stone-700/70 bg-stone-950/50 p-3">
                <dt className="text-xs text-stone-500">{label}</dt>
                <dd className="mt-1 text-sm leading-6 text-stone-200">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-amber-200">已核对事实</h3>
        <div className="space-y-3">
          {item.facts.map((fact) => (
            <div key={`${item.id}-${fact.text}`} className="rounded-2xl border border-stone-700/70 bg-stone-950/45 p-4">
              <p className="leading-7 text-stone-200">{fact.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fact.sourceChapters.map((chapter) => (
                  <span
                    key={chapter.id}
                    title={chapter.title}
                    className="rounded-full bg-stone-800 px-2 py-1 text-xs text-stone-400"
                  >
                    第 {chapter.id} 节
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {item.relations.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-amber-200">关联条目</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {item.relations.map((relation) => {
              const target = entityById.get(relation.target)
              return (
                <button
                  key={`${item.id}-${relation.target}-${relation.label}`}
                  onClick={() => onSelectRelated(relation.target)}
                  className="flex items-center justify-between rounded-xl border border-stone-700/70 bg-stone-900/70 px-3 py-3 text-left text-sm text-stone-200 transition hover:border-amber-300/40 hover:bg-amber-200/10"
                >
                  <span>
                    <span className="block text-amber-100">{target?.name ?? relation.target}</span>
                    <span className="mt-1 block text-xs text-stone-500">{relation.label}</span>
                  </span>
                  <span className="shrink-0 text-lg text-stone-500">›</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-200/5 p-4">
        <div className="flex gap-3">
          <span className="mt-0.5 shrink-0 text-amber-300">△</span>
          <p className="text-sm leading-6 text-stone-300">
            本条目只采用第一卷第 1–199 节内可核对的信息；后续身份、境界变化和剧情结局暂不纳入。
          </p>
        </div>
      </section>
    </article>
  )
}

export default function GuZhenRenWikiPrototype() {
  const allItems = wiki.entities
  const entityById = useMemo(
    () => new Map(allItems.map((item) => [item.id, item])),
    [allItems],
  )
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(allItems[0] ?? null)

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return allItems.filter((item) => {
      const categoryMatch = category === 'all' || item.category === category
      const queryMatch = !normalizedQuery || JSON.stringify(item).toLowerCase().includes(normalizedQuery)
      return categoryMatch && queryMatch
    })
  }, [allItems, category, query])

  const handleSelectRelated = (id) => {
    const found = entityById.get(id)
    if (found) {
      setSelected(found)
      setCategory('all')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#3b2f1f,transparent_35%),linear-gradient(135deg,#0c0a09,#1c1917_45%,#0c0a09)] px-4 py-8 text-stone-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-3xl border border-amber-200/15 bg-stone-950/60 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-200/10 px-3 py-1 text-sm text-amber-100">
                <span>✦</span> 第一批 · {wiki.scope.volumeTitle}《{wiki.scope.volumeSubtitle}》
              </div>
              <h1 className="text-4xl font-bold tracking-wide text-amber-100 sm:text-5xl">蛊真人设定百科</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
                以章节来源为依据的人物、修炼体系、蛊虫、地区与势力资料库。第一批覆盖第一卷第 {wiki.scope.chapterStart}–{wiki.scope.chapterEnd} 节，并为仙蛊屋等后续类别保留统一规范。
              </p>
            </div>
            <div className="rounded-2xl border border-stone-700/70 bg-stone-900/70 p-4 text-sm text-stone-300">
              <p className="font-semibold text-amber-100">当前数据状态</p>
              <p className="mt-1">{wiki.entities.length} 个种子条目 · 事实逐条附章节来源</p>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {CATEGORIES.map((item) => (
            <StatCard key={item.key} label={item.label} value={item.count} icon={item.icon} />
          ))}
        </section>

        <main className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="rounded-3xl border border-amber-200/15 bg-stone-950/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <div className="relative mb-4">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索名称、别名、事实或标签……"
                className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-10 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/50"
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {CATEGORIES.map((item) => {
                const active = category === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setCategory(item.key)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs transition ${
                      active
                        ? 'border-amber-300/60 bg-amber-200/20 text-amber-100'
                        : 'border-stone-700 bg-stone-900/60 text-stone-300 hover:border-amber-300/30'
                    }`}
                  >
                    <span>{item.icon}</span> {item.label} {item.count}
                  </button>
                )
              })}
            </div>

            <div className="max-h-[760px] space-y-3 overflow-auto pr-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?.id === item.id
                      ? 'border-amber-300/60 bg-amber-200/15'
                      : 'border-stone-700/70 bg-stone-900/60 hover:border-amber-300/30 hover:bg-stone-900'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-stone-800 px-2 py-1 text-xs text-stone-300">{item.categoryLabel}</span>
                    <span className="text-lg text-stone-500">›</span>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-100">{item.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-stone-400">{getSubtitle(item)}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-300">{item.summary}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-stone-700 bg-stone-900/60 p-6 text-center text-sm leading-6 text-stone-400">
                  {category === 'guHouses'
                    ? '第一卷未检索到可确认的仙蛊屋条目；类型规范已经保留。'
                    : '当前没有匹配条目。'}
                </div>
              )}
            </div>
          </aside>

          <section>
            <DetailPanel item={selected} entityById={entityById} onSelectRelated={handleSelectRelated} />

            <div className="mt-6 rounded-3xl border border-amber-200/15 bg-stone-950/50 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-100">
                <span>◎</span> 第一批覆盖情况
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {wiki.categories.map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-2xl border border-stone-700/70 bg-stone-900/60 p-4 text-sm text-stone-300">
                    <span>{item.label}</span>
                    <span className="font-semibold text-amber-100">{item.count} 条</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
