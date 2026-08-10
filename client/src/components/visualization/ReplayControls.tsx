import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Simple playback controls for a deterministic replay.
 */
export default function ReplayControls({
  playing,
  speed,
  onPlayPause,
  onSpeedChange,
  onSeek,
  maxTick,
  currentTick,
}: {
  playing: boolean;
  speed: number;
  onPlayPause: () => void;
  onSpeedChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxTick: number;
  currentTick: number;
}) {
  return (
    <div className="flex items-center gap-4 text-sm text-[#666059] dark:text-[#A89F95] mb-4">
      <Button size="sm" onClick={onPlayPause}>
        {playing ? "Pause" : "Play"}
      </Button>
      <label className="flex items-center">
        Speed:{" "}
        <select value={speed} onChange={onSpeedChange} className="ml-1 bg-[#26211B] text-white">
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
        </select>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={maxTick}
          value={currentTick}
          onChange={onSeek}
          className="w-48"
        />
        <span>{currentTick}</span>
      </div>
    </div>
  );
}
