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

  const [queue, setQueue] = useState<Letter[]>(() =>
    shuffle(letters).slice(0, Math.min(letters.length, POOL_SIZE))
  );
  const [totalCount] = useState(Math.min(letters.length, POOL_SIZE));
  const seenRef = useRef<Set<string>>(new Set());
  const firstTryRef = useRef(0);
  const hadMistakeRef = useRef(false);

  const [choices, setChoices] = useState<Letter[]>([]);
  const [correctId, setCorrectId] = useState<string | null>(null); // set only on correct tap
  const [shaking, setShaking] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false); // briefly blocks input after wrong tap
  const [, setShowBurst] = useState<string | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [message, setMessage] = useState('');

  const mastered = totalCount - queue.length;

  // Set up new choices whenever we move to a new letter
  useEffect(() => {
    const cur = queue[0];
    if (!cur) return;
    const wrong = shuffle(letters.filter(l => l.id !== cur.id)).slice(0, 3);
    setChoices(shuffle([cur, ...wrong]));
    setCorrectId(null);
    setShowBurst(null);
    hadMistakeRef.current = false;
    setTimeout(() => speak(cur.pronunciation), 300);
  }, [roundKey]);

  const handlePick = (letter: Letter) => {
    if (correctId || isAnimating || !queue[0]) return;
    const current = queue[0];

    if (letter.id === current.id) {
      // ✓ Correct
      playChime();
      setShowBurst(letter.id);
      setCorrectId(letter.id);

      const isFirstSeen = !seenRef.current.has(current.id);
      seenRef.current.add(current.id);
      if (!hadMistakeRef.current && isFirstSeen) firstTryRef.current += 1;

      const advance = () => {
        if (hadMistakeRef.current) {
          // Had mistakes this round → send to end for one more clean pass
          if (queue.length === 1) {
            finish();
          } else {
            setQueue(prev => [...prev.slice(1), prev[0]]);
            setRoundKey(k => k + 1);
          }
        } else {
          // Clean → mastered
          if (queue.length === 1) {
            finish();
          } else {
            setQueue(prev => prev.slice(1));
            setRoundKey(k => k + 1);
          }
        }
      };

      setTimeout(advance, 900);
    } else {
      // ✗ Wrong — shake and stay on the same letter
      playWrong();
      hadMistakeRef.current = true;
      seenRef.current.add(current.id);
      setShaking(letter.id);
      setIsAnimating(true);
      setTimeout(() => {
        setShaking(null);
        setIsAnimating(false);
      }, 500);
    }
  };

  const finish = () => {
    const pct = Math.round((firstTryRef.current / totalCount) * 100);
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    setFinalStars(stars);
    setMessage(ENCOURAGING[Math.floor(Math.random() * ENCOURAGING.length)]);
    setQueue([]);
    setShowModal(true);
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
          const isCorrect = correctId === letter.id;
          const isWrong = shaking === letter.id;
          return (
            <button
              key={letter.id}
              onClick={() => handlePick(letter)}
              disabled={!!correctId || isAnimating}
              className={`
                tap-target relative flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-md
                transition-all duration-200 border-4
                ${isCorrect ? 'border-green-400 bg-green-50 scale-105' : ''}
                ${isWrong ? 'border-red-400 bg-red-50 animate-shake' : ''}
                ${!correctId && !isWrong ? 'border-transparent hover:border-blue-200 hover:scale-105 active:scale-95' : ''}
              `}
            >
              {isCorrect && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
