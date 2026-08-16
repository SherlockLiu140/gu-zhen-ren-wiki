import React, { useMemo, useState } from "react";
import { Search, BookOpen, Users, Bug, Sword, Map, Landmark, Sparkles, Network, ChevronRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const DATA = {
  characters: [
    {
      id: "fang-yuan",
      name: "方源",
      aliases: ["古月方源", "柳贯一", "武遗海", "算不尽", "大爱仙尊"],
      race: "人族 / 天外之魔",
      faction: "早期古月山寨，后多次转换身份与阵营",
      level: "蛊师至蛊仙，后期尊者级布局者",
      tags: ["主角", "重生", "炼道", "智道", "宙道", "魔道"],
      summary:
        "全书核心人物。性格极端理性，目标指向永生，常以利益、局势和长远布局作为行动准则。其经历贯穿青茅山、三王山、狐仙福地、北原王庭、义天山、至尊仙窍、宿命大战等重要阶段。",
      related: ["春秋蝉", "定仙游", "万我", "见面曾相识", "逆流护身印", "天庭", "影宗"],
    },
    {
      id: "bai-ning-bing",
      name: "白凝冰",
      aliases: ["北冥冰魄体"],
      race: "人族",
      faction: "古月山寨相关，后与方源多次合作与对立",
      level: "蛊师 / 后续多阶段成长",
      tags: ["北冥冰魄体", "青茅山", "重要同伴/对手"],
      summary:
        "早期极具代表性的人物之一，天资卓绝，性格冷酷而求变。与方源在青茅山及后续阶段形成复杂的合作、利用与博弈关系。",
      related: ["方源", "青茅山", "白相传承"],
    },
    {
      id: "hei-lou-lan",
      name: "黑楼兰",
      aliases: [],
      race: "人族",
      faction: "北原黑家相关",
      level: "蛊师至蛊仙",
      tags: ["北原", "力道", "合作关系"],
      summary:
        "北原篇的重要人物，与王庭福地、北原势力格局和方源后续合作有关。其成长线与力道、复仇、家族矛盾等主题紧密相连。",
      related: ["王庭福地", "北原", "方源"],
    },
    {
      id: "feng-jiu-ge",
      name: "凤九歌",
      aliases: [],
      race: "人族",
      faction: "中洲十大古派 / 灵缘斋相关",
      level: "八转级强者，尊者之下极强战力代表之一",
      tags: ["音道", "中洲", "强者", "凤金煌之父"],
      summary:
        "中洲极具代表性的强者，以音道战力著称。其人物形象兼具豪情、才情和复杂立场，是中洲篇、宿命相关剧情的重要角色。",
      related: ["凤金煌", "中洲", "天庭", "宿命大战"],
    },
    {
      id: "spectral-soul",
      name: "幽魂魔尊",
      aliases: ["幽魂"],
      race: "人族",
      faction: "影宗核心源头",
      level: "九转尊者",
      tags: ["魂道", "尊者", "影宗", "布局"],
      summary:
        "历史尊者之一，以魂道成尊，与影宗、至尊仙胎蛊等重大布局密切相关。其遗留布局深刻影响后期主线。",
      related: ["影宗", "至尊仙胎蛊", "魂道", "义天山大战"],
    },
  ],
  gu: [
    {
      id: "spring-autumn-cicada",
      name: "春秋蝉",
      rank: "仙蛊，品阶随剧情状态变化",
      path: "宙道",
      type: "重生类 / 时间类",
      users: ["方源"],
      summary:
        "方源早期最核心的底牌之一，具有重生回到过去的能力，但并非无风险手段。它既推动开篇重生，也长期影响方源的命运、气运与布局。",
      related: ["方源", "宙道", "重生", "青茅山"],
    },
    {
      id: "fixed-immortal-travel",
      name: "定仙游",
      rank: "仙蛊",
      path: "宇道",
      type: "空间移动类",
      users: ["方源"],
      summary:
        "极具战略价值的宇道仙蛊，能够进行远距离空间移动。对逃遁、转移、跨域布局具有重要意义。",
      related: ["方源", "宇道", "狐仙福地"],
    },
    {
      id: "attitude-gu",
      name: "态度蛊",
      rank: "仙蛊",
      path: "情道 / 智道相关理解",
      type: "伪装与态度影响类",
      users: ["方源"],
      summary:
        "与身份伪装、态度表达和相关杀招构成有关，在方源假扮身份和应对强者审视时具有重要作用。",
      related: ["见面曾相识", "方源", "伪装身份"],
    },
    {
      id: "wisdom-gu",
      name: "智慧蛊",
      rank: "九转仙蛊",
      path: "智道",
      type: "智慧光晕 / 推演辅助",
      users: ["方源曾长期借助其智慧光晕"],
      summary:
        "智道体系中极具代表性的九转仙蛊。方源曾借助智慧光晕进行大量推演和杀招改良，但使用条件与代价并不简单。",
      related: ["方源", "智道", "推演", "狐仙福地"],
    },
    {
      id: "perseverance-gu",
      name: "毅力蛊",
      rank: "凡蛊 / 关键概念性蛊虫",
      path: "人道倾向 / 意志相关",
      type: "意志与坚持相关",
      users: ["方源"],
      summary:
        "与方源渡过逆流河、形成逆流护身印等剧情节点密切相关。它象征意志、坚持和逆境中的不屈。",
      related: ["逆流河", "逆流护身印", "方源"],
    },
  ],
  moves: [
    {
      id: "myriad-self",
      name: "万我",
      category: "仙道杀招 / 复合杀招",
      path: "力道、奴道等复合理解",
      core: ["自我力量体系", "群体化分身/虚影思路"],
      user: "方源",
      effect: "形成大量自我虚影或战斗单位，用于正面战斗、牵制、消耗与战术展开。",
      related: ["方源", "力道", "奴道"],
    },
    {
      id: "familiar-face",
      name: "见面曾相识",
      category: "仙道杀招 / 伪装类杀招",
      path: "变化道、智道、情道等相关",
      core: ["态度蛊", "伪装身份体系"],
      user: "方源",
      effect: "用于高层次身份伪装和气息欺瞒，是方源多次潜入、伪装和布局的重要手段。",
      related: ["态度蛊", "方源", "武遗海", "身份伪装"],
    },
    {
      id: "reverse-flow-protection-seal",
      name: "逆流护身印",
      category: "仙道杀招 / 防御反弹类",
      path: "复合体系，核心依托逆流河",
      core: ["逆流河", "毅力蛊", "方源自身道痕与推演"],
      user: "方源",
      effect: "强大的防御与反弹手段，能够将外来攻势逆流反弹，是方源八转层级的重要保命杀招。",
      related: ["逆流河", "毅力蛊", "方源"],
    },
  ],
  factions: [
    {
      id: "heavenly-court",
      name: "天庭",
      region: "中洲",
      type: "人族正道最高层级势力之一",
      summary:
        "维护人族正统和宿命体系的核心势力，与宿命蛊、星宿布局、龙公、紫薇仙子等人物及后期大战密切相关。",
      related: ["中洲", "宿命蛊", "龙公", "紫薇仙子", "方源"],
    },
    {
      id: "shadow-sect",
      name: "影宗",
      region: "多域布局",
      type: "幽魂魔尊相关遗留势力",
      summary:
        "由幽魂魔尊布局延伸出的重要势力，与至尊仙胎蛊、义天山大战、后期多方博弈密切相关。",
      related: ["幽魂魔尊", "至尊仙胎蛊", "义天山大战", "方源"],
    },
    {
      id: "lang-ya-sect",
      name: "琅琊派 / 琅琊福地",
      region: "特殊福地",
      type: "毛民与炼道相关势力",
      summary:
        "以炼道、毛民和福地经营为核心的重要势力，与方源的炼道资源、交易、合作和后续冲突相关。",
      related: ["毛民", "炼道", "方源", "琅琊地灵"],
    },
  ],
  locations: [
    {
      id: "qing-mao-mountain",
      name: "青茅山",
      region: "南疆",
      type: "早期地域 / 山寨势力聚集地",
      summary:
        "小说早期核心舞台，古月山寨、白家寨、熊家寨等矛盾展开之地，也是方源重生后重新踏上修行道路的起点。",
      related: ["方源", "白凝冰", "古月山寨", "春秋蝉"],
    },
    {
      id: "northern-plains",
      name: "北原",
      region: "五域之一",
      type: "大域",
      summary:
        "五域之一，王庭福地、黑家、长生天等势力和事件的重要舞台，与方源多个阶段的成长和身份转换相关。",
      related: ["王庭福地", "黑楼兰", "长生天"],
    },
    {
      id: "reverse-flow-river",
      name: "逆流河",
      region: "特殊天地秘境相关",
      type: "天地秘境 / 关键资源",
      summary:
        "与方源形成逆流护身印关系密切的关键资源。逆流河本身具备独特规则和象征意义。",
      related: ["逆流护身印", "毅力蛊", "方源"],
    },
  ],
  races: [
    {
      id: "hairy-men",
      name: "毛民",
      type: "异人",
      specialty: "炼蛊、炼道相关天赋突出",
      summary:
        "异人种族之一，在炼蛊和炼道体系中地位突出。琅琊福地、琅琊派相关剧情与毛民密切相关。",
      related: ["琅琊派", "炼道", "琅琊福地"],
    },
    {
      id: "rockmen",
      name: "石人",
      type: "异人",
      specialty: "地底生存、土石环境相关",
      summary:
        "异人种族之一，常与地下环境、资源开采、异人生态相关设定相连。",
      related: ["异人", "福地经营"],
    },
  ],
  events: [
    {
      id: "qing-mao-rebirth",
      name: "青茅山重生",
      range: "开篇至早期阶段",
      location: "青茅山",
      summary:
        "方源借春秋蝉重生后回到少年时期，从古月山寨重新开始修行。该事件奠定全书主角目标、性格和叙事基调。",
      related: ["方源", "春秋蝉", "古月山寨", "白凝冰"],
    },
    {
      id: "three-kings-inheritance",
      name: "三王山传承",
      range: "早中期重要事件",
      location: "三王山",
      summary:
        "南疆阶段的重要传承事件，涉及多方争夺和方源的关键谋划，是方源修行与局势转折的重要节点。",
      related: ["方源", "白凝冰", "南疆"],
    },
    {
      id: "fate-war",
      name: "宿命大战",
      range: "后期主线重大事件",
      location: "中洲 / 天庭相关",
      summary:
        "围绕宿命蛊、天庭、人族正统、尊者布局和方源等多方力量展开的重大冲突，是后期世界格局变化的关键事件。",
      related: ["天庭", "宿命蛊", "方源", "凤九歌"],
    },
  ],
};

const CATEGORIES = [
  { key: "all", label: "全部", icon: BookOpen },
  { key: "characters", label: "人物", icon: Users },
  { key: "gu", label: "蛊虫", icon: Bug },
  { key: "moves", label: "杀招", icon: Sword },
  { key: "factions", label: "势力", icon: Landmark },
  { key: "locations", label: "地图", icon: Map },
  { key: "races", label: "种族", icon: Sparkles },
  { key: "events", label: "事件", icon: Network },
];

function flattenData() {
  const labelMap = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
  return Object.entries(DATA).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category, categoryLabel: labelMap[category] || category }))
  );
}

function getSubtitle(item) {
  if (item.category === "characters") return `${item.race || "未知种族"} · ${item.level || "境界待考"}`;
  if (item.category === "gu") return `${item.rank || "品阶待考"} · ${item.path || "流派待考"}`;
  if (item.category === "moves") return `${item.categoryLabel} · ${item.path || "流派待考"}`;
  if (item.category === "factions") return `${item.region || "地域待考"} · ${item.type || "势力类型待考"}`;
  if (item.category === "locations") return `${item.region || "地域待考"} · ${item.type || "地点类型待考"}`;
  if (item.category === "races") return `${item.type || "种族类型待考"} · ${item.specialty || "特长待考"}`;
  if (item.category === "events") return `${item.location || "地点待考"} · ${item.range || "章节范围待考"}`;
  return "";
}

function Badge({ children }) {
  return <span className="rounded-full border border-amber-300/20 bg-amber-200/10 px-2 py-1 text-xs text-amber-100">{children}</span>;
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200/15 bg-stone-950/60 p-4 shadow-lg shadow-black/20 backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-amber-100">{value}</p>
        </div>
        <Icon className="h-6 w-6 text-amber-300/80" />
      </div>
    </motion.div>
  );
}

function DetailPanel({ item, onSelectRelated }) {
  if (!item) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-amber-200/15 bg-stone-950/50 p-8 text-center text-stone-400">
        <div>
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-amber-300/50" />
          <p className="text-lg text-stone-200">选择一个条目查看详情</p>
          <p className="mt-2 text-sm">后续可以把每个条目扩展成独立 Wiki 页面，并接入章节来源与校对状态。</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-3xl border border-amber-200/15 bg-gradient-to-br from-stone-950 to-stone-900 p-6 shadow-2xl shadow-black/30"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge>{item.categoryLabel}</Badge>
            {item.status && <Badge>{item.status}</Badge>}
          </div>
          <h2 className="text-3xl font-bold tracking-wide text-amber-100">{item.name}</h2>
          <p className="mt-2 text-sm text-stone-400">{getSubtitle(item)}</p>
        </div>
      </div>

      {item.aliases?.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-amber-200">别名</h3>
          <div className="flex flex-wrap gap-2">{item.aliases.map((a) => <Badge key={a}>{a}</Badge>)}</div>
        </section>
      )}

      <section className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-amber-200">简介</h3>
        <p className="leading-8 text-stone-200">{item.summary || item.effect}</p>
      </section>

      {item.core && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-amber-200">核心构成</h3>
          <div className="flex flex-wrap gap-2">{item.core.map((x) => <Badge key={x}>{x}</Badge>)}</div>
        </section>
      )}

      {item.tags && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-amber-200">标签</h3>
          <div className="flex flex-wrap gap-2">{item.tags.map((x) => <Badge key={x}>{x}</Badge>)}</div>
        </section>
      )}

      {item.related?.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-amber-200">关联条目</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {item.related.map((r) => (
              <button
                key={r}
                onClick={() => onSelectRelated(r)}
                className="flex items-center justify-between rounded-xl border border-stone-700/70 bg-stone-900/70 px-3 py-2 text-left text-sm text-stone-200 transition hover:border-amber-300/40 hover:bg-amber-200/10"
              >
                <span>{r}</span>
                <ChevronRight className="h-4 w-4 text-stone-500" />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-200/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
          <p className="text-sm leading-6 text-stone-300">
            当前是种子资料版。涉及章节号、首次登场、品阶变化、杀招完整构成等细节，建议后续基于章节摘要或人工笔记逐条校对。
          </p>
        </div>
      </section>
    </motion.div>
  );
}

export default function GuZhenRenWikiPrototype() {
  const allItems = useMemo(() => flattenData(), []);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(allItems[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const text = JSON.stringify(item).toLowerCase();
      const queryMatch = !q || text.includes(q);
      return categoryMatch && queryMatch;
    });
  }, [allItems, category, query]);

  const stats = CATEGORIES.filter((c) => c.key !== "all").map((c) => ({
    ...c,
    value: DATA[c.key]?.length || 0,
  }));

  const handleSelectRelated = (name) => {
    const found = allItems.find((item) => item.name === name || item.aliases?.includes(name) || item.id === name);
    if (found) setSelected(found);
    else setQuery(name);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#3b2f1f,transparent_35%),linear-gradient(135deg,#0c0a09,#1c1917_45%,#0c0a09)] px-4 py-8 text-stone-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-3xl border border-amber-200/15 bg-stone-950/60 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-200/10 px-3 py-1 text-sm text-amber-100">
                <Sparkles className="h-4 w-4" /> 五域两天资料库 · Prototype
              </div>
              <h1 className="text-4xl font-bold tracking-wide text-amber-100 sm:text-5xl">蛊真人设定百科</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
                一个面向人物、蛊虫、杀招、地图、势力、种族和事件的结构化资料库原型。目标是做成类似游戏 Wiki 的可检索百科，并为后续 AI 问答和关系图谱打基础。
              </p>
            </div>
            <div className="rounded-2xl border border-stone-700/70 bg-stone-900/70 p-4 text-sm text-stone-300">
              <p className="font-semibold text-amber-100">当前版本</p>
              <p className="mt-1">种子数据 + 本地搜索 + 条目详情 + 关联跳转</p>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {stats.map((s) => <StatCard key={s.key} label={s.label} value={s.value} icon={s.icon} />)}
        </section>

        <main className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="rounded-3xl border border-amber-200/15 bg-stone-950/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索人物、蛊虫、杀招、地点……"
                className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-10 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/50"
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs transition ${
                      active
                        ? "border-amber-300/60 bg-amber-200/20 text-amber-100"
                        : "border-stone-700 bg-stone-900/60 text-stone-300 hover:border-amber-300/30"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {c.label}
                  </button>
                );
              })}
            </div>

            <div className="max-h-[680px] space-y-3 overflow-auto pr-1">
              {filtered.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => setSelected(item)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?.id === item.id
                      ? "border-amber-300/60 bg-amber-200/15"
                      : "border-stone-700/70 bg-stone-900/60 hover:border-amber-300/30 hover:bg-stone-900"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-stone-800 px-2 py-1 text-xs text-stone-300">{item.categoryLabel}</span>
                    <ChevronRight className="h-4 w-4 text-stone-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-100">{item.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-stone-400">{getSubtitle(item)}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-300">{item.summary || item.effect}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-stone-700 bg-stone-900/60 p-6 text-center text-sm text-stone-400">
                  当前没有匹配条目。后续可接入全文索引、章节摘要和向量检索。
                </div>
              )}
            </div>
          </aside>

          <section>
            <DetailPanel item={selected} onSelectRelated={handleSelectRelated} />

            <div className="mt-6 rounded-3xl border border-amber-200/15 bg-stone-950/50 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-100">
                <Network className="h-5 w-5" /> 下一步可扩展模块
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "为每个条目增加首次登场章节、出处章节、校对状态",
                  "加入蛊虫 → 杀招 → 使用者 → 事件的关系图谱",
                  "把 Markdown / YAML 数据目录接入 Next.js 页面生成",
                  "增加 AI 问答：只基于资料库内容回答，避免胡编",
                  "建立章节摘要抽取流程，自动识别人物、蛊虫、地点、事件",
                  "加入五域两天地图页，按地域浏览势力和事件",
                ].map((x) => (
                  <div key={x} className="rounded-2xl border border-stone-700/70 bg-stone-900/60 p-4 text-sm leading-6 text-stone-300">
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
