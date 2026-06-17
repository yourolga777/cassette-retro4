import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export function ReviewCard({ name, role, text, rating }: ReviewCardProps) {
  return (
    <div className="bg-white border border-border p-6 md:p-8">
      <div className="flex items-center gap-1 mb-4 star-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < rating ? "currentColor" : "none"}
            stroke={i < rating ? "currentColor" : "currentColor"}
            className={i < rating ? "" : "text-border"}
          />
        ))}
      </div>
      <p className="text-sm text-muted leading-relaxed mb-6">
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
          <span className="font-heading text-sm font-semibold text-primary">
            {name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{name}</p>
          <p className="text-xs text-muted">{role}</p>
        </div>
      </div>
    </div>
  );
}
