import React from 'react';
import { Cpu, Layers, GitCommit, Info } from 'lucide-react';
import { EncodingDetails } from '../types';

interface QuantumEncodingPanelProps {
  encoding: EncodingDetails | null;
}

export const QuantumEncodingPanel: React.FC<QuantumEncodingPanelProps> = ({ encoding }) => {
  if (!encoding) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4 border border-cyan-500/20">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-white">Quantum Encoding</h3>
          <p className="text-xs text-slate-400">Mapping protein geometry & pairwise interactions to qubit states</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code text-slate-400">Configuration Qubits</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-500/30 font-mono-code">q_cf</span>
          </div>
          <p className="text-2xl font-bold font-heading text-cyan-300 mt-1">{encoding.config_qubits}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Encodes 3D turn angles ({encoding.num_turns} turns × 2 bits)</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code text-slate-400">Interaction Qubits</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] border border-indigo-500/30 font-mono-code">q_in</span>
          </div>
          <p className="text-2xl font-bold font-heading text-indigo-300 mt-1">{encoding.interaction_qubits}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Encodes non-bonded pairwise contacts</p>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code text-cyan-300">Total System Qubits</span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-500/30 font-mono-code">Total</span>
          </div>
          <p className="text-2xl font-bold font-heading text-white mt-1">{encoding.total_qubits}</p>
          <p className="text-[11px] text-cyan-400/80 mt-0.5">Local Quantum Simulator</p>
        </div>
      </div>

      {/* Visual Qubit Register Diagram */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <span className="text-xs font-mono-code text-slate-300 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          Quantum Circuit Register Layout:
        </span>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max">
            {encoding.qubit_list.map((q, idx) => (
              <React.Fragment key={q.index}>
                <div className={`p-2.5 rounded-lg border text-center font-mono-code text-xs space-y-1 transition-all ${
                  q.type === 'geometry'
                    ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
                    : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                }`}>
                  <div className="font-bold">{q.name}</div>
                  <div className="text-[10px] opacity-75">{q.type === 'geometry' ? `Turn ${q.turn_index}` : 'Contact'}</div>
                </div>
                {idx < encoding.qubit_list.length - 1 && (
                  <span className="text-slate-600 font-mono-code text-xs">──</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Reference Model Comparison Note */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center justify-between font-semibold text-slate-200">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Reference Model Alignment
          </span>
          <span className="text-[11px] font-mono-code text-cyan-400">
            Reference: 17 Qubits | Ours: {encoding.total_qubits} Qubits
          </span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          {encoding.reference_comparison.explanation}
        </p>
      </div>
    </div>
  );
};
