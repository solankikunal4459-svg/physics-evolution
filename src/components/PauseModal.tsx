import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Smartphone, Gamepad2, X } from 'lucide-react';
import { haptics } from '../game/haptics';
import { TransformationRecordEntry } from '../game/types';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  transformationHistory: TransformationRecordEntry[];
}

const formulaExpression = (formula: string, fallback: string) => {
  const rhs = formula.split('=').slice(1).join('=').trim();
  return rhs || fallback;
};

const buildJourney = (history: TransformationRecordEntry[]) => {
  const parts: string[] = ['m'];
  for (const entry of history) {
    parts.push(formulaExpression(entry.formula, entry.from));
    parts.push(entry.to);
  }
  return parts;
};

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  isMuted,
  onToggleSound,
  transformationHistory,
}) => {
  const [hapticEnabled, setHapticEnabled] = useState(haptics.isEnabled());

  if (!isOpen) return null;

  const toggleHaptics = () => {
    const newState = haptics.toggle();
    setHapticEnabled(newState);
    if (newState) haptics.light();
  };

  return (
    <div
      id="pause-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="pause-modal-content"
        className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono font-bold text-lg text-slate-100">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            GAME PAUSED
          </div>
          <button
            onClick={onResume}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <button
            id="pause-btn-resume"
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME
          </button>
          <button
            id="pause-btn-restart"
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART
          </button>
        </div>

        {/* Live transformation record — always visible while paused. */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/25 text-left font-mono overflow-hidden">
          <div className="text-[10px] uppercase tracking-wider text-emerald-300 mb-2">TRANSFORMATION RECORD</div>
          {transformationHistory.length === 0 ? (
            <div className="text-[11px] text-slate-500">No transformations yet — start with m.</div>
          ) : (
            <div className="text-[12px] leading-6 break-words">
              {buildJourney(transformationHistory).map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                  {index > 0 && <span className="text-emerald-400 mx-1">→</span>}
                  <span className={index % 2 === 0 ? 'text-emerald-300 font-bold' : 'text-slate-200'}>{part}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Compact settings */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
          <button onClick={onToggleSound} className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
            {isMuted ? <VolumeX className="inline w-3.5 h-3.5 mr-1" /> : <Volume2 className="inline w-3.5 h-3.5 mr-1" />} SOUND {isMuted ? 'OFF' : 'ON'}
          </button>
          <button onClick={toggleHaptics} className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
            <Smartphone className="inline w-3.5 h-3.5 mr-1" /> HAPTICS {hapticEnabled ? 'ON' : 'OFF'}
          </button>
        </div>


      </div>
    </div>
  );
};
