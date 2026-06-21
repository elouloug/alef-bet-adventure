import { useRef, useState, useEffect, useCallback } from 'react';
import type { Letter } from '../data/letters';
import { useSpeech } from '../hooks/useSpeech';
import { playChime } from './AudioHelper';

interface Props {
  letters: Letter[];
  level: 'level1' | 'level2';
  onComplete: (score: number, stars: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function GameTrace({ letters, level, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDraw, setHasDraw] = useState(false);
  const [showGreat, setShowGreat] = useState(false);
  const [letterQueue] = useState<Letter[]>(() => shuffle(letters).slice(0, 8));
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const { speak } = useSpeech();

  const useCursive = level === 'level2';
  const current = letterQueue[idx];

  const drawGhost = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `bold ${canvas.height * 0.7}px "Noto Sans Hebrew", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(107, 203, 247, 0.25)';
    ctx.fillText(useCursive ? current.hebrewCursive : current.hebrew, canvas.width / 2, canvas.height / 2);
  }, [current, useCursive]);

  useEffect(() => { drawGhost(); }, [drawGhost]);

  useEffect(() => {
    if (current) {
      setTimeout(() => speak(current.pronunciation), 200);
    }
  }, [current]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setDrawing(true);
    setHasDraw(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDraw(false);
    drawGhost();
  };

  const handleDone = () => {
    if (!hasDraw) return;
    playChime();
    setShowGreat(true);
    setTimeout(() => {
      setShowGreat(false);
      if (idx + 1 >= letterQueue.length) {
        setDone(true);
        onComplete(100, 3);
      } else {
        setIdx(i => i + 1);
        setHasDraw(false);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, 1500);
  };

  if (done) return null;

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <span className="font-english font-bold text-gray-600">Letter {idx + 1} / {letterQueue.length}</span>
        <button
          onClick={() => speak(current.pronunciation)}
          className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-english font-bold px-4 py-2 rounded-full transition-all"
        >
          🔊 Hear it
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 text-center w-full max-w-md">
        <div className="text-8xl font-hebrew leading-none mb-1" dir="rtl">
          {useCursive ? current.hebrewCursive : current.hebrew}
        </div>
        <p className="font-english font-bold text-2xl text-gray-700">{current.name}</p>
        <p className="font-english text-gray-400 text-sm">{current.phonetic}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-md">
        <p className="font-english text-gray-500 text-sm text-center mb-3">Trace the letter below 👇</p>
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full rounded-2xl bg-yellow-50 border-2 border-yellow-200 cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="flex gap-3 mt-3">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-english font-bold py-3 rounded-2xl transition-all"
          >
            🗑️ Clear
          </button>
          <button
            onClick={handleDone}
            disabled={!hasDraw}
            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 disabled:opacity-40 text-white font-english font-bold py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            ✓ Done!
          </button>
        </div>
      </div>

      {showGreat && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 text-center animate-bounce-in">
            <div className="text-6xl mb-2">⭐</div>
            <p className="font-english font-bold text-3xl text-green-600">Great job!</p>
          </div>
        </div>
      )}
    </div>
  );
}
