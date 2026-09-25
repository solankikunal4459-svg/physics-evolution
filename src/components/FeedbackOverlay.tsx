import React, { useEffect, useState } from 'react';
import { EvaluationResult } from '../physics/evaluator';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface FeedbackOverlayProps { result: EvaluationResult | null; onDismiss: () => void; }

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ result, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (result) {
      setVisible(true);
      const timer = setTimeout(() => { setVisible(false); onDismiss(); }, 3600);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [result, onDismiss]);
  if (!result || !visible) return null;

  const isTransform = result.type === 'TRANSFORM';
  const isModify = result.type === 'MODIFY';
  const isInvalid = result.type === 'INVALID';

  return (
    <div id="physics-feedback-overlay" onClick={() => { setVisible(false); onDismiss(); }} className="absolute top-[6.25rem] sm:top-20 inset-x-0 flex justify-center px-2 pointer-events-auto z-20 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className={`max-w-[min(92vw,22rem)] w-auto p-2 rounded-lg border backdrop-blur-sm shadow-lg flex items-center gap-2 cursor-pointer ${
        isTransform ? 'bg-emerald-500/15 border-emerald-400/80 shadow-emerald-950/50 text-emerald-50' :
        isModify ? 'bg-slate-900/35 border-sky-500/60 shadow-sky-950/40 text-sky-100' :
        'bg-red-500/15 border-red-500/80 shadow-red-950/50 text-red-100'
      }`}>
        <div className={`p-1.5 rounded-md shrink-0 ${isTransform ? 'bg-emerald-500/20 text-emerald-300' : isModify ? 'bg-sky-500/20 text-sky-400' : 'bg-red-500/20 text-red-400'}`}>
          {isTransform ? <Sparkles className="w-4 h-4" /> : isModify ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 animate-pulse" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono">{result.title}</span>
            {result.formula && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-emerald-200">{result.formula}</span>}
          </div>
          <p className="text-[10px] text-slate-200 leading-tight line-clamp-2">{result.message}</p>
          {isInvalid && result.dimensionsA && result.dimensionsB && (
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] bg-black/50 px-2 py-1 rounded border border-red-500/30"><span className="text-slate-400">Dimensions:</span><span className="text-red-300 font-bold">{result.dimensionsA}</span><span className="text-slate-500">≠</span><span className="text-amber-300 font-bold">{result.dimensionsB}</span></div>
          )}
        </div>
      </div>
    </div>
  );
};
