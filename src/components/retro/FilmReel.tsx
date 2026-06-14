interface FilmReelProps {
  className?: string;
  size?: number;
}

export function FilmReel({ className = "", size = 40 }: FilmReelProps) {
  return (
    <div
      className={`reel ${className}`}
      style={{ width: size, height: size }}
      aria-label="Загрузка"
    />
  );
}
