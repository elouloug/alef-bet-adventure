import { useEffect } from 'react';
import ConfettiBurst from './ConfettiBurst';

interface Props {
  stars: number;
  message: string;
  onClose: () => void;
  show: boolean;
}

const STAR_LABELS = ['Keep trying! 💪', 'Good effort! 👍', 'Great job! 🌟', 'Amazing! 🏆'];

export default function RewardModal({ stars, message, onClose, show }: Props) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <ConfettiBurst active={stars >= 2} />
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
          <div className="text-6xl mb-4">{stars === 3 ? '🏆' : stars === 2 ? '🌟' : stars === 1 ? '⭐' : '💪'}</div>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <span key={i} className={`text-4xl transition-all duration-300 ${i <= stars ? 'opacity-100 scale-110' : 'opacity-30'}`}>⭐</span>
            ))}
          </div>
          <p className="font-english font-bold text-2xl text-gray-800 mb-2">{STAR_LABELS[stars]}</p>
          <p className="font-english text-lg text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-english font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Continue! →
          </button>
        </div>
      </div>
    </>
  );
}
