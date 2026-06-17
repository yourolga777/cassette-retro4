"use client";

import { useState, useCallback } from "react";
import { EqualizerBars } from "./EqualizerBars";

function Reel({ spinning }: { spinning: boolean }) {
  return (
    <div className={`relative w-16 h-16 ${spinning ? "animate-reel-spin" : ""}`}>
      <div className="absolute inset-0 rounded-full border-2 border-brass/50" />
      <div className="absolute inset-2 rounded-full border border-brass/20" />
      <div className="absolute inset-3 flex items-center justify-center">
        <div className="absolute w-full h-px bg-brass/20" />
        <div className="absolute h-full w-px bg-brass/20" />
        <div className="absolute w-full h-px bg-brass/20 rotate-45" />
        <div className="absolute h-full w-px bg-brass/20 rotate-45" />
      </div>
      <div className="absolute inset-4 rounded-full border-2 border-brass/30 bg-white" />
      <div className="absolute inset-[26px] rounded-full bg-brass/30" />
    </div>
  );
}

export function CassettePlayer() {
  const [playing, setPlaying] = useState(false);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const stop = useCallback(() => setPlaying(false), []);

  return (
    <div className="tape-cartridge p-5 flex flex-col items-center gap-4 min-w-[220px]">
      <div className="flex items-center justify-center gap-6 w-full">
        <Reel spinning={playing} />
        <Reel spinning={playing} />
      </div>

      <EqualizerBars className={playing ? "opacity-100" : "opacity-20"} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={stop}
          className="w-9 h-9 flex items-center justify-center border border-border text-muted text-sm hover:bg-border-light transition-colors"
          title="Стоп"
        >
          ⏹
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white text-base hover:bg-primary-light transition-colors"
          title={playing ? "Пауза" : "Играть"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center border border-border text-muted text-sm hover:bg-border-light transition-colors"
          title="Перемотка"
        >
          ⏪
        </button>
      </div>

      <div className="text-center">
        <p className="text-[11px] text-muted uppercase tracking-wider">
          {playing ? "Воспроизведение..." : "Готов к работе"}
        </p>
      </div>
    </div>
  );
}
