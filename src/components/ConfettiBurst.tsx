import { useEffect, useState } from 'react';

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
}

const COLORS = ['#FFD93D', '#FF6B6B', '#6BCBF7', '#A8E6CF', '#FF9F43', '#C44569', '#786FA6'];

interface Props {
  active: boolean;
  onDone?: () => void;
}

export default function ConfettiBurst({ active, onDone }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 8 + Math.random() * 8,
      duration: 1.5 + Math.random() * 1,
      delay: Math.random() * 0.5,
      rotate: Math.random() * 360,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => { setPieces([]); onDone?.(); }, 3000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!pieces.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
