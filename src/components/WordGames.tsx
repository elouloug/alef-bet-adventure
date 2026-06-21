import { useState, useCallback } from 'react';
import type { HebrewWord } from '../data/words';
import { WORDS } from '../data/words';
import { useSpeech } from '../hooks/useSpeech';
import { playChime, playWrong, playSuccess } from './AudioHelper';
import RewardModal from './RewardModal';
import ConfettiBurst from './ConfettiBurst';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const ENCOURAGING = [
  'כל הכבוד! Well done!',
  'ממש נחמד! Amazing!',
  'אתה מלא כוחות! You\'re a star!',
  'יופי! Beautiful!',
];

// ── Game A: Hear and pick the right spelling ──────────────────────────────────

function GameHearWord({ onComplete }: { onComplete: (score: number) => void }) {
  const { speak } = useSpeech();
  const [queue] = useState(() => shuffle(WORDS).slice(0, 8));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const current = queue[idx];

  const choices = useCallback(() => {
    const others = shuffle(WORDS.filter(w => w.id !== current.id)).slice(0, 3);
    return shuffle([current, ...others]);
  }, [current]);

  const [opts] = useState(choices);
  const [currentOpts, setCurrentOpts] = useState(opts);

  const handlePick = (word: HebrewWord) => {
    if (selected) return;
    setSelected(word.id);
    const correct = word.id === current.id;
    if (correct) { playChime(); setScore(s => s + 1); }
    else playWrong();
    setTimeout(() => {
      if (idx + 1 >= queue.length) {
        const pct = Math.round(((score + (correct ? 1 : 0)) / queue.length) * 100);
        onComplete(pct);
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        const next = queue[idx + 1];
        const o = shuffle(WORDS.filter(w => w.id !== next.id)).slice(0, 3);
        setCurrentOpts(shuffle([next, ...o]));
      }
    }, 900);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">{idx + 1} / {queue.length}</span>
        <span className="font-english font-bold text-yellow-600">{score} ⭐</span>
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-6 text-center w-full max-w-md">
        <p className="font-english text-gray-500 text-sm mb-3">Listen and pick the correct spelling!</p>
        <button
          onClick={() => speak(current.pronunciation)}
          className="tap-target bg-blue-500 text-white font-english font-bold text-xl px-8 py-4 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
        >
          🔊 Hear the word
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {currentOpts.map(w => {
          const isCorrect = selected === w.id && w.id === current.id;
          const isWrong = selected === w.id && w.id !== current.id;
          const reveal = selected && selected !== current.id && w.id === current.id;
          return (
            <button key={w.id} onClick={() => handlePick(w)} disabled={!!selected}
              className={`tap-target bg-white rounded-3xl p-5 shadow-md border-4 transition-all hover:scale-105 active:scale-95
                ${isCorrect || reveal ? 'border-green-400 bg-green-50' : isWrong ? 'border-red-400 bg-red-50' : 'border-transparent'}`}>
              <span className="font-hebrew text-4xl" dir="rtl">{w.hebrew}</span>
              <span className="block font-english text-xs text-gray-400 mt-1">{w.romanized}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Game B: See emoji, spell the word by picking letters ──────────────────────

function GameSpellIt({ onComplete }: { onComplete: (score: number) => void }) {
  const [queue] = useState(() => shuffle(WORDS).slice(0, 6));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const current = queue[idx];
  const targetLetters = Array.from(current.hebrew);

  const shuffledBank = useCallback(() => {
    const extras = shuffle('אבגדהוזחטיכלמנסעפצקרשת'.split('').filter(c => !targetLetters.includes(c))).slice(0, 6 - targetLetters.length);
    return shuffle([...targetLetters, ...extras]);
  }, [current]);

  const [currentBank, setCurrentBank] = useState(shuffledBank);

  const addLetter = (l: string) => {
    if (typed.length >= targetLetters.length) return;
    setTyped(prev => [...prev, l]);
  };

  const removeLast = () => setTyped(prev => prev.slice(0, -1));

  const advanceWord = (newScore: number) => {
    const nextIdx = idx + 1;
    if (nextIdx >= queue.length) {
      const pct = Math.round((newScore / queue.length) * 100);
      onComplete(pct);
    } else {
      setIdx(nextIdx);
      setTyped([]);
      setResult(null);
      const next = queue[nextIdx];
      const extras = shuffle('אבגדהוזחטיכלמנסעפצקרשת'.split('').filter(c => !Array.from(next.hebrew).includes(c))).slice(0, Math.max(0, 6 - Array.from(next.hebrew).length));
      setCurrentBank(shuffle([...Array.from(next.hebrew), ...extras]));
    }
  };

  const check = () => {
    const attempt = typed.join('');
    const correct = attempt === current.hebrew;
    if (correct) {
      playChime();
      const newScore = score + 1;
      setScore(newScore);
      setResult('correct');
      setTimeout(() => advanceWord(newScore), 1000);
    } else {
      playWrong();
      setResult('wrong');
      // Clear and let them try again — don't advance
      setTimeout(() => {
        setTyped([]);
        setResult(null);
      }, 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">{idx + 1} / {queue.length}</span>
        <span className="font-english font-bold text-yellow-600">{score} ⭐</span>
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-6 text-center w-full max-w-md">
        <div className="text-7xl mb-2">{current.emoji}</div>
        <p className="font-english font-bold text-xl text-gray-700">{current.meaning}</p>
        <p className="font-english text-gray-400 text-sm">Spell it in Hebrew!</p>
      </div>
      <div className="flex gap-3 justify-center min-h-16 items-center" dir="rtl">
        {typed.map((l, i) => (
          <div key={i} className={`w-14 h-14 flex items-center justify-center rounded-2xl border-4 font-hebrew text-3xl
            ${result === 'correct' ? 'border-green-400 bg-green-50' : result === 'wrong' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'}`}>
            {l}
          </div>
        ))}
        {Array.from({ length: targetLetters.length - typed.length }).map((_, i) => (
          <div key={i} className="w-14 h-14 rounded-2xl border-4 border-dashed border-gray-300 bg-gray-50" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {currentBank.map((l, i) => (
          <button key={i} onClick={() => addLetter(l)}
            className="tap-target bg-white rounded-2xl border-2 border-blue-200 font-hebrew text-3xl h-14 flex items-center justify-center shadow-sm hover:border-blue-400 hover:scale-105 active:scale-95 transition-all"
            dir="rtl">{l}</button>
        ))}
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={removeLast} disabled={!typed.length}
          className="flex-1 bg-gray-100 text-gray-600 font-english font-bold py-3 rounded-2xl disabled:opacity-40 hover:bg-gray-200 transition-all">
          ← Back
        </button>
        <button onClick={check} disabled={typed.length !== targetLetters.length || !!result}
          className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-english font-bold py-3 rounded-2xl disabled:opacity-40 hover:scale-105 active:scale-95 shadow-md transition-all">
          Check ✓
        </button>
      </div>
    </div>
  );
}

// ── Game C: Word-picture matching ─────────────────────────────────────────────

function GamePictureMatch({ onComplete }: { onComplete: (score: number) => void }) {
  const [pool] = useState(() => shuffle(WORDS).slice(0, 6));
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [done, setDone] = useState(false);
  const { speak } = useSpeech();

  const words = pool;
  const emojis = useCallback(() => shuffle(pool), []);
  const [emojiOrder] = useState(emojis);

  const handleWord = (id: string) => {
    if (matched.has(id)) return;
    setSelectedWord(id);
    speak(pool.find(w => w.id === id)!.pronunciation);
  };

  const handleEmoji = (id: string) => {
    if (matched.has(id)) return;
    if (!selectedWord) return;
    if (selectedWord === id) {
      playChime();
      setFlash({ id, ok: true });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 300);
      const newMatched = new Set([...matched, id]);
      setMatched(newMatched);
      setSelectedWord(null);
      const newScore = score + 1;
      setScore(newScore);
      if (newMatched.size === pool.length) {
        playSuccess();
        setTimeout(() => { setDone(true); onComplete(Math.round((newScore / pool.length) * 100)); }, 800);
      }
    } else {
      playWrong();
      setFlash({ id, ok: false });
      setSelectedWord(null);
    }
    setTimeout(() => setFlash(null), 500);
  };

  if (done) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      <ConfettiBurst active={confetti} />
      <div className="flex justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">Matched: {matched.size} / {pool.length}</span>
        <span className="font-english font-bold text-yellow-600">{score} ⭐</span>
      </div>
      <p className="font-english text-gray-500 text-sm text-center">Tap a Hebrew word, then tap the matching picture!</p>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        <div className="flex flex-col gap-3">
          <p className="font-english font-bold text-gray-500 text-xs text-center">Hebrew Words</p>
          {words.map(w => (
            <button key={w.id} onClick={() => handleWord(w.id)} disabled={matched.has(w.id)}
              className={`tap-target bg-white rounded-2xl border-4 py-3 px-4 font-hebrew text-3xl transition-all
                ${matched.has(w.id) ? 'opacity-30 border-gray-200' : selectedWord === w.id ? 'border-yellow-400 bg-yellow-50 scale-105 shadow-lg' : 'border-transparent shadow-md hover:border-blue-200 hover:scale-105'}`}
              dir="rtl">{w.hebrew}</button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-english font-bold text-gray-500 text-xs text-center">Pictures</p>
          {emojiOrder.map(w => (
            <button key={w.id} onClick={() => handleEmoji(w.id)} disabled={matched.has(w.id)}
              className={`tap-target bg-white rounded-2xl border-4 py-3 px-4 text-4xl transition-all
                ${matched.has(w.id) ? 'opacity-30 border-gray-200' : flash?.id === w.id ? (flash.ok ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-transparent shadow-md hover:border-blue-200 hover:scale-105'}`}>
              {w.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── WordGames wrapper ─────────────────────────────────────────────────────────

interface Props {
  onComplete: (score: number, stars: number) => void;
}

type SubGame = 'hear' | 'spell' | 'match';

export default function WordGames({ onComplete }: Props) {
  const [subGame, setSubGame] = useState<SubGame>('hear');
  const [scores, setScores] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const handleSubComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    if (subGame === 'hear') setSubGame('spell');
    else if (subGame === 'spell') setSubGame('match');
    else {
      const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      const stars = avg >= 90 ? 3 : avg >= 70 ? 2 : avg >= 50 ? 1 : 0;
      setFinalStars(stars);
      setConfetti(true);
      setShowModal(true);
    }
  };

  const subLabels: Record<SubGame, string> = { hear: 'Hear & Pick', spell: 'Spell It', match: 'Picture Match' };
  const subOrder: SubGame[] = ['hear', 'spell', 'match'];

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />

      <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm">
        {subOrder.map((g, i) => (
          <div key={g} className={`flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-english font-bold transition-all
            ${subGame === g ? 'bg-yellow-400 text-white' : i < subOrder.indexOf(subGame) ? 'text-green-600' : 'text-gray-400'}`}>
            {i < subOrder.indexOf(subGame) ? '✓ ' : ''}{subLabels[g]}
          </div>
        ))}
      </div>

      {subGame === 'hear' && <GameHearWord onComplete={handleSubComplete} />}
      {subGame === 'spell' && <GameSpellIt onComplete={handleSubComplete} />}
      {subGame === 'match' && <GamePictureMatch onComplete={handleSubComplete} />}

      <RewardModal
        stars={finalStars}
        message={ENCOURAGING[Math.floor(Math.random() * ENCOURAGING.length)]}
        show={showModal}
        onClose={() => {
          setShowModal(false);
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          onComplete(avg, finalStars);
        }}
      />
    </div>
  );
}
