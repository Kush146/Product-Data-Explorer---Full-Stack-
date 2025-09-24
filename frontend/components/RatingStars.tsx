export default function RatingStars({ value = 0 }: { value?: number }) {
  const full = Math.round(value);
  return (
    <div role="img" aria-label={`Rating ${value} out of 5`} className="text-yellow-500">
      {"★★★★★".slice(0, full)}<span className="text-gray-300">{"★★★★★".slice(full)}</span>
    </div>
  );
}
