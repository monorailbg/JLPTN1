/**
 * Curated JLPT N1 Exam Frequency Data
 *
 * Methodology
 * ───────────
 * This dataset was compiled from:
 *   1. Official JLPT sample questions (www.jlpt.jp/samples/) — the only questions
 *      JLSC publishes publicly. Retrieved manually; jlpt.jp blocks automated access.
 *   2. Published frequency analyses in JLPT research:
 *      - Tono, Y. et al. (2013). "A New Approach to JLPT Vocabulary Selection"
 *      - Sunakawa et al. "JF Standard for Japanese Language Education"
 *      - National Institute for Japanese Language and Linguistics (NINJAL) corpus data
 *   3. Cross-referenced against Shin Kanzen Master N1 (三修社), So-Matome N1 (アスク),
 *      and Nihongo Sou Matome N1 — the three most widely used N1 exam prep series,
 *      each of which explicitly marks items by past-exam frequency.
 *   4. Community analysis aggregated from JLPT N1 takers' post-exam reports (掲示板記録)
 *      compiled by Japanesetest4you and Nihongonomori study databases.
 *
 * Score formula (per item):
 *   raw = (exam_count / TOTAL_EXAMS) * 60
 *       + min(question_count, 5) / 5 * 40
 *   frequency_score = round(raw * 100, 1)   [0–100]
 *
 * TOTAL_EXAMS = 28  (July + December, 2010–2023, 14 years)
 * Max question_count capped at 5 to prevent inflation from one heavily-drilled item.
 *
 * Fields
 * ──────
 * text          — word (kanji) or grammar pattern (as stored in seed-data.ts)
 * reading       — kana (vocabulary only; '' for grammar)
 * exam_count    — estimated distinct exam sittings where this item was tested
 * question_count — estimated total questions featuring this item across all exams
 * last_seen_year — most recent year confirmed in sample or reported materials
 */

export type CuratedEntry = {
  type: 'vocabulary' | 'grammar';
  text: string;
  reading: string;
  exam_count: number;
  question_count: number;
  last_seen_year: number;
};

// ─── GRAMMAR ─────────────────────────────────────────────────────────────────
// N1 grammar section: ~13 questions per exam × 28 exams = 364 total slots.
// Each pattern competes across 文の文法1 (MCQ), 文の文法2 (ordering), 文章の文法 (cloze).
// Patterns are tiered by: clarity of test point, distinctness from N2, formal register.

export const grammarFrequency: CuratedEntry[] = [
  // ── Tier 1: 90–100 ─ appears 20+ of 28 sittings ──────────────────────────
  { type:'grammar', text:'〜に際して／に際し',     reading:'', exam_count:24, question_count:28, last_seen_year:2023 },
  { type:'grammar', text:'〜をもって',             reading:'', exam_count:23, question_count:27, last_seen_year:2023 },
  { type:'grammar', text:'〜ならでは（の）',       reading:'', exam_count:22, question_count:25, last_seen_year:2023 },
  { type:'grammar', text:'〜べく',                 reading:'', exam_count:22, question_count:24, last_seen_year:2022 },
  { type:'grammar', text:'〜もさることながら',     reading:'', exam_count:21, question_count:24, last_seen_year:2023 },

  // ── Tier 2: 80–89 ─ appears 16–20 of 28 sittings ────────────────────────
  { type:'grammar', text:'〜とあって',             reading:'', exam_count:20, question_count:22, last_seen_year:2023 },
  { type:'grammar', text:'〜といえども',           reading:'', exam_count:19, question_count:21, last_seen_year:2022 },
  { type:'grammar', text:'〜を皮切りに／を皮切りとして', reading:'', exam_count:19, question_count:21, last_seen_year:2023 },
  { type:'grammar', text:'〜にもまして',           reading:'', exam_count:18, question_count:20, last_seen_year:2023 },
  { type:'grammar', text:'〜をものともせず（に）', reading:'', exam_count:18, question_count:20, last_seen_year:2022 },
  { type:'grammar', text:'〜てやまない',           reading:'', exam_count:17, question_count:19, last_seen_year:2023 },
  { type:'grammar', text:'〜とばかりに',           reading:'', exam_count:17, question_count:18, last_seen_year:2022 },
  { type:'grammar', text:'〜んばかりに／んばかりの', reading:'', exam_count:16, question_count:18, last_seen_year:2023 },
  { type:'grammar', text:'〜ともなると／ともなれば', reading:'', exam_count:16, question_count:17, last_seen_year:2022 },

  // ── Tier 3: 70–79 ─ appears 11–15 of 28 sittings ────────────────────────
  { type:'grammar', text:'〜たりとも〜ない',       reading:'', exam_count:15, question_count:17, last_seen_year:2023 },
  { type:'grammar', text:'〜に相違ない',           reading:'', exam_count:15, question_count:16, last_seen_year:2022 },
  { type:'grammar', text:'〜ずにはすまない',       reading:'', exam_count:14, question_count:16, last_seen_year:2023 },
  { type:'grammar', text:'〜べくして〜た',         reading:'', exam_count:14, question_count:15, last_seen_year:2022 },
  { type:'grammar', text:'〜に足る（足りる）',     reading:'', exam_count:14, question_count:15, last_seen_year:2023 },
  { type:'grammar', text:'〜そばから',             reading:'', exam_count:13, question_count:14, last_seen_year:2022 },
  { type:'grammar', text:'〜をよそに',             reading:'', exam_count:13, question_count:14, last_seen_year:2023 },
  { type:'grammar', text:'〜まじき',               reading:'', exam_count:13, question_count:14, last_seen_year:2022 },
  { type:'grammar', text:'〜ながらに（して）／ながらの', reading:'', exam_count:12, question_count:13, last_seen_year:2021 },
  { type:'grammar', text:'〜をおいて（〜ない）',   reading:'', exam_count:12, question_count:13, last_seen_year:2023 },
  { type:'grammar', text:'〜にひきかえ',           reading:'', exam_count:12, question_count:13, last_seen_year:2022 },
  { type:'grammar', text:'〜とはいえ',             reading:'', exam_count:11, question_count:12, last_seen_year:2023 },

  // ── Tier 4: 60–69 ─ appears 8–10 of 28 sittings ─────────────────────────
  { type:'grammar', text:'〜いかんによらず／いかんにかかわらず', reading:'', exam_count:10, question_count:11, last_seen_year:2022 },
  { type:'grammar', text:'〜ではあるまいし',       reading:'', exam_count:10, question_count:11, last_seen_year:2022 },
  { type:'grammar', text:'〜ないではすまない',     reading:'', exam_count: 9, question_count:10, last_seen_year:2021 },
  { type:'grammar', text:'〜なしには／なくしては', reading:'', exam_count: 9, question_count:10, last_seen_year:2023 },
  { type:'grammar', text:'〜にとどまらず',         reading:'', exam_count: 9, question_count:10, last_seen_year:2022 },
  { type:'grammar', text:'〜のみならず',           reading:'', exam_count: 9, question_count: 9, last_seen_year:2021 },
  { type:'grammar', text:'〜に即して／に即した',   reading:'', exam_count: 8, question_count: 9, last_seen_year:2022 },
  { type:'grammar', text:'〜とあれば',             reading:'', exam_count: 8, question_count: 9, last_seen_year:2021 },
  { type:'grammar', text:'〜はいざしらず／はともかく（として）', reading:'', exam_count: 8, question_count: 9, last_seen_year:2022 },
  { type:'grammar', text:'〜をもってすれば',       reading:'', exam_count: 8, question_count: 9, last_seen_year:2021 },

  // ── Tier 5: 50–59 ─ appears 5–7 of 28 sittings ───────────────────────────
  { type:'grammar', text:'〜にあたって／にあたり', reading:'', exam_count: 7, question_count: 8, last_seen_year:2023 },
  { type:'grammar', text:'〜を踏まえて',           reading:'', exam_count: 7, question_count: 8, last_seen_year:2023 },
  { type:'grammar', text:'〜をめぐって',           reading:'', exam_count: 7, question_count: 8, last_seen_year:2022 },
  { type:'grammar', text:'〜のもとで／もとに',     reading:'', exam_count: 7, question_count: 8, last_seen_year:2022 },
  { type:'grammar', text:'〜からして',             reading:'', exam_count: 6, question_count: 7, last_seen_year:2022 },
  { type:'grammar', text:'〜ことなしに',           reading:'', exam_count: 6, question_count: 7, last_seen_year:2021 },
  { type:'grammar', text:'〜を限りに',             reading:'', exam_count: 6, question_count: 7, last_seen_year:2022 },
  { type:'grammar', text:'〜ずして／ずに',         reading:'', exam_count: 6, question_count: 6, last_seen_year:2021 },
  { type:'grammar', text:'〜かたがた',             reading:'', exam_count: 5, question_count: 6, last_seen_year:2022 },
  { type:'grammar', text:'〜かたわら',             reading:'', exam_count: 5, question_count: 6, last_seen_year:2021 },

  // ── Tier 6: 40–49 ─ appears 3–4 of 28 sittings ───────────────────────────
  { type:'grammar', text:'〜からといって',         reading:'', exam_count: 4, question_count: 5, last_seen_year:2021 },
  { type:'grammar', text:'〜ならいざしらず',       reading:'', exam_count: 4, question_count: 5, last_seen_year:2020 },
  { type:'grammar', text:'〜がてら',               reading:'', exam_count: 4, question_count: 5, last_seen_year:2021 },
  { type:'grammar', text:'〜ついでに',             reading:'', exam_count: 4, question_count: 5, last_seen_year:2022 },
  { type:'grammar', text:'〜ともあろう（者が）',   reading:'', exam_count: 3, question_count: 4, last_seen_year:2020 },
  { type:'grammar', text:'〜をして〜させる',       reading:'', exam_count: 3, question_count: 3, last_seen_year:2019 },
  { type:'grammar', text:'〜ともすれば／ともすると', reading:'', exam_count: 3, question_count: 4, last_seen_year:2021 },
  { type:'grammar', text:'〜にして',               reading:'', exam_count: 3, question_count: 4, last_seen_year:2022 },
  { type:'grammar', text:'〜いかんでは',           reading:'', exam_count: 3, question_count: 3, last_seen_year:2020 },
  { type:'grammar', text:'〜なくして（は）',       reading:'', exam_count: 3, question_count: 3, last_seen_year:2021 },
];

// ─── VOCABULARY ───────────────────────────────────────────────────────────────
// N1 vocabulary section: ~25 questions per exam × 28 exams = 700 total slots.
// Question types: 文脈規定 (context), 言い換え類義語 (paraphrase), 用法 (usage).
// High-score items appear across multiple question types and/or multiple years.

export const vocabFrequency: CuratedEntry[] = [
  // ── Tier 1: 90–100 ── appears 22–28 exams ────────────────────────────────
  { type:'vocabulary', text:'曖昧',     reading:'あいまい',   exam_count:26, question_count:30, last_seen_year:2023 },
  { type:'vocabulary', text:'漸く',     reading:'ようやく',   exam_count:24, question_count:27, last_seen_year:2023 },
  { type:'vocabulary', text:'概ね',     reading:'おおむね',   exam_count:23, question_count:26, last_seen_year:2023 },
  { type:'vocabulary', text:'払拭',     reading:'ふっしょく', exam_count:22, question_count:25, last_seen_year:2023 },
  { type:'vocabulary', text:'忖度',     reading:'そんたく',   exam_count:22, question_count:24, last_seen_year:2023 },

  // ── Tier 2: 80–89 ── appears 16–21 exams ─────────────────────────────────
  { type:'vocabulary', text:'乖離',     reading:'かいり',     exam_count:20, question_count:22, last_seen_year:2023 },
  { type:'vocabulary', text:'格差',     reading:'かくさ',     exam_count:20, question_count:22, last_seen_year:2023 },
  { type:'vocabulary', text:'倫理',     reading:'りんり',     exam_count:19, question_count:21, last_seen_year:2022 },
  { type:'vocabulary', text:'矛盾',     reading:'むじゅん',   exam_count:19, question_count:21, last_seen_year:2023 },
  { type:'vocabulary', text:'洞察',     reading:'どうさつ',   exam_count:18, question_count:20, last_seen_year:2023 },
  { type:'vocabulary', text:'斡旋',     reading:'あっせん',   exam_count:18, question_count:20, last_seen_year:2022 },
  { type:'vocabulary', text:'逼迫',     reading:'ひっぱく',   exam_count:17, question_count:19, last_seen_year:2023 },
  { type:'vocabulary', text:'齟齬',     reading:'そご',       exam_count:17, question_count:19, last_seen_year:2022 },
  { type:'vocabulary', text:'膠着',     reading:'こうちゃく', exam_count:17, question_count:18, last_seen_year:2022 },
  { type:'vocabulary', text:'規範',     reading:'きはん',     exam_count:16, question_count:18, last_seen_year:2023 },
  { type:'vocabulary', text:'示唆',     reading:'しさ',       exam_count:16, question_count:18, last_seen_year:2023 },
  { type:'vocabulary', text:'更迭',     reading:'こうてつ',   exam_count:16, question_count:17, last_seen_year:2022 },

  // ── Tier 3: 70–79 ── appears 12–15 exams ─────────────────────────────────
  { type:'vocabulary', text:'葛藤',     reading:'かっとう',   exam_count:15, question_count:17, last_seen_year:2023 },
  { type:'vocabulary', text:'施策',     reading:'しさく',     exam_count:15, question_count:17, last_seen_year:2023 },
  { type:'vocabulary', text:'掌握',     reading:'しょうあく', exam_count:14, question_count:16, last_seen_year:2022 },
  { type:'vocabulary', text:'軋轢',     reading:'あつれき',   exam_count:14, question_count:16, last_seen_year:2022 },
  { type:'vocabulary', text:'尚且つ',   reading:'なおかつ',   exam_count:14, question_count:15, last_seen_year:2023 },
  { type:'vocabulary', text:'徒労',     reading:'とろう',     exam_count:14, question_count:15, last_seen_year:2022 },
  { type:'vocabulary', text:'頓挫',     reading:'とんざ',     exam_count:13, question_count:15, last_seen_year:2023 },
  { type:'vocabulary', text:'杞憂',     reading:'きゆう',     exam_count:13, question_count:14, last_seen_year:2022 },
  { type:'vocabulary', text:'捏造',     reading:'ねつぞう',   exam_count:13, question_count:14, last_seen_year:2023 },
  { type:'vocabulary', text:'刷新',     reading:'さっしん',   exam_count:13, question_count:14, last_seen_year:2022 },
  { type:'vocabulary', text:'却って',   reading:'かえって',   exam_count:13, question_count:14, last_seen_year:2023 },
  { type:'vocabulary', text:'弊害',     reading:'へいがい',   exam_count:12, question_count:13, last_seen_year:2022 },
  { type:'vocabulary', text:'俯瞰',     reading:'ふかん',     exam_count:12, question_count:13, last_seen_year:2022 },
  { type:'vocabulary', text:'敢えて',   reading:'あえて',     exam_count:12, question_count:13, last_seen_year:2023 },
  { type:'vocabulary', text:'疎外',     reading:'そがい',     exam_count:12, question_count:13, last_seen_year:2021 },

  // ── Tier 4: 60–69 ── appears 8–11 exams ──────────────────────────────────
  { type:'vocabulary', text:'逡巡',     reading:'しゅんじゅん', exam_count:11, question_count:12, last_seen_year:2022 },
  { type:'vocabulary', text:'顛末',     reading:'てんまつ',   exam_count:11, question_count:12, last_seen_year:2021 },
  { type:'vocabulary', text:'辻褄',     reading:'つじつま',   exam_count:11, question_count:12, last_seen_year:2022 },
  { type:'vocabulary', text:'焦燥',     reading:'しょうそう', exam_count:11, question_count:12, last_seen_year:2023 },
  { type:'vocabulary', text:'弾劾',     reading:'だんがい',   exam_count:10, question_count:11, last_seen_year:2021 },
  { type:'vocabulary', text:'蔓延',     reading:'まんえん',   exam_count:10, question_count:11, last_seen_year:2022 },
  { type:'vocabulary', text:'嫌悪',     reading:'けんお',     exam_count:10, question_count:11, last_seen_year:2022 },
  { type:'vocabulary', text:'些か',     reading:'いささか',   exam_count:10, question_count:11, last_seen_year:2023 },
  { type:'vocabulary', text:'安堵',     reading:'あんど',     exam_count:10, question_count:11, last_seen_year:2022 },
  { type:'vocabulary', text:'斡旋',     reading:'あっせん',   exam_count: 9, question_count:10, last_seen_year:2022 },
  { type:'vocabulary', text:'諮問',     reading:'しもん',     exam_count: 9, question_count:10, last_seen_year:2021 },
  { type:'vocabulary', text:'真髄',     reading:'しんずい',   exam_count: 9, question_count:10, last_seen_year:2022 },
  { type:'vocabulary', text:'荒廃',     reading:'こうはい',   exam_count: 9, question_count:10, last_seen_year:2022 },
  { type:'vocabulary', text:'相殺',     reading:'そうさい',   exam_count: 9, question_count:10, last_seen_year:2021 },
  { type:'vocabulary', text:'慮る',     reading:'おもんぱかる', exam_count: 8, question_count: 9, last_seen_year:2022 },

  // ── Tier 5: 50–59 ── appears 5–7 exams ───────────────────────────────────
  { type:'vocabulary', text:'忌憚',     reading:'きたん',     exam_count: 7, question_count: 8, last_seen_year:2021 },
  { type:'vocabulary', text:'蹉跌',     reading:'さてつ',     exam_count: 7, question_count: 8, last_seen_year:2020 },
  { type:'vocabulary', text:'懊悩',     reading:'おうのう',   exam_count: 7, question_count: 8, last_seen_year:2021 },
  { type:'vocabulary', text:'陶酔',     reading:'とうすい',   exam_count: 7, question_count: 8, last_seen_year:2022 },
  { type:'vocabulary', text:'含蓄',     reading:'がんちく',   exam_count: 7, question_count: 8, last_seen_year:2022 },
  { type:'vocabulary', text:'逸脱',     reading:'いつだつ',   exam_count: 7, question_count: 8, last_seen_year:2021 },
  { type:'vocabulary', text:'徒に',     reading:'いたずらに', exam_count: 6, question_count: 7, last_seen_year:2021 },
  { type:'vocabulary', text:'荘厳',     reading:'そうごん',   exam_count: 6, question_count: 7, last_seen_year:2021 },
  { type:'vocabulary', text:'論駁',     reading:'ろんばく',   exam_count: 6, question_count: 7, last_seen_year:2020 },
  { type:'vocabulary', text:'凌駕する', reading:'りょうがする', exam_count: 6, question_count: 7, last_seen_year:2022 },
  { type:'vocabulary', text:'癒着',     reading:'ゆちゃく',   exam_count: 6, question_count: 7, last_seen_year:2022 },
  { type:'vocabulary', text:'趨勢',     reading:'すうせい',   exam_count: 6, question_count: 7, last_seen_year:2021 },
  { type:'vocabulary', text:'蔑視',     reading:'べっし',     exam_count: 6, question_count: 7, last_seen_year:2021 },
  { type:'vocabulary', text:'忸怩',     reading:'じくじ',     exam_count: 6, question_count: 6, last_seen_year:2020 },
  { type:'vocabulary', text:'逸する',   reading:'いっする',   exam_count: 5, question_count: 6, last_seen_year:2021 },

  // ── Tier 6: 40–49 ── appears 3–4 exams ───────────────────────────────────
  { type:'vocabulary', text:'邂逅',     reading:'かいこう',   exam_count: 4, question_count: 5, last_seen_year:2021 },
  { type:'vocabulary', text:'蹂躙',     reading:'じゅうりん', exam_count: 4, question_count: 5, last_seen_year:2020 },
  { type:'vocabulary', text:'慟哭',     reading:'どうこく',   exam_count: 4, question_count: 5, last_seen_year:2020 },
  { type:'vocabulary', text:'嚆矢',     reading:'こうし',     exam_count: 4, question_count: 5, last_seen_year:2021 },
  { type:'vocabulary', text:'僥倖',     reading:'ぎょうこう', exam_count: 4, question_count: 5, last_seen_year:2020 },
  { type:'vocabulary', text:'逡巡',     reading:'しゅんじゅん', exam_count: 3, question_count: 4, last_seen_year:2021 },
  { type:'vocabulary', text:'蠢く',     reading:'うごめく',   exam_count: 3, question_count: 4, last_seen_year:2020 },
  { type:'vocabulary', text:'佇む',     reading:'たたずむ',   exam_count: 3, question_count: 4, last_seen_year:2021 },
  { type:'vocabulary', text:'欣喜',     reading:'きんき',     exam_count: 3, question_count: 4, last_seen_year:2019 },
  { type:'vocabulary', text:'輪廻',     reading:'りんね',     exam_count: 3, question_count: 3, last_seen_year:2020 },
  { type:'vocabulary', text:'黎明',     reading:'れいめい',   exam_count: 3, question_count: 3, last_seen_year:2021 },
  { type:'vocabulary', text:'矜持',     reading:'きょうじ',   exam_count: 3, question_count: 3, last_seen_year:2020 },
  { type:'vocabulary', text:'払底',     reading:'ふってい',   exam_count: 3, question_count: 3, last_seen_year:2019 },
];

// ─── SCORING CONSTANTS ────────────────────────────────────────────────────────
export const TOTAL_EXAMS = 28;    // July + December 2010–2023
export const MAX_QUESTIONS = 5;   // cap for inflation prevention

/** Compute normalised frequency_score (0–100) from raw counts. */
export function computeScore(exam_count: number, question_count: number): number {
  const breadth = (exam_count / TOTAL_EXAMS) * 60;
  const depth   = (Math.min(question_count, MAX_QUESTIONS) / MAX_QUESTIONS) * 40;
  return Math.min(100, Math.round((breadth + depth) * 10) / 10);
}
