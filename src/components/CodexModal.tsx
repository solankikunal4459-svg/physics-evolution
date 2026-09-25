import React, { useState } from 'react';
import { codexStore } from '../physics/codex';
import { QuantityCategory } from '../physics/quantities';
import { X, Lock, CheckCircle, Atom, GitFork, Info, Filter } from 'lucide-react';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quantities' | 'transformations'>('quantities');
  const [selectedCategory, setSelectedCategory] = useState<QuantityCategory | 'All'>('All');

  if (!isOpen) return null;

  const quantities = codexStore.getQuantitiesList(selectedCategory);
  const transformations = codexStore.getTransformationsList(selectedCategory);
  const stats = codexStore.getDiscoveryStats();

  const categories: (QuantityCategory | 'All')[] = [
    'All',
    'Mechanics',
    'Energy',
    'Rotational',
    'Electromagnetism',
  ];

  return (
    <div
      id="codex-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="codex-modal-container"
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Atom className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
                PHYSICS CODEX
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  {stats.percentage}% DISCOVERED
                </span>
              </h2>
              <p className="text-xs text-slate-400">Class 11–12 Dimensional Mechanics, Rotational & Electromagnetism Graph</p>
            </div>
          </div>

          <button
            id="codex-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Main Navigation Tabs */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('quantities')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'quantities'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              Quantities ({stats.quantitiesDiscovered}/{stats.quantitiesTotal})
            </button>
            <button
              onClick={() => setActiveTab('transformations')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'transformations'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              Transformations ({stats.transformationsDiscovered}/{stats.transformationsTotal})
            </button>
          </div>

          {/* Quick discovery stats */}
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Overall Progress:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${stats.percentage}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-300"
              />
            </div>
            <span className="text-slate-200 font-bold">{stats.percentage}%</span>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="px-4 sm:px-5 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-500 text-[11px] uppercase tracking-wider shrink-0">Domain:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-700 text-slate-100 font-bold border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {activeTab === 'quantities' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quantities.map(item => {
                const { info, discovered } = item;
                if (!discovered) {
                  return (
                    <div
                      key={item.quantityId}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-3 text-slate-600"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-slate-500">??? [LOCKED]</div>
                        <div className="text-xs text-slate-600">
                          {info.category} • Evolve via valid physical operations in combat
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.quantityId}
                    style={{ borderColor: `${info.color}40` }}
                    className="p-4 rounded-xl bg-slate-950/70 border backdrop-blur-xs flex flex-col gap-2 relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: info.color }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-slate-950 text-lg shadow-sm"
                        >
                          {info.symbol}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            {info.name}
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {info.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            SI: {info.unit} ({info.unitSymbol})
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 font-bold">
                        {info.dimensions.format()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed mt-1">
                      {info.description}
                    </div>

                    <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Formula: {info.formula}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Discovered
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {transformations.map(trans => {
                const { rule, discovered } = trans;

                if (!discovered) {
                  return (
                    <div
                      key={rule.id}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-700" />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-slate-500">LOCKED EVOLUTION PATH</div>
                          <div className="text-xs text-slate-600">{rule.domain} • Operator: {rule.operatorSymbol}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-700">Undiscovered</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 backdrop-blur-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-100 text-sm font-mono flex items-center gap-2">
                        <span className="text-amber-400">{rule.name}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-bold">
                          {rule.formula}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {rule.domain}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> DISCOVERED
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rule.educationalNote}
                    </p>

                    <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Input: [{rule.inputQuantity}] + Operator: [{rule.operatorSymbol}] → Output: [{rule.outputQuantity}]</span>
                      <span>Operand: {rule.operandDimension.format()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Homogeneity: [A] ± [B] requires [A]=[B]. Multiplication combines dimensional powers.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono transition-colors text-xs cursor-pointer shrink-0"
          >
            RETURN TO COMBAT
          </button>
        </div>
      </div>
    </div>
  );
};
