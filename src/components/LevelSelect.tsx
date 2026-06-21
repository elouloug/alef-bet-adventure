import type { GameProgress } from '../hooks/useScore';

interface Props {
  progress: GameProgress;
  onSelect: (level: 1 | 2 | 3) => void;
}

const LEVELS = [
  {
    num: 1 as const,
    title: 'Block Letters',
    titleHebrew: 'דפוס',
    desc: 'Learn the printed Hebrew alphabet',
    emoji: '🌱',
    badge: '🌱',
    color: 'from-yellow-400 to-orange-400',
    border: 'border-yellow-300',
    bg: 'bg-yellow-50',
    unlocked: true,
  },
  {
    num: 2 as const,
    title: 'Cursive Letters',
    titleHebrew: 'כתב יד',
    desc: 'Learn handwritten Hebrew letters',
    emoji: '🌟',
    badge: '🌟',
    color: 'from-blue-400 to-cyan-400',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    unlocked: false,
  },
  {
    num: 3 as const,
    title: 'Hebrew Words',
    titleHebrew: 'מילים',
    desc: 'Read and spell short Hebrew words',
    emoji: '🏆',
    badge: '🏆',
    color: 'from-purple-400 to-pink-400',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    unlocked: false,
  },
];

function StarRow({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-xl ${i < count ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
      ))}
    </div>
  );
}

export default function LevelSelect({ progress, onSelect }: Props) {
  const levelKeys = ['level1', 'level2', 'level3'] as const;

  const isUnlocked = (_num: 1 | 2 | 3) => true;

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-md mx-auto w-full">
      <div className="text-center">
        <h2 className="font-english font-bold text-2xl text-gray-700">Choose your level!</h2>
        <p className="font-english text-gray-500 text-sm mt-1">Complete each level to unlock the next 🔓</p>
      </div>

      {LEVELS.map(level => {
        const unlocked = isUnlocked(level.num);
        const prog = progress[levelKeys[level.num - 1]];
        return (
          <button
            key={level.num}
            onClick={() => unlocked && onSelect(level.num)}
            disabled={!unlocked}
            className={`w-full rounded-3xl p-5 border-4 shadow-lg transition-all text-left cursor-pointer
              ${level.bg} ${level.border} hover:scale-105 active:scale-98 hover:shadow-xl
              ${prog.completed ? 'ring-4 ring-green-300' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                <span className="text-4xl">{level.badge}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-english font-bold text-xl text-gray-800">Level {level.num}:</span>
                  <span className="font-english font-bold text-xl text-gray-800">{level.title}</span>
                  <span className="font-hebrew font-bold text-lg text-gray-600" dir="rtl">{level.titleHebrew}</span>
                </div>
                <p className="font-english text-gray-500 text-sm mt-0.5">{level.desc}</p>
                {unlocked && (
                  <div className="mt-2 flex items-center gap-3">
                    <StarRow count={prog.stars} />
                    {prog.completed && <span className="font-english text-xs font-bold text-green-600">✓ Completed!</span>}
                    {prog.score > 0 && <span className="font-english text-xs text-gray-400">Best: {prog.score}%</span>}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
