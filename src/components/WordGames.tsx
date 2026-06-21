import { useState, useEffect, useRef, useCallback } from 'react';
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
// Queue-based: wrong → moved to end, correct → removed. Done when queue empty.

function GameHearWord({ onComplete }: { onComplete: (score: number) => void }) {
  const { speak } = useSpeech();
  const POOL = 8;
  const [queue, setQueue] = useState<HebrewWord[]>(() => shuffle(WORDS).slice(0, POOL));
  const [totalCount] = useState(POOL);
  const seenRef = useRef<Set<string>>(new Set());
  const firstTryRef = useRef(0);
  const [roundKey, setRoundKey] = useState(0);
  const [choices, setChoices] = useState<HebrewWord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const mastered = totalCount - queue.length;

  useEffect(() => {
    const cur = queue[0];
    if (!cur) return;
    const others = shuffle(WORDS.filter(w => w.id !== cur.id)).slice(0, 3);
    setChoices(shuffle([cur, ...others]));
    setSelected(null);
    setTimeout(() => speak(cur.pronunciation), 300);
  }, [roundKey]);

  const handlePick = (word: HebrewWord) => {
    if (selected || !queue[0]) return;
    const current = queue[0];
    setSelected(word.id);
    const isFirstSeen = !seenRef.current.has(current.id);
    seenRef.current.add(current.id);

    if (word.id === current.id) {
      playChime();
      if (isFirstSeen) firstTryRef.current += 1;
      if (queue.length === 1) {
        const pct = Math.round((firstTryRef.current / totalCount) * 100);
        setTimeout(() => { setQueue([]); onComplete(pct); }, 800);
      } else {
        setTimeout(() => {
          setQueue(prev => prev.slice(1));
          setRoundKey(k => k + 1);
        }, 800);
      }
    } else {
      playWrong();
      setTimeout(() => {
        setQueue(prev => [...prev.slice(1), prev[0]]);
        setRoundKey(k => k + 1);
      }, 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">✓ {mastered} / {totalCount} mastered</span>
        {queue.length > totalCount - mastered && (
          <span className="font-english text-sm text-orange-500 font-bold">🔄 reviewing</span>
        )}
      </div>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(mastered / totalCount) * 100}%` }} />
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-6 text-center w-full max-w-md">
        <p className="font-english text-gray-500 text-sm mb-3">Listen and pick the correct spelling!</p>
        <button
          onClick={() => queue[0] && speak(queue[0].pronunciation)}
          className="tap-target bg-blue-500 text-white font-english font-bold text-xl px-8 py-4 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
        >
          🔊 Hear the word
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {choices.map(w => {
          const cur = queue[0];
          const isCorrect = selected === w.id && w.id === cur?.id;
          const isWrong = selected === w.id && w.id !== cur?.id;
          const reveal = selected && selected !== cur?.id && w.id === cur?.id;
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
// Wrong attempt → clear and retry immediately (same word stays at front).
// Correct with no mistakes → mastered (removed). Correct after mistake → moved to end.

function GameSpellIt({ onComplete }: { onComplete: (score: number) => void }) {
  const POOL = 6;
  const [queue, setQueue] = useState<HebrewWord[]>(() => shuffle(WORDS).slice(0, POOL));
  const [totalCount] = useState(POOL);
  const seenRef = useRef<Set<string>>(new Set());
  const firstTryRef = useRef(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [typed, setTyped] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [currentBank, setCurrentBank] = useState<string[]>([]);

  const mastered = totalCount - queue.length;
  const current = queue[0];

  const buildBank = useCallback((word: HebrewWord) => {
    const letters = Array.from(word.hebrew);
    const extras = shuffle('אבגדהוזחטיכלמנסעפצקרשת'.split('').filter(c => !letters.includes(c)))
      .slice(0, Math.max(0, 6 - letters.length));
    return shuffle([...letters, ...extras]);
  }, []);

  useEffect(() => {
    if (!queue[0]) return;
    setCurrentBank(buildBank(queue[0]));
    setTyped([]);
    setResult(null);
    setHadMistake(false);
  }, [roundKey]);

  // initialise on mount
  useEffect(() => {
    if (queue[0]) setCurrentBank(buildBank(queue[0]));
  }, []);

  if (!current) return null;
  const targetLetters = Array.from(current.hebrew);

  const addLetter = (l: string) => {
    if (typed.length >= targetLetters.length) return;
    setTyped(prev => [...prev, l]);
  };
  const removeLast = () => setTyped(prev => prev.slice(0, -1));

  const check = () => {
    const correct = typed.join('') === current.hebrew;
    if (correct) {
      playChime();
      setResult('correct');
      const isFirstSeen = !seenRef.current.has(current.id);
      seenRef.current.add(current.id);
      const masteredFirstTry = !hadMistake && isFirstSeen;
      if (masteredFirstTry) firstTryRef.current += 1;

      setTimeout(() => {
        if (masteredFirstTry || (!isFirstSeen && !hadMistake)) {
          // Mastered — remove from queue
          if (queue.length === 1) {
            const pct = Math.round((firstTryRef.current / totalCount) * 100);
            setQueue([]);
            onComplete(pct);
          } else {
            setQueue(prev => prev.slice(1));
            setRoundKey(k => k + 1);
          }
        } else {
          // Had a mistake — move to end for another round
          if (queue.length === 1) {
            // Only one word left and they got it right (after mistakes) — done
            const pct = Math.round((firstTryRef.current / totalCount) * 100);
            setQueue([]);
            onComplete(pct);
          } else {
            setQueue(prev => [...prev.slice(1), prev[0]]);
            setRoundKey(k => k + 1);
          }
        }
      }, 900);
    } else {
      playWrong();
      setResult('wrong');
      setHadMistake(true);
      setTimeout(() => {
        setTyped([]);
        setResult(null);
      }, 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">✓ {mastered} / {totalCount} mastered</span>
        {queue.length > totalCount - mastered && (
          <span className="font-english text-sm text-orange-500 font-bold">🔄 reviewing</span>
        )}
      </div>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(mastered / totalCount) * 100}%` }} />
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
  const [emojiOrder] = useState(() => shuffle(pool));

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
          {pool.map(w => (
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
