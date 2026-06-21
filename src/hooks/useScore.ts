import { useState, useEffect } from 'react';

export interface LevelProgress {
  stars: number;
  completed: boolean;
  score: number;
}

export interface GameProgress {
  level1: LevelProgress;
  level2: LevelProgress;
  level3: LevelProgress;
  totalStars: number;
}

const DEFAULT_PROGRESS: GameProgress = {
  level1: { stars: 0, completed: false, score: 0 },
  level2: { stars: 0, completed: false, score: 0 },
  level3: { stars: 0, completed: false, score: 0 },
  totalStars: 0,
};

const STORAGE_KEY = 'alef-bet-progress';

export function useScore() {
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const updateLevel = (level: 'level1' | 'level2' | 'level3', score: number) => {
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    const completed = score >= 70;
    setProgress(prev => {
      const newProg = {
        ...prev,
        [level]: { stars: Math.max(prev[level].stars, stars), completed: prev[level].completed || completed, score: Math.max(prev[level].score, score) },
      };
      newProg.totalStars = newProg.level1.stars + newProg.level2.stars + newProg.level3.stars;
      return newProg;
    });
    return stars;
  };

  const addStars = (count: number) => {
    setProgress(prev => ({ ...prev, totalStars: prev.totalStars + count }));
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
  };

  return { progress, updateLevel, addStars, resetProgress };
}
