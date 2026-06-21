import { useState, useEffect, useRef } from 'react';
import type { Letter } from '../data/letters';
import { playChime, playSuccess } from './AudioHelper';
import ConfettiBurst from './ConfettiBurst';

interface Props {
  letters: Letter[];
  level: 'level1' | 'level2';
  onComplete: (score: number, stars: number) => void;
}

interface Card {
  id: string;
  pairId: string;
  type: 'hebrew' | 'name';
  letter: Letter;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function GameMatch({ letters, level, onComplete }: Props) {
  const useCursive = level === 'level2';
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const PAIR_COUNT = 6;
  const totalPairs = PAIR_COUNT;

  useEffect(() => {
    const picked = shuffle(letters).slice(0, PAIR_COUNT);
    const deck: Card[] = [];
    picked.forEach(letter => {
      deck.push({ id: `h-${letter.id}`, pairId: letter.id, type: 'hebrew', letter, flipped: false, matched: false });
      deck.push({ id: `n-${letter.id}`, pairId: letter.id, type: 'name', letter, flipped: false, matched: false });
    });
    setCards(shuffle(deck));
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleFlip = (cardId: string) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newSelected = [...selected, cardId];
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [a, b] = newSelected.map(id => cards.find(c => c.id === id)!);
      if (a.pairId === b.pairId && a.type !== b.type) {
        playChime();
        setConfetti(true);
        setTimeout(() => setConfetti(false), 500);
        const newCount = matchCount + 1;
        setMatchCount(newCount);
        setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, matched: true } : c));
        setSelected([]);
        if (newCount === totalPairs) {
          clearInterval(timerRef.current);
          playSuccess();
          setTimeout(() => {
            setDone(true);
            const timeScore = Math.max(30, 100 - Math.floor(elapsed / 2));
            onComplete(timeScore, timeScore >= 90 ? 3 : timeScore >= 70 ? 2 : 1);
          }, 800);
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 900);
      }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (done) return null;

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <ConfettiBurst active={confetti} />

      <div className="flex items-center justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">Matches: {matchCount} / {totalPairs}</span>
        <span className="font-english font-bold text-blue-600">⏱ {formatTime(elapsed)}</span>
      </div>

      <p className="font-english text-gray-500 text-sm">Flip cards to find matching pairs! Match the Hebrew letter with its name.</p>

      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {cards.map(card => (
          <div key={card.id} className="card-3d" style={{ height: 90 }}>
            <div className={`card-inner w-full h-full ${card.flipped || card.matched ? 'flipped' : ''}`}>
              {/* Front (face down) */}
              <div className="card-face rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-md cursor-pointer border-2 border-blue-300"
                onClick={() => handleFlip(card.id)}>
                <span className="text-3xl">✨</span>
              </div>
              {/* Back (face up) */}
              <div className={`card-face card-back rounded-2xl shadow-md border-4 flex items-center justify-center
                ${card.matched ? 'bg-green-100 border-green-400' : 'bg-white border-yellow-300'}`}>
                {card.type === 'hebrew' ? (
                  <span className={`${useCursive ? 'font-hebrew-cursive' : 'font-hebrew'} text-4xl leading-none`} dir="rtl">
                    {useCursive ? card.letter.hebrewCursive : card.letter.hebrew}
                  </span>
                ) : (
                  <span className="font-english font-bold text-sm text-center text-gray-700 px-1 leading-tight">
                    {card.letter.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-english text-xs text-gray-400 text-center">Tap a card to flip it. Find all {totalPairs} matching pairs!</p>
    </div>
  );
}
