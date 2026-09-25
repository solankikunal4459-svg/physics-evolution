import React from 'react';
import { PlayerPhysicsState } from '../physics/evaluator';
import { PHYSICAL_QUANTITIES } from '../physics/quantities';
import { GameMetrics } from '../game/types';
import { codexStore } from '../physics/codex';
import { BookOpen, Pause, Volume2, VolumeX, RotateCcw, ArrowRight } from 'lucide-react';

interface HUDProps {
  physicsState: PlayerPhysicsState;
  health: number;
  maxHealth: number;
  metrics: GameMetrics;
  isMuted: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onOpenCodex: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  physicsState,
  health,
  maxHealth,
  metrics,
  isMuted,
  onToggleSound,
  onPause,
  onOpenCodex,
  onRestart,
}) => {
  const currentQInfo = PHYSICAL_QUANTITIES[physicsState.primaryQuantity];
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const availableEvolutions = codexStore.getAvailableTransformationsFrom(physicsState.primaryQuantity);

  return (
    <div id="game-hud" className="absolute inset-x-0 top-0 pointer-events-none p-2 sm:p-3 flex flex-col gap-2 z-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Current Quantity & Value */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Identity Badge */}
          <div
            id="hud-identity-badge"
            style={{ borderColor: currentQInfo.color }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border backdrop-blur-md shadow-lg"
          >
            <div
              style={{ backgroundColor: currentQInfo.color }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-slate-950 text-base shadow-sm"
            >
              {currentQInfo.symbol}
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                CURRENT QUANTITY
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <span>{currentQInfo.name}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10" style={{ color: currentQInfo.color }}>
                  {physicsState.currentValue} {currentQInfo.unitSymbol}
                </span>
              </div>
            </div>
            {/* Dimensions Badge */}
            <div className="hidden sm:block ml-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-cyan-300">
              {currentQInfo.dimensions.format()}
            </div>
          </div>

          {/* Health Bar */}
          <div id="hud-health-container" className="flex flex-col gap-0.5 w-24 sm:w-28 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>HP</span>
              <span className={health < 30 ? 'text-red-400 font-bold' : 'text-slate-200'}>{health}/{maxHealth}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${healthPercent}%` }}
                className={`h-full transition-all duration-300 rounded-full ${
                  healthPercent > 50 ? 'bg-emerald-500' : healthPercent > 25 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right: Wave, Score & Control Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Score & Wave */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center gap-3 font-mono text-xs shadow-md">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Wave</span>
              <span className="font-bold text-indigo-400">{metrics.wave}</span>
            </div>
            <div className="w-[1px] h-5 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Score</span>
              <span className="font-bold text-amber-400">{metrics.score}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            id="hud-btn-codex"
            onClick={onOpenCodex}
            title="Physics Codex"
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-400 transition-colors shadow-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            id="hud-btn-sound"
            onClick={onToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-200" />}
          </button>

          <button
            id="hud-btn-restart"
            onClick={onRestart}
            title="Restart Run"
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="hud-btn-pause"
            onClick={onPause}
            title="Pause Game"
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Evolution Highway Bar: Available Evolutions & Recipe Buffer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md font-mono text-xs">
        {/* Left: Available Evolutions from current state */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
            AVAILABLE EVOLUTIONS:
          </span>
          {availableEvolutions.length === 0 ? (
            <span className="text-slate-500 text-[11px]">Apex physical quantity reached</span>
          ) : (
            <div className="flex items-center gap-1.5">
              {availableEvolutions.slice(0, 4).map(rule => {
                const targetQ = PHYSICAL_QUANTITIES[rule.outputQuantity];
                return (
                  <div
                    key={rule.id}
                    title={`${rule.name}: ${rule.formula}`}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[11px]"
                  >
                    <span className="text-amber-300 font-bold">{rule.operatorSymbol}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="font-bold" style={{ color: targetQ?.color || '#fff' }}>
                      {targetQ?.symbol || rule.outputQuantity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recipe Buffer / Active Components */}
        {physicsState.buffer && physicsState.buffer.length > 0 && (
          <div className="flex items-center gap-1.5 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-500/50 text-[11px] text-violet-200">
            <span className="text-violet-400 font-bold uppercase text-[10px]">Recipe:</span>
            <span>[{currentQInfo.symbol}]</span>
            {physicsState.buffer.map((b, i) => (
              <span key={i}>× [{b}]</span>
            ))}
            <span className="text-violet-400">→ Collect remaining component!</span>
          </div>
        )}
      </div>
    </div>
  );
};
