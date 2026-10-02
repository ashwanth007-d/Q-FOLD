import React from 'react';
import { Activity, ShieldCheck, Flame, Scale } from 'lucide-react';
import { SimulationResult } from '../types';

interface HamiltonianPanelProps {
  result: SimulationResult | null;
}

export const HamiltonianPanel: React.FC<HamiltonianPanelProps> = ({ result }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4 border border-cyan-500/20">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-white">Hamiltonian / Energy Model</h3>
          <p className="text-xs text-slate-400">Total cost Hamiltonian decomposition: H(q) = H_gc + H_ch + H_in</p>
        </div>
      </div>

      {/* Formula Display */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono-code text-xs text-center text-cyan-300">
        <span className="text-slate-400">H(q) = </span>
        <span className="text-rose-400 font-bold">H_gc(q_cf)</span>
        <span className="text-slate-400"> + </span>
        <span className="text-amber-400 font-bold">H_ch(q_cf)</span>
        <span className="text-slate-400"> + </span>
        <span className="text-emerald-400 font-bold">H_in(q_cf, q_in)</span>
      </div>

      {/* Terms Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* H_gc */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code text-rose-400 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              H_gc (Geometrical)
            </span>
            <span>{result ? result.h_gc.toFixed(2) : '--'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Penalizes spatial self-intersection (two amino acids occupying the same 3D coordinate).
          </p>
        </div>

        {/* H_ch */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              H_ch (Chirality)
            </span>
            <span>{result ? result.h_ch.toFixed(2) : '--'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Penalizes unphysical chiral turn reversals and steric loop overlaps.
          </p>
        </div>

        {/* H_in */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              H_in (Interaction)
            </span>
            <span>{result ? result.h_in.toFixed(2) : '--'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pairwise contact energy between non-bonded amino acid neighbors (MJ statistical potential).
          </p>
        </div>
      </div>

      {/* Calculated Total Energy Banner */}
      {result && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-500/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono-code text-cyan-300 block">Optimized Ground State Energy</span>
            <span className="text-2xl font-bold font-heading text-white">{result.total_energy.toFixed(2)} units</span>
          </div>

          <div className="text-right font-mono-code text-xs">
            <span className={`px-2.5 py-1 rounded-md border font-semibold ${
              result.is_valid
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950 text-rose-300 border-rose-500/40'
            }`}>
              {result.is_valid ? 'Valid Conformation' : 'Steric Collision'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
