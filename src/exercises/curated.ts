// Curated grammar exercises in real N1 test formats.
// Sentence completion (文の組み立て) and error identification (誤文訂正)
// require hand-crafted content; fill-in-the-blank is auto-generated from
// the grammar table in generator.ts.

export interface CuratedExercise {
  type: 'sentence_completion' | 'error_identification';
  grammar_pattern: string;
  prompt_jp: string;
  prompt_en: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation_jp: string;
  explanation_en: string;
  nuance_note: string;
}

// ─── Sentence completion (文の組み立て) ────────────────────────────────────────
// Format: a sentence with 4 numbered slots [1][2]★[4]. User picks which of
// the 4 chunks belongs at the ★ position. The correct full ordering is
// shown in the explanation.

export const SENTENCE_COMPLETION: CuratedExercise[] = [
  {
    type: 'sentence_completion',
    grammar_pattern: '〜をもって',
    prompt_jp: '本日 [1] [2] ★ [4] させていただきます。',
    prompt_en: 'We will close the store today [...].',
    options: ['当店は', 'をもって', '閉店', '本日限り'],
    correct_index: 1,
    explanation_jp: '正しい順序: 本日 [当店は] [本日限り] [をもって] [閉店] させていただきます。「〜をもって」は時刻・期日と結びつき、終了点を明示する書き言葉。',
    explanation_en: 'Correct order: 当店は → 本日限り → をもって → 閉店. 〜をもって follows a time/date to mark a formal ending point.',
    nuance_note: '〜をもって vs 〜で: をもって is formal written language used in announcements; で is the everyday equivalent.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜ならでは（の）',
    prompt_jp: 'この旅館は [1] [2] ★ [4] が楽しめる。',
    prompt_en: 'At this inn you can enjoy [...].',
    options: ['ならではの', '京都', '老舗', 'おもてなし'],
    correct_index: 0,
    explanation_jp: '正しい順序: この旅館は [京都] [老舗] [ならではの] [おもてなし] が楽しめる。「〜ならでは」は名詞に直接接続し、その対象だけに特有のポジティブな特徴を述べる。',
    explanation_en: 'Correct order: 京都 → 老舗 → ならではの → おもてなし. 〜ならでは attaches directly to a noun and expresses a positive feature exclusive to it.',
    nuance_note: '〜ならでは is always positive (uniqueness/excellence). 〜にしか〜ない is neutral.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜をよそに',
    prompt_jp: '周囲の [1] [2] ★ [4] 進められた。',
    prompt_en: 'The plan moved forward [...].',
    options: ['計画は', '反対', 'をよそに', '強引に'],
    correct_index: 2,
    explanation_jp: '正しい順序: 周囲の [反対] [をよそに] [計画は] [強引に] 進められた。「〜をよそに」は他者の感情・反応を無視して行動する非難の含意。',
    explanation_en: 'Correct order: 反対 → をよそに → 計画は → 強引に. 〜をよそに implies ignoring others\' feelings/reactions, often with criticism.',
    nuance_note: '〜をよそに implies critical disregard. 〜にかかわらず is neutral indifference.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜にもまして',
    prompt_jp: '今年の [1] [2] ★ [4] 厳しいものだった。',
    prompt_en: "This year's [...] was severe.",
    options: ['暑さは', '去年', 'にもまして', '夏の'],
    correct_index: 2,
    explanation_jp: '正しい順序: 今年の [夏の] [暑さは] [去年] [にもまして] 厳しいものだった。「Nにもまして」は比較対象を上回ることを強調する書き言葉。',
    explanation_en: 'Correct order: 夏の → 暑さは → 去年 → にもまして. NにもましてN expresses that something exceeds even an already-significant comparison.',
    nuance_note: '〜にもまして emphasizes that the comparison subject was itself notable. 〜より is plain comparison.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜とはいえ',
    prompt_jp: '春 [1] [2] ★ [4] 続いている。',
    prompt_en: "Even though it's spring, [...].",
    options: ['とはいえ', 'まだ', '寒い日が', 'になった'],
    correct_index: 0,
    explanation_jp: '正しい順序: 春 [になった] [とはいえ] [まだ] [寒い日が] 続いている。「〜とはいえ」は前提を一旦認めた上で予想と異なる事実を述べる。',
    explanation_en: 'Correct order: になった → とはいえ → まだ → 寒い日が. 〜とはいえ acknowledges a fact then presents an unexpected contrast.',
    nuance_note: '〜とはいえ acknowledges the premise as true. 〜とはいうものの is nearly identical but slightly softer.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜べく',
    prompt_jp: '彼は [1] [2] ★ [4] 努力している。',
    prompt_en: 'He is striving [...].',
    options: ['なる', '医者', '日々', 'べく'],
    correct_index: 3,
    explanation_jp: '正しい順序: 彼は [医者] [に] [なる] [べく] 日々 努力している。「〜べく」は目的を表す堅い書き言葉。動詞辞書形に接続。',
    explanation_en: 'Correct order: 医者 → に → なる → べく → 日々. 〜べく is a formal written form expressing purpose, attaching to dictionary form.',
    nuance_note: '〜べく is formal/literary. 〜ために is the everyday equivalent for purpose.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜をものともせず（に）',
    prompt_jp: '彼女は [1] [2] ★ [4] 続けた。',
    prompt_en: 'She continued [...].',
    options: ['ものともせず', '研究を', '逆境を', '長年'],
    correct_index: 0,
    explanation_jp: '正しい順序: 彼女は [逆境を] [ものともせず] [長年] [研究を] 続けた。「〜をものともせず」は困難を物ともせず立ち向かう称賛の表現。',
    explanation_en: 'Correct order: 逆境を → ものともせず → 長年 → 研究を. 〜をものともせず praises someone for facing hardship without yielding.',
    nuance_note: '〜をものともせず praises resilience. 〜にもかかわらず is neutral contrast.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜もさることながら',
    prompt_jp: '彼の [1] [2] ★ [4] 印象的だ。',
    prompt_en: 'His [...] is impressive.',
    options: ['もさることながら', '実績', '人柄が', 'は'],
    correct_index: 0,
    explanation_jp: '正しい順序: 彼の [実績] [は] [もさることながら] [人柄が] 印象的だ。「AもさることながらB」はAも当然優れているがBはさらに強調したい時に用いる。',
    explanation_en: 'Correct order: 実績 → は → もさることながら → 人柄が. AもさることながらB acknowledges A as notable but emphasizes B as even more so.',
    nuance_note: '〜もさることながら gives weight to both items, B more. 〜はもちろん is similar but lighter.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜を皮切りに',
    prompt_jp: '東京公演 [1] [2] ★ [4] 巡る予定だ。',
    prompt_en: 'Starting with the Tokyo performance, [...].',
    options: ['を皮切りに', '全国', '十都市', 'を'],
    correct_index: 0,
    explanation_jp: '正しい順序: 東京公演 [を皮切りに] [全国] [十都市] [を] 巡る予定だ。「〜を皮切りに」は何かを起点として展開していくことを示す。',
    explanation_en: 'Correct order: を皮切りに → 全国 → 十都市 → を. 〜を皮切りに marks the starting point of an expanding sequence.',
    nuance_note: '〜を皮切りに implies a positive expanding sequence (tour, series). 〜から始まる is neutral.',
  },
  {
    type: 'sentence_completion',
    grammar_pattern: '〜に足る',
    prompt_jp: 'この本は [1] [2] ★ [4] 内容だ。',
    prompt_en: 'This book has [...].',
    options: ['信頼', 'に足る', '十分に', 'する'],
    correct_index: 1,
    explanation_jp: '正しい順序: この本は [十分に] [信頼] [する] [に足る] 内容だ。「〜に足る」は動詞辞書形＋に足る、その動詞をするだけの価値があるという意。',
    explanation_en: 'Correct order: 十分に → 信頼 → する → に足る. 動詞 + に足る means "worthy of doing the verb".',
    nuance_note: '〜に足る is positive worthiness. 〜に値する is similar; 〜にすぎない is the opposite (mere).',
  },
];

// ─── Error identification (誤文訂正) ─────────────────────────────────────────
// Format: sentence with 4 numbered underlined sections ①②③④. User picks the
// one that is grammatically wrong. Explanation gives the correction.

export const ERROR_IDENTIFICATION: CuratedExercise[] = [
  {
    type: 'error_identification',
    grammar_pattern: '〜にもかかわらず',
    prompt_jp: '彼は ①熱心に ②勉強した ③もかかわらず、 ④試験に落ちた。',
    prompt_en: 'Despite studying hard, he failed the exam.',
    options: ['①熱心に', '②勉強した', '③もかかわらず', '④試験に落ちた'],
    correct_index: 2,
    explanation_jp: '③が誤り。正しくは「勉強した【のに】もかかわらず」ではなく「勉強した【にも】かかわらず」。「〜にもかかわらず」は動詞普通形に直接接続。',
    explanation_en: '③ is wrong. The correct form is 〜にもかかわらず (not もかかわらず alone). The に must be present.',
    nuance_note: '〜にもかかわらず (despite, contrary to expectation) vs 〜ものの (although, mild contrast).',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜ならでは（の）',
    prompt_jp: 'この料理は ①プロ ②ならでは ③技術が ④必要だ。',
    prompt_en: 'This dish requires technique only a professional has.',
    options: ['①プロ', '②ならでは', '③技術が', '④必要だ'],
    correct_index: 1,
    explanation_jp: '②が誤り。「〜ならでは」を後ろの名詞に接続する場合は「ならではの＋名詞」となる必要がある。正：プロ【ならではの】技術。',
    explanation_en: '② is wrong. When modifying a following noun, the form must be ならではの (with の), not bare ならでは. Correct: プロならではの技術.',
    nuance_note: 'ならでは = unique to; always positive. の is required when followed by a noun.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜に際して',
    prompt_jp: '①毎日の ②食事に ③際して、 ④手を洗います。',
    prompt_en: 'On the occasion of every meal, I wash my hands.',
    options: ['①毎日の', '②食事に', '③際して', '④手を洗います'],
    correct_index: 1,
    explanation_jp: '②③が文法的に成立しない。「〜に際して」は重要な特別な機会に使い、日常の繰り返し動作には不適切。「毎日の食事の前に」とすべき。',
    explanation_en: 'The use of に際して is wrong for daily/routine events. It must mark important, one-time occasions. Use 食事の前に instead.',
    nuance_note: '〜に際して: special, formal occasions. 〜にあたって: similar but slightly less weighty. 〜とき: any time.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜べく',
    prompt_jp: '①宝くじに ②当たる ③べく、 ④毎日買った。',
    prompt_en: 'In order to win the lottery, I bought one every day.',
    options: ['①宝くじに', '②当たる', '③べく', '④毎日買った'],
    correct_index: 2,
    explanation_jp: '③が不適。「〜べく」は意志・努力で達成できる目標にのみ使う。宝くじに当たるのは運の問題なので不自然。「当たることを期待して」が自然。',
    explanation_en: '③ is inappropriate. 〜べく is used only for goals achievable through deliberate effort. Lottery wins are luck, not effort.',
    nuance_note: '〜べく requires deliberate, achievable purpose. Use 〜ために for general purpose, 〜ように for hope/wish.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜とはいえ',
    prompt_jp: '①子供 ②とはいえ、 ③彼は ④何でも知っている。',
    prompt_en: 'Although he is a child, he knows everything.',
    options: ['①子供', '②とはいえ', '③彼は', '④何でも知っている'],
    correct_index: 0,
    explanation_jp: '名詞接続の場合、「〜とはいえ」は名詞のあとに「だ／である」省略があるが、より自然には「子供【だ】とはいえ」または「子供とはいえども」となる。①の単独接続はやや不自然。',
    explanation_en: 'For noun connection, とはいえ usually omits だ but in modern usage 子供とはいえ alone is acceptable; the more formal 子供だとはいえ is preferred in writing.',
    nuance_note: '〜とはいえ acknowledges and contrasts. 〜といえども is more literary, similar meaning.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜をよそに',
    prompt_jp: '①家族の ②心配 ③をよそに、 ④旅行を楽しんだ。',
    prompt_en: 'Disregarding family\'s worry, he enjoyed the trip.',
    options: ['①家族の', '②心配', '③をよそに', '④旅行を楽しんだ'],
    correct_index: 3,
    explanation_jp: '①〜③は文法的に正しいが、④で「楽しんだ」と肯定的に述べているため文脈と矛盾。「〜をよそに」は通常、無視する側への非難を含む。「楽しんでいる」など第三者視点が自然。',
    explanation_en: 'Grammar in ①-③ is fine, but ④ creates a tone clash: をよそに usually carries critical implication. Third-person 楽しんでいる sounds more natural.',
    nuance_note: '〜をよそに carries critical nuance about the subject ignoring others. 〜にかかわらず is neutral.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜ずにはすまない',
    prompt_jp: '①事故を ②起こした ③以上は、 ④謝るにはすまない。',
    prompt_en: 'Having caused an accident, one cannot avoid apologizing.',
    options: ['①事故を', '②起こした', '③以上は', '④謝るにはすまない'],
    correct_index: 3,
    explanation_jp: '④が誤り。正しくは「謝らずにはすまない」。「〜ずにはすまない」は動詞ない形＋ずにはすまない（する→せずに）。',
    explanation_en: '④ is wrong. The correct form is 謝らずにはすまない (verb-nai stem + ずにはすまない). する becomes せずに.',
    nuance_note: '〜ずにはすまない expresses social/moral obligation. 〜ないではすまない is nearly identical.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜にひきかえ',
    prompt_jp: '①兄は ②内向的な ③にひきかえ、 ④弟は社交的だ。',
    prompt_en: 'In contrast to the introverted older brother, the younger brother is sociable.',
    options: ['①兄は', '②内向的な', '③にひきかえ', '④弟は社交的だ'],
    correct_index: 1,
    explanation_jp: '②が誤り。「〜にひきかえ」はナ形容詞には「な」ではなく「である／なの」が必要。正：内向的【なの】にひきかえ、または 内向的【である】のにひきかえ。',
    explanation_en: '② is wrong. With na-adjectives, にひきかえ requires なの or である, not bare な. Correct: 内向的なのにひきかえ.',
    nuance_note: '〜にひきかえ contrasts two opposing things in parallel. 〜に反して contrasts with expectation.',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜てやまない',
    prompt_jp: '①彼の ②成功を ③願って ④やまありません。',
    prompt_en: 'I sincerely wish for his success.',
    options: ['①彼の', '②成功を', '③願って', '④やまありません'],
    correct_index: 3,
    explanation_jp: '④が誤り。「〜てやまない」は形容詞型の慣用表現で、活用は「やまない／やみません」（ません形あり）。正：願ってやみません。',
    explanation_en: '④ is wrong. やまない conjugates like an i-adjective: やまない / やみません. Correct: 願ってやみません.',
    nuance_note: '〜てやまない expresses strong, lasting emotion (only with limited verbs: 願う, 愛する, 祈る).',
  },
  {
    type: 'error_identification',
    grammar_pattern: '〜まじき',
    prompt_jp: '①公務員 ②として ③許す ④まじき行為だ。',
    prompt_en: 'It is unforgivable conduct for a public servant.',
    options: ['①公務員', '②として', '③許す', '④まじき行為だ'],
    correct_index: 2,
    explanation_jp: '③が誤り。「〜まじき」は動詞辞書形に接続するが、する動詞は「する→す」となる。正：許す【べから】ざる行為 または 許【さ】れまじき行為。「許すまじき」は古語的に許容される場合もあるが、正則は「許すまじき」より「許すべからざる」が自然。',
    explanation_en: 'まじき is a classical form; the more standard modern form is 許すべからざる行為 or 許されない行為. Modern usage of 〜まじき is restricted to set phrases like 政治家にあるまじき.',
    nuance_note: '〜まじき is mostly used in fixed phrases: 〜にあるまじき (unworthy of) and ある-form verbs.',
  },
];

export const ALL_CURATED = [...SENTENCE_COMPLETION, ...ERROR_IDENTIFICATION];
