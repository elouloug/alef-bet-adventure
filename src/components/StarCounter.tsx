interface Props {
  count: number;
}

export default function StarCounter({ count }: Props) {
  return (
    <div className="flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-300 rounded-full px-3 py-1">
      <span className="text-xl">⭐</span>
      <span className="font-english font-bold text-yellow-700 text-lg">{count}</span>
    </div>
  );
}
