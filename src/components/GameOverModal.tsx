import React, { useState } from 'react';
import { GameMetrics, TransformationRecordEntry } from '../game/types';
import { RotateCcw, GitBranch, Trophy, ShieldAlert, Zap, Skull, ArrowDown } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  metrics: GameMetrics;
  transformationHistory: TransformationRecordEntry[];
  onRestart: () => void;
}

const formulaExpression = (formula: string, fallback: string) => {
  const rhs = formula.split('=').slice(1).join('=').trim();
  return rhs || fallback;
};

const buildJourney = (history: TransformationRecordEntry[]) => {
  const parts: string[] = ['m'];
  for (const entry of history) {
    const expression = formulaExpression(entry.formula, entry.from);
    parts.push(expression);
    parts.push(entry.to);
  }
  return parts;
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  metrics,
  transformationHistory,
  onRestart,
}) => {
  const [showRecord, setShowRecord] = useState(false);

  if (!isOpen) return null;

  if (showRecord) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-md max-h-[86vh] bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl text-slate-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-mono tracking-wide text-emerald-300">TRANSFORMATION RECORD</h2>
              <p className="text-[11px] text-slate-400 mt-1">The particle's journey during this run</p>
            </div>
            <button onClick={() => setShowRecord(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono">BACK</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {transformationHistory.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No transformations discovered in this run.</div>
            ) : (
              <div className="rounded-xl bg-slate-950/70 border border-emerald-500/25 p-4">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Particle journey</div>
                <div className="font-mono text-sm leading-8 break-words">
                  {buildJourney(transformationHistory).map((part, index) => (
                    <React.Fragment key={`${part}-${index}`}>
                      {index > 0 && <span className="text-emerald-400 mx-1">→</span>}
                      <span className={index % 2 === 0 ? 'text-emerald-300 font-bold' : 'text-slate-200'}>{part}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Skull className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold font-mono tracking-wide">EXPERIMENT TERMINATED</h2>
          <p className="text-xs text-slate-400">Your physical particle succumbed to inertial resistance.</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-left font-mono">
          <div className="flex items-center gap-2.5"><Trophy className="w-4 h-4 text-amber-400" /><div><div className="text-[10px] text-slate-500 uppercase">Final Score</div><div className="text-sm font-bold text-amber-300">{metrics.score}</div></div></div>
          <div className="flex items-center gap-2.5"><Zap className="w-4 h-4 text-indigo-400" /><div><div className="text-[10px] text-slate-500 uppercase">Wave Reached</div><div className="text-sm font-bold text-indigo-300">Wave {metrics.wave}</div></div></div>
          <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">T</div><div><div className="text-[10px] text-slate-500 uppercase">Transformations</div><div className="text-sm font-bold text-cyan-300">{metrics.transformationsCount}</div></div></div>
          <div className="flex items-center gap-2.5"><ShieldAlert className="w-4 h-4 text-rose-400" /><div><div className="text-[10px] text-slate-500 uppercase">Dimension Errors</div><div className="text-sm font-bold text-rose-300">{metrics.invalidCombinationsCount}</div></div></div>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs">
          <button onClick={onRestart} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-lg active:scale-95">
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>
          <button onClick={() => setShowRecord(true)} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold transition-colors">
            <GitBranch className="w-4 h-4" /> TRANSFORMATION RECORD
          </button>
        </div>
      </div>
    </div>
  );
};
