'use client';

import { useEffect, useState } from 'react';
import { ReadingPassage, ReadingQuestion } from '@/types';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type PassageMeta = { id: number; title: string; difficulty: string; category: string | null };
type Answer = { questionId: number; selected: string; correct: boolean };

export default function ReadingExercise() {
  const [passages, setPassages] = useState<PassageMeta[]>([]);
  const [selected, setSelected] = useState<PassageMeta | null>(null);
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reading')
      .then(r => r.json())
      .then(data => {
        setPassages(data.passages);
        setLoading(false);
      });
  }, []);

  const loadPassage = async (p: PassageMeta) => {
    setSelected(p);
    setAnswers({});
    setSubmitted(false);
    const data = await fetch(`/api/reading?passageId=${p.id}`).then(r => r.json());
    setPassage(data.passage);
    setQuestions(data.questions);
  };

  const selectAnswer = (qId: number, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: { questionId: qId, selected: option, correct: false } }));
  };

  const submit = async () => {
    if (!passage) return;
    const graded: Record<number, Answer> = {};
    for (const q of questions) {
      const ans = answers[q.id];
      const correct = ans?.selected === q.correct_answer;
      graded[q.id] = { questionId: q.id, selected: ans?.selected ?? '', correct };
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'reading', itemId: q.id, result: correct ? 'correct' : 'incorrect' }),
      });
    }
    setAnswers(graded);
    setSubmitted(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-ink/40 text-sm">読み込み中…</p></div>;

  if (!selected) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-ink hanko-line">読解練習</h1>
          <p className="text-ink/50 text-xs mt-2">Reading Comprehension</p>
        </div>
        <p className="text-sm text-ink/50 mb-4">問題を選んでください Select a passage</p>
        <div className="space-y-3">
          {passages.map(p => (
            <button
              key={p.id}
              onClick={() => loadPassage(p)}
              className="w-full ink-border bg-aged-paper/60 p-4 rounded-sm text-left hover:bg-aged-paper hover:shadow-sm transition-all group flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <div className="flex gap-2 mt-1">
                  {p.category && <span className="text-xs text-ink/40">{p.category}</span>}
                  <span className="text-xs text-vermillion border border-vermillion/30 px-1.5 rounded-full">{p.difficulty}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-ink/30 group-hover:text-ink/60 transition-colors" />
            </button>
          ))}
        </div>
        {passages.length === 0 && (
          <p className="text-ink/40 text-sm text-center py-12">読解問題がありません</p>
        )}
      </div>
    );
  }

  const allAnswered = questions.every(q => answers[q.id]?.selected);
  const score = submitted
    ? Object.values(answers).filter(a => a.correct).length
    : 0;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelected(null)} className="text-xs text-ink/40 hover:text-ink/70 underline underline-offset-2">
          ← 問題一覧
        </button>
        <span className="text-ink/20">|</span>
        <h1 className="font-serif text-lg font-bold text-ink">{passage?.title}</h1>
      </div>

      {/* Passage */}
      <div className="ink-border bg-aged-paper rounded-sm p-6 mb-6 leading-loose text-sm text-ink whitespace-pre-wrap font-serif">
        {passage?.content}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qi) => {
          const ans = answers[q.id];
          const options: [string, string][] = [
            ['A', q.option_a],
            ['B', q.option_b],
            ['C', q.option_c],
            ['D', q.option_d],
          ];
          return (
            <div key={q.id} className="ink-border bg-aged-paper/40 rounded-sm p-5">
              <p className="font-medium text-ink mb-4 text-sm">
                <span className="text-vermillion font-bold mr-2">Q{qi + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {options.map(([key, text]) => {
                  const isSelected = ans?.selected === key;
                  const isCorrect = submitted && q.correct_answer === key;
                  const isWrong = submitted && isSelected && !ans.correct;
                  return (
                    <button
                      key={key}
                      onClick={() => selectAnswer(q.id, key)}
                      disabled={submitted}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-sm border text-sm transition-all flex items-center gap-3',
                        !submitted && isSelected && 'border-deep-blue bg-deep-blue/10',
                        !submitted && !isSelected && 'border-ink/10 hover:border-ink/30 bg-aged-paper/60',
                        isCorrect && 'border-moss bg-moss/10 text-moss',
                        isWrong && 'border-vermillion bg-vermillion/10 text-vermillion',
                        submitted && !isSelected && !isCorrect && 'border-ink/10 bg-aged-paper/30 opacity-50',
                      )}
                    >
                      <span className={cn(
                        'font-mono font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full border',
                        isCorrect ? 'border-moss text-moss' : isWrong ? 'border-vermillion text-vermillion' : 'border-ink/20 text-ink/40'
                      )}>
                        {key}
                      </span>
                      <span className="flex-1">{text}</span>
                      {submitted && isCorrect && <CheckCircle size={15} className="text-moss shrink-0" />}
                      {isWrong && <XCircle size={15} className="text-vermillion shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-3 bg-gold/10 border border-gold/20 rounded px-4 py-3 animate-slide-up">
                  <p className="text-xs text-ink/70">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="mt-6 w-full py-3 bg-vermillion text-white font-medium rounded-sm hover:bg-vermillion/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          採点する Submit
        </button>
      )}

      {submitted && (
        <div className="mt-6 ink-border bg-aged-paper rounded-sm p-6 text-center animate-slide-up">
          <p className="font-serif text-4xl font-bold text-ink mb-1">{score} / {questions.length}</p>
          <p className="text-ink/50 text-sm">正解 Correct</p>
          <button
            onClick={() => loadPassage(selected)}
            className="mt-4 flex items-center gap-2 mx-auto px-5 py-2 ink-border text-ink/70 rounded-sm hover:bg-aged-paper transition-colors text-sm"
          >
            <RotateCcw size={14} /> もう一度
          </button>
        </div>
      )}
    </div>
  );
}
