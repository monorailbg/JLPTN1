'use client';

import { useState } from 'react';

interface VocabMatch {
  word: string;
  reading: string;
  meaning: string;
  jlpt_level: string;
}

export type Segment =
  | { kind: 'text';  text: string }
  | { kind: 'vocab'; text: string; vocab: VocabMatch };

interface Props {
  segments: Segment[];
}

export default function AnnotatedPassage({ segments }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="ink-border bg-aged-paper rounded-sm p-6 mb-6 leading-loose text-base text-ink font-serif whitespace-pre-wrap relative">
      {segments.map((seg, i) => {
        if (seg.kind === 'text') {
          return <span key={i}>{seg.text}</span>;
        }
        const isOpen = openIndex === i;
        return (
          <span key={i} className="relative inline-block">
            <button
              onClick={() => setOpenIndex(prev => (prev === i ? null : i))}
              onMouseEnter={() => setOpenIndex(i)}
              onMouseLeave={() => setOpenIndex(prev => (prev === i ? null : prev))}
              className="text-deep-blue underline decoration-dotted decoration-deep-blue/40 underline-offset-4 hover:bg-deep-blue/10 rounded transition-colors"
            >
              {seg.text}
            </button>
            {isOpen && (
              <span
                role="tooltip"
                className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-64 ink-border bg-washi rounded-sm shadow-lg p-3 text-left animate-fade-in"
              >
                <span className="block font-serif text-lg font-bold text-ink leading-tight">
                  {seg.vocab.word}
                </span>
                <span className="block text-sm text-vermillion mt-0.5 font-medium">
                  {seg.vocab.reading}
                </span>
                <span className="block text-xs text-ink/70 mt-2 leading-snug">
                  {seg.vocab.meaning}
                </span>
                <span className="block text-[10px] text-ink/40 mt-2 font-mono">
                  JLPT {seg.vocab.jlpt_level}
                </span>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
