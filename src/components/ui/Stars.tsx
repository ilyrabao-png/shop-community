export interface StarsProps {
  rating: number;
  /** Optional review count to display, e.g. "(12)" */
  count?: number;
  /** Size: sm | md */
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
};

export function Stars({ rating, count, size = "sm" }: StarsProps) {
  const stars = Math.round(Math.min(5, Math.max(0, rating)) * 2) / 2; // 0-5, half steps
  const full = Math.floor(stars);
  const half = stars % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClasses[size]}`} aria-label={`${stars} sao${count != null ? `, ${count} đánh giá` : ""}`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f-${i}`} className="text-amber-500">★</span>
      ))}
      {half ? <span className="text-amber-500 opacity-70">★</span> : null}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e-${i}`} className="text-amber-200">★</span>
      ))}
      {count != null ? (
        <span className="ml-1 text-green-900/60">({count})</span>
      ) : null}
    </span>
  );
}
