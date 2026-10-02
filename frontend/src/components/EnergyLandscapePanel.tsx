import React from 'react';
import { BarChart3, Info, Check, X } from 'lucide-react';
import { LandscapeCandidate } from '../types';

interface EnergyLandscapePanelProps {
  candidates: LandscapeCandidate[];
}

export const EnergyLandscapePanel: React.FC<EnergyLandscapePanelProps> = ({ candidates }) => {
  if (!candidates || candidates.length === 0) return null;

  // Filter unique candidate bitstrings
  const sortedCandidates = [...candidates].sort((a, b) => a.energy - b.energy);

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4 border border-cyan-500/20">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-500/30">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-white">Conformational Energy Landscape</h3>
          <p className="text-xs text-slate-400">Quantum state search space sampling & candidate folding energies</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          Quantum optimization samples candidate bitstring configurations from the quantum state vector to locate the ground state energy minimum in the conformational landscape.
        </span>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedCandidates.slice(0, 8).map((cand, idx) => (
          <div
            key={cand.bitstring}
            className={`p-3.5 rounded-xl border space-y-2 transition-all ${
              idx === 0
                ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/40'
                : cand.is_valid
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-rose-950/20 border-rose-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono-code text-[11px] text-slate-300 font-bold">
                {idx === 0 ? '🏆 Best Candidate' : `Config #${idx + 1}`}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono-code ${
                cand.is_valid ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
              }`}>
                {cand.is_valid ? <Check className="w-3 h-3 inline" /> : <X className="w-3 h-3 inline" />}
              </span>
            </div>

            <div className="font-mono-code text-[11px] text-slate-400 truncate">
              Bits: <span className="text-cyan-300">{cand.bitstring}</span>
            </div>

            <div className="flex justify-between items-baseline pt-1 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400">Total Energy</span>
              <span className={`font-bold font-heading text-sm ${idx === 0 ? 'text-cyan-300' : 'text-white'}`}>
                {cand.energy.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
