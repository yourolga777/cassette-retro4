"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Suggestion {
  name: string;
  slug: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions?.names || []);
          setShowSuggestions(true);
        }
      } catch {
        // ignore
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetch("/api/search/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      }).catch(() => {});
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Поиск..."
          className="w-32 sm:w-48 bg-wood/5 border border-wood/20 rounded px-2.5 py-1.5 font-mono text-xs text-wood/80 placeholder-wood/30 outline-none focus:border-neon/50 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-wood/30 hover:text-neon transition-colors"
        >
          <Search size={14} />
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-paper border-2 border-wood/20 z-50 max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.slug}
              onMouseDown={() => handleSelect(s.name)}
              className="w-full text-left px-3 py-2 font-mono text-xs text-wood/70 hover:bg-wood/5 transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
