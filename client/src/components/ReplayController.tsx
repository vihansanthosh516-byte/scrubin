import React, { useEffect } from 'react';
import { useSimulationStore } from '../state/simulationStore';
import { reconstructState } from '../lib/replayEngine';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReplayController() {
  const { dvkChain, replayTick, isReplaying, setReplayTick, setIsReplaying, setState, currentTick } = useSimulationStore();
  
  const maxTick = dvkChain.length > 0 ? dvkChain[dvkChain.length - 1].tick : 0;
  
  // Replay tick loop
  useEffect(() => {
    let interval: any;
    if (isReplaying) {
      interval = setInterval(() => {
        setReplayTick(useSimulationStore.getState().replayTick + 1);
      }, 1000); // Replay at 1x speed
    }
    return () => clearInterval(interval);
  }, [isReplaying, setReplayTick]);
  
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
    <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Deterministic Replay</h3>
        <span className="text-xs font-mono text-neutral-400">
          Tick: {Math.min(replayTick, maxTick)} / {maxTick}
        </span>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsReplaying(!isReplaying)}
          disabled={dvkChain.length === 0 || (replayTick >= maxTick && !isReplaying)}
          className="bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-white"
        >
          {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            setIsReplaying(false);
            setReplayTick(0);
          }}
          disabled={dvkChain.length === 0}
          className="bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <input 
          type="range" 
          min={0} 
          max={maxTick} 
          value={Math.min(replayTick, maxTick)} 
          onChange={handleScrub}
          className="flex-1 accent-blue-500"
          disabled={dvkChain.length === 0}
        />
      </div>
      
      {dvkChain.length === 0 && (
        <div className="text-xs text-yellow-500 mt-2">
          Load a DVK Proof Chain to enable replay mode.
        </div>
      )}
    </div>
  );
}
