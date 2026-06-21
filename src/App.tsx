import { useState } from 'react';
import { LEVEL1_LETTERS, LEVEL2_LETTERS } from './data/letters';
import { useScore } from './hooks/useScore';
import StarCounter from './components/StarCounter';
import LevelSelect from './components/LevelSelect';
import GameHearAndPick from './components/GameHearAndPick';
import GameTrace from './components/GameTrace';
import GameMatch from './components/GameMatch';
import WordGames from './components/WordGames';
import ConfettiBurst from './components/ConfettiBurst';

type Screen =
  | { type: 'home' }
  | { type: 'level-select' }
  | { type: 'game'; level: 1 | 2 | 3; game: 1 | 2 | 3 }
  | { type: 'level-complete'; level: 1 | 2 | 3; stars: number };

const GAME_NAMES = ['Hear & Pick', 'Trace It', 'Match It'];

export default function App() {
  const { progress, updateLevel, addStars } = useScore();
  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const [levelStars, setLevelStars] = useState<number[]>([]);
  const [confetti, setConfetti] = useState(false);

  const go = (s: Screen) => setScreen(s);

  const handleGameComplete = (level: 1 | 2 | 3, game: 1 | 2 | 3, score: number, stars: number) => {
    const newStars = [...levelStars, stars];
    setLevelStars(newStars);
    addStars(stars);

    if (game < 3) {
      go({ type: 'game', level, game: (game + 1) as 1 | 2 | 3 });
    } else {
      const avgScore = Math.round(newStars.reduce((a, b) => a + b, 0) / newStars.length * 33);
      const levelKey = `level${level}` as 'level1' | 'level2' | 'level3';
      const finalStars = updateLevel(levelKey, Math.max(score, avgScore));
      setConfetti(true);
      go({ type: 'level-complete', level, stars: finalStars });
    }
  };

  const startLevel = (level: 1 | 2 | 3) => {
    setLevelStars([]);
    go({ type: 'game', level, game: 1 });
  };

  if (screen.type === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center animate-float">
          <div className="text-8xl mb-4">🌟</div>
          <h1 className="font-english font-black text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-2">
            Alef-Bet
          </h1>
          <h1 className="font-english font-black text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
            Adventure
          </h1>
          <p className="font-hebrew text-3xl text-gray-600 mt-2" dir="rtl">אָלֶף-בֵּית</p>
          <p className="font-english text-gray-500 mt-3 text-lg">Learn Hebrew letters the fun way! 🎉</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => go({ type: 'level-select' })}
            className="tap-target w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-english font-black text-2xl py-5 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
          >
            Start Learning! 🚀
          </button>
          <div className="flex justify-center">
            <StarCounter count={progress.totalStars} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mt-4">
          {[['🌱', 'Block\nLetters'], ['🌟', 'Cursive\nLetters'], ['🏆', 'Hebrew\nWords']].map(([emoji, label]) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="text-3xl mb-1">{emoji}</div>
              <p className="font-english text-xs text-gray-500 whitespace-pre-line font-bold">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen.type === 'level-select') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header progress={progress} onHome={() => go({ type: 'home' })} title="Choose Level" />
        <div className="flex-1 py-4">
          <LevelSelect progress={progress} onSelect={startLevel} />
        </div>
      </div>
    );
  }

  if (screen.type === 'game') {
    const { level, game } = screen;
    const letters = level === 1 ? LEVEL1_LETTERS : LEVEL2_LETTERS;
    const gameName = level === 3 ? 'Word Games' : GAME_NAMES[game - 1];
    const levelLabel = level === 3 ? 'Hebrew Words' : `Level ${level}`;

    return (
      <div className="min-h-screen flex flex-col">
        <Header
          progress={progress}
          onHome={() => go({ type: 'home' })}
          title={level === 3 ? `${levelLabel} · ${gameName}` : `${levelLabel} · Game ${game}: ${gameName}`}
          onBack={() => go({ type: 'level-select' })}
        />
        <div className="flex-1 py-4 overflow-y-auto">
          {level !== 3 && game === 1 && (
            <GameHearAndPick
              key={`hear-${level}`}
              letters={letters}
              level={`level${level}` as 'level1' | 'level2' | 'level3'}
              onComplete={(score, stars) => handleGameComplete(level, game, score, stars)}
            />
          )}
          {level !== 3 && game === 2 && (
            <GameTrace
              key={`trace-${level}`}
              letters={letters}
              level={`level${level}` as 'level1' | 'level2'}
              onComplete={(score, stars) => handleGameComplete(level, game, score, stars)}
            />
          )}
          {level !== 3 && game === 3 && (
            <GameMatch
              key={`match-${level}`}
              letters={letters}
              level={`level${level}` as 'level1' | 'level2'}
              onComplete={(score, stars) => handleGameComplete(level, game, score, stars)}
            />
          )}
          {level === 3 && (
            <WordGames
              key="word-games"
              onComplete={(score, stars) => handleGameComplete(3, 3, score, stars)}
            />
          )}
        </div>
      </div>
    );
  }

  if (screen.type === 'level-complete') {
    const { level, stars } = screen;
    const BADGES = ['🌱', '🌟', '🏆'];
    const badge = BADGES[level - 1];
    const nextUnlocked = level < 3 && stars >= 2;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
        <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />

        <div className="animate-bounce-in">
          <div className="text-8xl mb-4">{badge}</div>
          <h2 className="font-english font-black text-4xl text-gray-800 mb-2">
            Level {level} Complete!
          </h2>
          <p className="font-english text-gray-500 text-lg">
            {stars === 3 ? 'Perfect! Amazing work! 🏆' : stars === 2 ? 'Great job! Keep it up! 🌟' : stars === 1 ? 'Good effort! Try again for more stars! 💪' : 'Keep practicing! You can do it! 💪'}
          </p>
        </div>

        <div className="flex gap-3 text-5xl">
          {[1, 2, 3].map(i => (
            <span key={i} className={`transition-all duration-500 ${i <= stars ? 'opacity-100 scale-110' : 'opacity-20'}`}>⭐</span>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-xs">
          <p className="font-english font-bold text-gray-700 mb-3">Total Stars Earned</p>
          <div className="flex justify-center">
            <StarCounter count={progress.totalStars} />
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {nextUnlocked && (
            <button
              onClick={() => { setLevelStars([]); startLevel((level + 1) as 2 | 3); }}
              className="tap-target w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-english font-black text-xl py-4 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Next Level → {BADGES[level]}
            </button>
          )}
          <button
            onClick={() => go({ type: 'level-select' })}
            className="tap-target w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-english font-bold text-xl py-4 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Level Select 📚
          </button>
          <button
            onClick={() => { setLevelStars([]); startLevel(level); }}
            className="tap-target w-full bg-white text-gray-600 font-english font-bold text-lg py-3 rounded-3xl border-2 border-gray-200 hover:border-gray-300 hover:scale-105 active:scale-95 transition-all"
          >
            Play Again 🔄
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function Header({
  progress,
  onHome,
  title,
  onBack,
}: {
  progress: ReturnType<typeof useScore>['progress'];
  onHome: () => void;
  title: string;
  onBack?: () => void;
}) {
  return (
    <header className="bg-white shadow-sm border-b-2 border-yellow-200 sticky top-0 z-30">
      <div className="max-w-md mx-auto flex items-center gap-3 p-3">
        <button
          onClick={onBack ?? onHome}
          className="tap-target w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-gray-600 font-bold text-lg flex-shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-english font-bold text-gray-700 text-sm truncate">{title}</p>
        </div>
        <button onClick={onHome} className="flex-shrink-0">
          <StarCounter count={progress.totalStars} />
        </button>
      </div>
    </header>
  );
}
