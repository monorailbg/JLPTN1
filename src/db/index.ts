import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'jlpt.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(
    path.join(process.cwd(), 'src', 'db', 'schema.sql'),
    'utf-8'
  );
  db.exec(schema);
  seedIfEmpty(db);

  return db;
}

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM vocabulary').get() as { c: number }).c;
  if (count > 0) return;

  const vocabInsert = db.prepare(
    'INSERT INTO vocabulary (word, reading, meaning, example_jp, example_en, category) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const grammarInsert = db.prepare(
    'INSERT INTO grammar (pattern, meaning, usage, example_jp, example_en, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const passageInsert = db.prepare(
    'INSERT INTO reading_passages (title, content, category) VALUES (?, ?, ?)'
  );
  const questionInsert = db.prepare(
    'INSERT INTO reading_questions (passage_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  db.transaction(() => {
    vocabInsert.run('曖昧', 'あいまい', 'Vague; ambiguous; unclear', '彼の返答は曖昧だった。', 'His answer was ambiguous.', '形容動詞');
    vocabInsert.run('漸く', 'ようやく', 'Finally; at last; barely', 'ようやく試験に合格した。', 'I finally passed the exam.', '副詞');
    vocabInsert.run('拘る', 'こだわる', 'To be particular about; to stick to', '細部にこだわる職人だ。', 'He is an artisan who is particular about details.', '動詞');
    vocabInsert.run('概ね', 'おおむね', 'Generally; mostly; in outline', '計画は概ね順調だ。', 'The plan is generally on track.', '副詞');
    vocabInsert.run('尚且つ', 'なおかつ', 'Moreover; furthermore; and yet', '美しく、尚且つ聡明な人だ。', 'She is beautiful and moreover intelligent.', '接続詞');
    vocabInsert.run('恣意的', 'しいてき', 'Arbitrary; capricious', '恣意的な判断を避けるべきだ。', 'We should avoid arbitrary judgments.', '形容動詞');
    vocabInsert.run('俯瞰', 'ふかん', 'Bird\'s-eye view; overview', '問題を俯瞰して考える。', 'Think about the problem from a bird\'s-eye view.', '名詞');
    vocabInsert.run('齟齬', 'そご', 'Discrepancy; inconsistency; contradiction', '両者の意見に齟齬が生じた。', 'A discrepancy arose between the two opinions.', '名詞');
    vocabInsert.run('逡巡', 'しゅんじゅん', 'Hesitation; vacillation', '逡巡することなく決断した。', 'He made the decision without hesitation.', '名詞');
    vocabInsert.run('顛末', 'てんまつ', 'Full account; whole story; particulars', '事件の顛末を説明した。', 'I explained the whole story of the incident.', '名詞');
    vocabInsert.run('形而上', 'けいじじょう', 'Metaphysical; abstract', '形而上の問題を議論した。', 'We discussed metaphysical issues.', '形容動詞');
    vocabInsert.run('蓋し', 'けだし', 'Indeed; truly; perhaps', 'けだし、彼は天才だ。', 'Indeed, he is a genius.', '副詞');

    grammarInsert.run('〜に相違ない', 'There is no doubt that…; must be', 'Verb plain / Noun / Adj + に相違ない', 'あの光は UFO に相違ない。', 'That light must be a UFO.', 'Expresses strong conviction. More formal than 〜に違いない.');
    grammarInsert.run('〜をものともせず', 'Undaunted by; in defiance of', 'Noun + をものともせず(に)', '嵐をものともせず、登山を続けた。', 'Undaunted by the storm, they continued climbing.', 'Expresses overcoming a difficult obstacle with determination.');
    grammarInsert.run('〜たりとも〜ない', 'Not even one…; not a single…', 'Counter + たりとも + negative', '一秒たりとも無駄にできない。', 'I cannot waste even a single second.', 'Used for emphasis — even the smallest unit is not acceptable.');
    grammarInsert.run('〜いかんによらず', 'Regardless of; irrespective of', 'Noun + いかんによらず / いかんにかかわらず', '結果のいかんによらず、全力を尽くす。', 'Regardless of the result, I will do my best.', 'Formal expression meaning "no matter what the state of X is".');
    grammarInsert.run('〜に足る', 'Worth doing; deserving of', 'Verb dict / Noun + に足る', '信頼に足る人物だ。', 'He is a person worthy of trust.', 'Formal; often used in written language.');
    grammarInsert.run('〜べくして〜た', 'As was bound to happen; inevitably', 'Verb dict + べくして + same verb past', '起こるべくして起こった事故だった。', 'It was an accident that was bound to happen.', 'Indicates the outcome was inevitable.');

    const p1 = passageInsert.run(
      '人工知能と創造性',
      '近年、人工知能（AI）の発展は目覚ましく、その応用範囲は従来の計算処理や データ分析を超え、音楽、絵画、文学といった創造的領域にまで及んでいる。しかし、AIが生み出す「作品」は本当に創造的と言えるのだろうか。\n\n創造性とは何かを定義することは難しい。一般的には、既存の概念を新しい方法で組み合わせ、独創的な何かを生み出す能力とされる。この観点から見れば、大量のデータから学習し、パターンを認識して新しいコンテンツを生成するAIは、確かに創造的活動を行っていると見ることもできる。\n\nしかし、多くの哲学者や芸術家は異議を唱える。彼らによれば、真の創造性には意図、感情、そして自己意識が不可欠である。人間の芸術家は自らの経験、苦悩、喜びを作品に込める。その作品には作者の魂が宿っている。AIにはそのような内的世界が存在せず、ただデータを処理しているに過ぎないという見方だ。\n\nこの議論は単なる哲学的問いにとどまらず、著作権、芸術家の雇用、そして人間の存在意義にまで影響を及ぼす重要な問題である。',
      'テクノロジー'
    );

    questionInsert.run(
      p1.lastInsertRowid,
      '本文によれば、AIの創造性に対する否定的な意見の根拠は何か？',
      'AIは計算能力が人間より劣るから',
      'AIには感情や自己意識がないから',
      'AIは学習データが不十分だから',
      'AIは著作権を持てないから',
      'B',
      '第三段落で「真の創造性には意図、感情、そして自己意識が不可欠」とあり、AIにはそれらがないという主張が述べられている。'
    );

    questionInsert.run(
      p1.lastInsertRowid,
      '筆者がこの問題を「単なる哲学的問いにとどまらない」と述べた理由として最も適切なものはどれか？',
      '哲学は非実用的な学問だから',
      '著作権や雇用など社会的影響があるから',
      'AIの技術が急速に進化しているから',
      '芸術家の数が減少しているから',
      'B',
      '最終段落に「著作権、芸術家の雇用、そして人間の存在意義にまで影響を及ぼす」と明記されている。'
    );
  })();
}
