import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../state/simulationStore';
import { reconstructState } from '../lib/replayEngine';
import { Play, Pause, RotateCcw, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReplayController() {
  const { dvkChain, replayTick, isReplaying, setReplayTick, setIsReplaying, setState } = useSimulationStore();
  const [speed, setSpeed] = useState<number>(1);
  // Speed options: 0.25x, 0.5x, 1x, 2x, 4x
  const speedOptions = [0.25, 0.5, 1, 2, 4];
  
  const maxTick = dvkChain.length > 0 ? dvkChain[dvkChain.length - 1].tick : 0;
  
  // Replay tick loop
  useEffect(() => {
    let interval: any;
    if (isReplaying) {
      const ms = 1000 / speed;
      interval = setInterval(() => {
        setReplayTick(useSimulationStore.getState().replayTick + 1);
      }, ms);
    }
    return () => clearInterval(interval);
  }, [isReplaying, speed, setReplayTick]);
  
  // Reconstruct state deterministically whenever replayTick changes
  useEffect(() => {
    if (dvkChain.length > 0) {
      // Pause if we hit the end
      if (replayTick >= maxTick && isReplaying) {
        setIsReplaying(false);
      }
      
      const reconstructed = reconstructState(dvkChain, Math.min(replayTick, maxTick));
      setState(reconstructed);
    }
  }, [replayTick, dvkChain, setState, maxTick, isReplaying, setIsReplaying]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReplaying(false);
    setReplayTick(Number(e.target.value));
  };

  return (
    <div className="p-4 bg-[#1E1A16] border border-[#3A342C] rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Deterministic Replay</h3>
        <span className="text-xs font-mono text-[#666059] dark:text-[#A89F95]">
          Tick: {Math.min(replayTick, maxTick)} / {maxTick}
        </span>
      </div>
      
<div className="flex items-center gap-4 mb-4">
          {/* Step Back */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsReplaying(false);
              setReplayTick(Math.max(0, replayTick - 1));
            }}
            disabled={dvkChain.length === 0 || replayTick <= 0}
            className="bg-[#26211B] hover:bg-[#332C24] border-[#3A342C] text-white"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>

          {/* Play / Pause */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsReplaying(!isReplaying)}
            disabled={dvkChain.length === 0 || (replayTick >= maxTick && !isReplaying)}
            className="bg-[#26211B] hover:bg-[#332C24] border-[#3A342C] text-white"
          >
            {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          {/* Step Forward */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsReplaying(false);
              setReplayTick(Math.min(maxTick, replayTick + 1));
            }}
            disabled={dvkChain.length === 0 || replayTick >= maxTick}
            className="bg-[#26211B] hover:bg-[#332C24] border-[#3A342C] text-white"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>

          {/* Reset */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsReplaying(false);
              setReplayTick(0);
            }}
            disabled={dvkChain.length === 0}
            className="bg-[#26211B] hover:bg-[#332C24] border-[#3A342C] text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Speed selector */}
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="bg-[#26211B] text-white border border-[#3A342C] rounded px-2 py-1"
            disabled={dvkChain.length === 0}
          >
            {speedOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}x
              </option>
            ))}
          </select>

          {/* Scrubber */}
          <input
            type="range"
            min={0}
            max={maxTick}
            value={Math.min(replayTick, maxTick)}
            onChange={handleScrub}
            className="flex-1 accent-[#CC553D]"
            disabled={dvkChain.length === 0}
          />
        </div>
      
      {dvkChain.length === 0 && (
        <div className="text-xs text-[#D99B26] mt-2">
          Load a DVK Proof Chain to enable replay mode.
        </div>
      )}
    </div>
  );
}
