const BARS = 12;

interface EqualizerBarsProps {
  className?: string;
}

export function EqualizerBars({ className = "" }: EqualizerBarsProps) {
  return (
    <div className={`flex items-end gap-[3px] h-8 ${className}`} aria-hidden>
      {Array.from({ length: BARS }).map((_, i) => (
        <div
          key={i}
          className="eq-bar"
          style={
            {
              "--duration": `${1 + Math.random() * 0.8}s`,
              "--delay": `${i * 0.08}s`,
              height: `${20 + Math.random() * 60}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
