import { useState, useEffect, useCallback } from 'react';
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

const ROUNDS = 10;

export default function GameHearAndPick({ letters, level, onComplete }: Props) {
  const { speak } = useSpeech();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState<Letter[]>([]);
  const [target, setTarget] = useState<Letter | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [shaking, setShaking] = useState<string | null>(null);
  const [showBurst, setShowBurst] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [message, setMessage] = useState('');
  const [played, setPlayed] = useState<Set<string>>(new Set());

  const useCursive = level === 'level2';

  const nextRound = useCallback((prevScore: number, prevRound: number, usedIds: Set<string>) => {
    if (prevRound >= ROUNDS) {
      const pct = Math.round((prevScore / ROUNDS) * 100);
      const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
      setFinalStars(stars);
      setMessage(ENCOURAGING[Math.floor(Math.random() * ENCOURAGING.length)]);
      setShowModal(true);
      return;
    }
    const available = letters.filter(l => !usedIds.has(l.id));
    const pool = available.length >= 4 ? available : letters;
    const shuffled = shuffle(pool);
    const t = shuffled[0];
    const wrong = shuffle(letters.filter(l => l.id !== t.id)).slice(0, 3);
    setTarget(t);
    setChoices(shuffle([t, ...wrong]));
    setSelected(null);
    setShowBurst(null);
    setTimeout(() => speak(t.pronunciation), 300);
  }, [letters, speak]);

  useEffect(() => {
    nextRound(0, 0, new Set());
  }, []);

  const handlePick = (letter: Letter) => {
    if (selected) return;
    setSelected(letter.id);
    if (letter.id === target?.id) {
      playChime();
      setShowBurst(letter.id);
      const newScore = score + 1;
      setScore(newScore);
      const newPlayed = new Set([...played, target.id]);
      setPlayed(newPlayed);
      setTimeout(() => nextRound(newScore, round + 1, newPlayed), 900);
      setRound(r => r + 1);
    } else {
      playWrong();
      setShaking(letter.id);
      setTimeout(() => setShaking(null), 500);
      const newPlayed = new Set([...played, target?.id ?? '']);
      setPlayed(newPlayed);
      setTimeout(() => nextRound(score, round + 1, newPlayed), 900);
      setRound(r => r + 1);
    }
  };

  const handleFinish = () => {
    const pct = Math.round((score / ROUNDS) * 100);
    onComplete(pct, finalStars);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">Round {Math.min(round + 1, ROUNDS)} / {ROUNDS}</span>
        <span className="font-english font-bold text-yellow-600">Score: {score} ⭐</span>
      </div>

      <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(round / ROUNDS) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md text-center">
        <p className="font-english text-gray-500 text-sm mb-1">Tap the letter you hear!</p>
        <button
          onClick={() => target && speak(target.pronunciation)}
          className="tap-target bg-gradient-to-r from-blue-400 to-blue-500 text-white font-english font-bold text-xl px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
        >
          <span className="text-2xl">🔊</span>
          Listen Again
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {choices.map(letter => {
          const isCorrect = selected === letter.id && letter.id === target?.id;
          const isWrong = selected === letter.id && letter.id !== target?.id;
          const isTarget = selected && selected !== target?.id && letter.id === target?.id;
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
                ${isTarget ? 'border-green-400 bg-green-50' : ''}
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
                className="font-hebrew text-6xl leading-tight"
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
