"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function StarRating({ rating, interactive, onChange }: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`text-lg ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform ${
            star <= rating ? "text-yellow-400" : "text-wood/20"
          }`}
        >
          {star <= rating ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

function StarsDisplay({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
      <span className="text-wood/40 text-xs ml-1">({rating.toFixed(1)})</span>
    </span>
  );
}

interface Review {
  id: number;
  text: string;
  rating: number;
  helpfulCount: number;
  createdAt: string;
  user: { name: string | null } | null;
}

interface ReviewData {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
}

export function ReviewSection({ productId }: { productId: number }) {
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [reportText, setReportText] = useState<Record<number, string>>({});
  const [reportMsg, setReportMsg] = useState<Record<number, string>>({});

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error("Failed to fetch reviews", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    fetch("/api/auth/me").then(async (r) => {
      if (r.ok) {
        const u = await r.json();
        setUserName(u.name);
        const checkRes = await fetch(`/api/reviews/check?productId=${productId}`);
        if (checkRes.ok) {
          const data = await checkRes.json();
          setCanReview(data.canReview);
        }
      }
    });
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!newText.trim()) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, text: newText, rating: newRating }),
    });
    const d = await res.json();
    if (res.ok) {
      setSuccess("Отзыв отправлен на модерацию");
      setNewText("");
      setFormVisible(false);
    } else {
      setError(d.error || "Ошибка");
    }
    setSubmitting(false);
  };

  const handleLike = async (reviewId: number) => {
    const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" });
    if (res.ok) {
      const d = await res.json();
      setLikes((prev) => ({ ...prev, [reviewId]: d.liked }));
      fetchReviews();
    } else if (res.status === 401) {
      router.push("/login");
    }
  };

  const handleReport = async (reviewId: number) => {
    const reason = reportText[reviewId];
    if (!reason?.trim()) return;
    const res = await fetch(`/api/reviews/${reviewId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      setReportMsg((prev) => ({ ...prev, [reviewId]: "Жалоба отправлена" }));
      setReportText((prev) => ({ ...prev, [reviewId]: "" }));
    } else if (res.status === 401) {
      router.push("/login");
    }
  };

  if (loading && !data) {
    return <div className="mt-12"><div className="reel" /></div>;
  }

  return (
    <div className="mt-12 border-t-2 border-wood/10 pt-8">
      <h2 className="font-heading text-2xl text-wood font-bold mb-6">Отзывы</h2>

      {data && (
        <div className="flex items-center gap-4 mb-8">
          <div className="text-4xl font-heading text-wood font-bold">
            {data.averageRating.toFixed(1)}
          </div>
          <div>
            <StarsDisplay rating={data.averageRating} />
            <p className="font-mono text-xs text-wood/40 mt-1">
              {data.totalCount} {data.totalCount === 1 ? "отзыв" : data.totalCount < 5 ? "отзыва" : "отзывов"}
            </p>
          </div>
        </div>
      )}

      {data?.reviews.map((review) => (
        <div key={review.id} className="border-2 border-wood/10 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-heading text-sm text-wood font-semibold">
                {review.user?.name || "Аноним"}
              </span>
              <StarRating rating={review.rating} />
            </div>
            <span className="font-mono text-[10px] text-wood/30">
              {new Date(review.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
          <p className="font-mono text-sm text-wood/70 mb-3">{review.text}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(review.id)}
              className={`font-mono text-xs transition-colors ${
                likes[review.id] ? "text-neon" : "text-wood/40 hover:text-wood/70"
              }`}
            >
              👍 {review.helpfulCount}
            </button>
            <div className="relative group">
              <button className="font-mono text-xs text-wood/30 hover:text-neon transition-colors">
                Пожаловаться
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-paper border-2 border-wood/20 p-3 hidden group-hover:block z-10">
                <textarea
                  value={reportText[review.id] || ""}
                  onChange={(e) => setReportText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                  className="retro-input text-xs mb-2"
                  placeholder="Причина жалобы"
                  rows={2}
                />
                <button
                  onClick={() => handleReport(review.id)}
                  className="font-mono text-xs text-neon hover:underline"
                >
                  Отправить
                </button>
                {reportMsg[review.id] && (
                  <p className="font-mono text-xs text-green-500 mt-1">{reportMsg[review.id]}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {data && data.reviews.length === 0 && (
        <p className="font-mono text-sm text-wood/40 text-center py-8">Пока нет отзывов</p>
      )}

      <div className="mt-8">
        {!formVisible ? (
          <button
            onClick={async () => {
              const me = await fetch("/api/auth/me");
              if (!me.ok) return router.push("/login");
              if (canReview === false) {
                setError("Вы не покупали этот товар");
                return;
              }
              setFormVisible(true);
              setError("");
            }}
            className="retro-btn retro-btn--neon text-sm"
          >
            Написать отзыв
          </button>
        ) : (
          <div className="border-2 border-wood/10 p-4">
            <h3 className="font-heading text-sm text-wood font-semibold mb-3">Ваш отзыв</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-wood/60">Оценка:</span>
              <StarRating rating={newRating} interactive onChange={setNewRating} />
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="retro-input mb-3"
              placeholder="Поделитесь впечатлениями о товаре..."
              rows={3}
            />
            {error && <p className="font-mono text-xs text-neon mb-2">{error}</p>}
            {success && <p className="font-mono text-xs text-green-500 mb-2">{success}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !newText.trim()}
                className="retro-btn retro-btn--neon text-sm"
              >
                {submitting ? "Отправка..." : "Отправить на модерацию"}
              </button>
              <button
                onClick={() => { setFormVisible(false); setError(""); setSuccess(""); }}
                className="retro-btn retro-btn--ghost text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
