"use client";

import { useState, useCallback } from "react";
import { EqualizerBars } from "./EqualizerBars";

function Reel({ spinning }: { spinning: boolean }) {
  return (
    <div className={`relative w-20 h-20 ${spinning ? "animate-reel-spin" : ""}`}>
      <div className="absolute inset-0 rounded-full border-2 border-copper" />
      <div className="absolute inset-2 rounded-full border border-copper/30" />
      <div className="absolute inset-3 flex items-center justify-center">
        <div className="absolute w-full h-px bg-copper/30" />
        <div className="absolute h-full w-px bg-copper/30" />
        <div className="absolute w-full h-px bg-copper/30 rotate-45" />
        <div className="absolute h-full w-px bg-copper/30 rotate-45" />
      </div>
      <div className="absolute inset-5 rounded-full border-2 border-copper/50 bg-paper" />
      <div className="absolute inset-[30px] rounded-full bg-copper/40" />
    </div>
  );
}

export function CassettePlayer() {
  const [playing, setPlaying] = useState(false);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const stop = useCallback(() => setPlaying(false), []);

  return (
    <div className="tape-cartridge p-6 rounded flex flex-col items-center gap-4 min-w-[260px]">
      <div className="flex items-center justify-center gap-8 w-full">
        <Reel spinning={playing} />
        <Reel spinning={playing} />
      </div>

      <EqualizerBars className={playing ? "opacity-100" : "opacity-30"} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={stop}
          className="w-10 h-10 flex items-center justify-center border-2 border-wood text-wood font-heading text-lg hover:bg-wood hover:text-paper transition-colors"
          title="Стоп"
        >
          ⏹
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center border-2 border-copper bg-wood text-paper font-heading text-xl hover:bg-copper hover:text-wood transition-colors"
          title={playing ? "Пауза" : "Играть"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center border-2 border-wood text-wood font-heading text-lg hover:bg-wood hover:text-paper transition-colors"
          title="Перемотка"
        >
          ⏪
        </button>
      </div>

      <div className="text-center">
        <p className="font-heading text-xs text-wood/60 uppercase tracking-wider">
          {playing ? "Воспроизведение..." : "Готов к работе"}
        </p>
      </div>
    </div>
  );
}
