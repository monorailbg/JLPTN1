// Supplementary N1 vocabulary covering practical concepts used in the
// reading passages. All entries are JLPT N1 — none appear in the N2-N5
// official word lists.

import type { VocabSeed } from './seed-data';

export const extraVocabulary: VocabSeed[] = [
  // Practical / business
  ['普及',       'ふきゅう',           'spread; diffusion; popularization',                       '電子書籍の普及で読書の形が変わった。',              'The spread of e-books has changed how people read.',          '社会・経済', 240],
  ['削減',       'さくげん',           'reduction; cutback',                                       'コスト削減が急務だ。',                                 'Cost reduction is an urgent task.',                            '経営',       241],
  ['弊害',       'へいがい',           'harmful effect; evil influence',                           '過度な競争の弊害が現れている。',                       'The harmful effects of excessive competition are appearing.',  '社会',       242],
  ['顕著',       'けんちょ',           'remarkable; striking; conspicuous',                        '効果が顕著に現れた。',                                 'The effect appeared strikingly.',                              '形容',       243],
  ['帰属',       'きぞく',             'belonging to; affiliation',                                '組織への帰属意識が高い。',                             'Sense of belonging to the organization is strong.',            '抽象',       244],
  ['希薄',       'きはく',             'thin; sparse; weak (concentration)',                       '責任感が希薄だ。',                                     'Sense of responsibility is weak.',                             '形容',       245],
  ['競争力',     'きょうそうりょく',   'competitiveness',                                          '国際競争力を高める必要がある。',                       'We need to increase international competitiveness.',           '経済',       246],
  ['画一的',     'かくいつてき',       'uniform; standardized; cut-and-dried',                     '画一的な教育では個性が育たない。',                     "Cut-and-dried education doesn't cultivate individuality.",     '形容',       247],
  ['柔軟',       'じゅうなん',         'flexible; pliable; adaptable',                             '柔軟な発想が求められる。',                             'Flexible thinking is required.',                               '形容',       248],
  ['自給率',     'じきゅうりつ',       'self-sufficiency rate',                                    '日本の食料自給率は低い。',                             "Japan's food self-sufficiency rate is low.",                   '経済',       249],
  ['担い手',     'にないて',           'bearer; person in charge; central figure',                 '次世代の担い手を育成する。',                           'Train the next generation of leaders.',                        '社会',       250],
  ['高齢化',     'こうれいか',         'aging (of population)',                                    '少子高齢化が進む。',                                   'Aging society is advancing.',                                  '社会',       251],
  ['耕作',       'こうさく',           'cultivation; farming',                                     '耕作放棄地が拡大している。',                           'Abandoned farmland is expanding.',                             '農業',       252],
  ['拡大',       'かくだい',           'expansion; enlargement',                                   '事業を拡大する。',                                     'Expand the business.',                                         '一般',       253],
  ['構造的',     'こうぞうてき',       'structural',                                               '構造的な問題に取り組む。',                             'Tackle structural problems.',                                  '形容',       254],
  ['急務',       'きゅうむ',           'urgent task; pressing need',                               '対策が急務だ。',                                       'Countermeasures are an urgent need.',                          '抽象',       255],
  ['抜本的',     'ばっぽんてき',       'drastic; radical; fundamental',                            '抜本的な改革が必要だ。',                               'Fundamental reform is needed.',                                '形容',       256],

  // Crafts / culture
  ['工芸',       'こうげい',           'craft; handicraft',                                        '伝統工芸を継承する。',                                 'Inherit traditional crafts.',                                  '文化',       257],
  ['漆器',       'しっき',             'lacquerware',                                              '漆器は日本の伝統工芸だ。',                             'Lacquerware is a traditional Japanese craft.',                 '文化',       258],
  ['織物',       'おりもの',           'textile; woven cloth',                                     '京都の織物は世界的に有名だ。',                         'Kyoto textiles are world-famous.',                             '文化',       259],
  ['修業',       'しゅぎょう',         'training; pursuit of knowledge; ascetic practice',         '長年の修業を経て一人前になる。',                       'Become a full-fledged artisan after years of training.',       '抽象',       260],
  ['自治体',     'じちたい',           'local government; municipality',                           '地方自治体が支援する。',                               'Local governments provide support.',                           '社会',       261],
  ['効率',       'こうりつ',           'efficiency',                                               '作業の効率を上げる。',                                 'Increase work efficiency.',                                    '一般',       262],
  ['生産性',     'せいさんせい',       'productivity',                                             '生産性が低下している。',                               'Productivity is declining.',                                   '経済',       263],

  // Science / health
  ['大脳',       'だいのう',           'cerebrum',                                                 '大脳の働きを研究する。',                               'Study the function of the cerebrum.',                          '医療',       264],
  ['皮質',       'ひしつ',             'cortex (of brain)',                                        '大脳皮質に情報が転送される。',                         'Information is transferred to the cerebral cortex.',           '医療',       265],
  ['固定',       'こてい',             'fixing; fixation; consolidation',                          '記憶が長期記憶として固定される。',                     'Memory is consolidated as long-term memory.',                  '抽象',       266],
  ['整理',       'せいり',             'sorting; arrangement; tidying up',                         '情報を整理する。',                                     'Organize the information.',                                    '一般',       267],
  ['解決',       'かいけつ',           'solution; resolution',                                     '問題を解決する。',                                     'Solve the problem.',                                           '一般',       268],
  ['確保',       'かくほ',             'securing; ensuring; guaranteeing',                         '十分な睡眠を確保する。',                               'Secure adequate sleep.',                                       '抽象',       269],
  ['最大化',     'さいだいか',         'maximization',                                             '効果を最大化する。',                                   'Maximize the effect.',                                         '抽象',       270],

  // Corporate / formal
  ['更新',       'こうしん',           'update; renewal',                                          'システムを更新する。',                                 'Update the system.',                                           '一般',       271],
  ['期間',       'きかん',             'period; term; interval',                                   '応募期間は1か月だ。',                                  'The application period is one month.',                         '一般',       272],
  ['延長',       'えんちょう',         'extension; prolongation',                                  '期限を延長する。',                                     'Extend the deadline.',                                         '一般',       273],
  ['延滞',       'えんたい',           'delay; delinquency; arrears',                              '延滞料金が発生する。',                                 'Late fees will be incurred.',                                  '金融',       274],
  ['協力',       'きょうりょく',       'cooperation; collaboration',                               'ご協力をお願いします。',                               'We ask for your cooperation.',                                 '一般',       275],
  ['募集',       'ぼしゅう',           'recruitment; application',                                 '社員を募集する。',                                     'Recruit employees.',                                           '経営',       276],
  ['主催',       'しゅさい',           'sponsorship; hosting; organizing',                         '研修を主催する。',                                     'Host a training program.',                                     '経営',       277],
  ['拠点',       'きょてん',           'base; foothold; position',                                 '海外拠点を設立する。',                                 'Establish an overseas base.',                                  '経営',       278],
  ['推薦',       'すいせん',           'recommendation',                                           '部門長の推薦が必要だ。',                               "The department head's recommendation is required.",            '一般',       279],
  ['選考',       'せんこう',           'selection; screening',                                     '書類選考を行う。',                                     'Conduct document screening.',                                  '一般',       280],
  ['締切',       'しめきり',           'deadline; closing',                                        '応募締切は今月末だ。',                                 'The application deadline is the end of this month.',           '一般',       281],
  ['厳守',       'げんしゅ',           'strict adherence; strict compliance',                      '時間厳守でお願いします。',                             'Please strictly observe the time.',                            '形容',       282],
  ['賞与',       'しょうよ',           'bonus; award',                                             '賞与は年2回支給される。',                             'Bonuses are paid twice a year.',                               '金融',       283],
  ['直属',       'ちょくぞく',         'direct (supervision); immediate (superior)',               '直属の上司に報告する。',                               'Report to the immediate supervisor.',                          '経営',       284],
  ['経由',       'けいゆ',             'going via; route',                                         '上司を経由して提出する。',                             'Submit via your supervisor.',                                  '一般',       285],
  ['提出',       'ていしゅつ',         'submission; presentation',                                 '書類を提出する。',                                     'Submit the document.',                                         '一般',       286],
  ['所定',       'しょてい',           'prescribed; specified; designated',                        '所定の用紙に記入する。',                               'Fill in the designated form.',                                 '形容',       287],
  ['通常',       'つうじょう',         'normal; usual; ordinary',                                  '通常通り営業する。',                                   'Operate as usual.',                                            '一般',       288],
  ['予約',       'よやく',             'reservation; booking',                                     '資料を予約する。',                                     'Reserve the material.',                                        '一般',       289],
  ['登録',       'とうろく',           'registration',                                             '会員登録する。',                                       'Register as a member.',                                        '一般',       290],
  ['処理',       'しょり',             'processing; management; handling',                         'データを処理する。',                                   'Process the data.',                                            '技術',       291],
  ['再開',       'さいかい',           'resumption; reopening',                                    '会議を再開する。',                                     'Resume the meeting.',                                          '一般',       292],
  ['依存',       'いぞん',             'dependence; reliance',                                     '輸入に依存する。',                                     'Depend on imports.',                                           '抽象',       293],
  ['転送',       'てんそう',           'forwarding; transfer',                                     'メールを転送する。',                                   'Forward the email.',                                           '技術',       294],
  ['指摘',       'してき',             'pointing out; indication',                                 '問題点を指摘する。',                                   'Point out the problems.',                                      '一般',       295],
  ['対面',       'たいめん',           'face-to-face; interview',                                  '対面で会議する。',                                     'Meet face-to-face.',                                           '一般',       296],
  ['暗黙',       'あんもく',           'tacit; implicit',                                          '暗黙のルールに従う。',                                 'Follow the tacit rules.',                                      '抽象',       297],
  ['取り組み',   'とりくみ',           'undertaking; initiative; effort',                          '新しい取り組みを始める。',                             'Begin a new initiative.',                                      '一般',       298],
  ['踏まえ',     'ふまえ',             'based on; in light of',                                    '事実を踏まえて判断する。',                             'Judge based on the facts.',                                    '抽象',       299],
  ['留意',       'りゅうい',           'heed; pay attention to',                                   '注意事項に留意する。',                                 'Pay attention to the precautions.',                            '抽象',       300],
];
