import { useState, useEffect, useRef } from 'react';
import type { Letter } from '../data/letters';
import { useSpeech } from '../hooks/useSpeech';
import { playChime, playWrong } from './AudioHelper';
import RewardModal from './RewardModal';

const ENCOURAGING = [
  'כל הכבוד! Well done!',
  'ממש נחמד! Amazing!',
  'אתה מלא כוחות! You\'re a star!',
  'יופי! Beautiful!',
  'מצוין! Excellent!',
];

interface Props {
  letters: Letter[];
  level: 'level1' | 'level2' | 'level3';
  onComplete: (score: number, stars: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const POOL_SIZE = 10;

export default function GameHearAndPick({ letters, level, onComplete }: Props) {
  const { speak } = useSpeech();
  const useCursive = level === 'level2';

  // Queue: queue[0] is always the current question.
  // Correct → remove from front. Wrong → move from front to back.
  const [queue, setQueue] = useState<Letter[]>(() =>
    shuffle(letters).slice(0, Math.min(letters.length, POOL_SIZE))
  );
  const [totalCount] = useState(Math.min(letters.length, POOL_SIZE));
  const seenRef = useRef<Set<string>>(new Set());
  const firstTryRef = useRef(0);

  const [choices, setChoices] = useState<Letter[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [shaking, setShaking] = useState<string | null>(null);
  const [showBurst, setShowBurst] = useState<string | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [message, setMessage] = useState('');

  const mastered = totalCount - queue.length;

  // Re-generate choices and speak whenever we move to a new round
  useEffect(() => {
    const cur = queue[0];
    if (!cur) return;
    const wrong = shuffle(letters.filter(l => l.id !== cur.id)).slice(0, 3);
    setChoices(shuffle([cur, ...wrong]));
    setSelected(null);
    setShowBurst(null);
    setTimeout(() => speak(cur.pronunciation), 300);
  }, [roundKey]);

  const handlePick = (letter: Letter) => {
    if (selected || !queue[0]) return;
    const current = queue[0];
    setSelected(letter.id);

    const isFirstSeen = !seenRef.current.has(current.id);
    seenRef.current.add(current.id);

    if (letter.id === current.id) {
      playChime();
      setShowBurst(letter.id);
      if (isFirstSeen) firstTryRef.current += 1;

      if (queue.length === 1) {
        // Last one — all mastered!
        const pct = Math.round((firstTryRef.current / totalCount) * 100);
        const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
        setFinalStars(stars);
        setMessage(ENCOURAGING[Math.floor(Math.random() * ENCOURAGING.length)]);
        setTimeout(() => { setQueue([]); setShowModal(true); }, 900);
      } else {
        setTimeout(() => {
          setQueue(prev => prev.slice(1));
          setRoundKey(k => k + 1);
        }, 800);
      }
    } else {
      playWrong();
      setShaking(letter.id);
      setTimeout(() => setShaking(null), 500);
      // Move to end of queue
      setTimeout(() => {
        setQueue(prev => [...prev.slice(1), prev[0]]);
        setRoundKey(k => k + 1);
      }, 900);
    }
  };

  const handleFinish = () => {
    const pct = Math.round((firstTryRef.current / totalCount) * 100);
    onComplete(pct, finalStars);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">
          ✓ {mastered} / {totalCount} mastered
        </span>
        {queue.length > totalCount - mastered && (
          <span className="font-english text-sm text-orange-500 font-bold">🔄 reviewing</span>
        )}
      </div>

      <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(mastered / totalCount) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md text-center">
        <p className="font-english text-gray-500 text-sm mb-1">Tap the letter you hear!</p>
        <button
          onClick={() => queue[0] && speak(queue[0].pronunciation)}
          className="tap-target bg-gradient-to-r from-blue-400 to-blue-500 text-white font-english font-bold text-xl px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
        >
          <span className="text-2xl">🔊</span>
          Listen Again
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {choices.map(letter => {
          const isCorrect = selected === letter.id && letter.id === queue[0]?.id;
          const isWrong = selected === letter.id && letter.id !== queue[0]?.id;
          const reveal = selected && selected !== queue[0]?.id && letter.id === queue[0]?.id;
          return (
            <button
              key={letter.id}
              onClick={() => handlePick(letter)}
              disabled={!!selected}
              className={`
                tap-target relative flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-md
                transition-all duration-200 hover:scale-105 active:scale-95 border-4
                ${isCorrect ? 'border-green-400 bg-green-50 scale-105' : ''}
                ${isWrong ? 'border-red-400 bg-red-50' : ''}
                ${reveal ? 'border-green-400 bg-green-50' : ''}
                ${!selected ? 'border-transparent hover:border-blue-200' : ''}
                ${shaking === letter.id ? 'animate-shake' : ''}
              `}
            >
              {showBurst === letter.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl animate-star-burst">⭐</div>
                </div>
              )}
              <span
                className={`${useCursive ? 'font-hebrew-cursive' : 'font-hebrew'} text-6xl leading-tight`}
                dir="rtl"
              >
                {useCursive ? letter.hebrewCursive : letter.hebrew}
              </span>
              <span className="font-english text-xs text-gray-400 mt-2">{letter.phonetic}</span>
            </button>
          );
        })}
      </div>

      <RewardModal
        stars={finalStars}
        message={message}
        show={showModal}
        onClose={handleFinish}
      />
    </div>
  );
}
