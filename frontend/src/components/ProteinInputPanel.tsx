import React from 'react';
import { Dna, Info, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { SequenceInfo } from '../types';

interface ProteinInputPanelProps {
  sequence: string;
  onSequenceChange: (seq: string) => void;
  onRunBradykinin: () => void;
  seqInfo: SequenceInfo | null;
  validationError: string | null;
  isSimulating: boolean;
}

export const ProteinInputPanel: React.FC<ProteinInputPanelProps> = ({
  sequence,
  onSequenceChange,
  onRunBradykinin,
  seqInfo,
  validationError,
  isSimulating
}) => {
  return (
    <div id="protein-input-section" className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4 border border-cyan-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Protein Input</h3>
            <p className="text-xs text-slate-400">Amino acid sequence selection & complexity estimation</p>
          </div>
        </div>

        <button
          onClick={onRunBradykinin}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Bradykinin (APRLRFYMN)
        </button>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <label className="block text-xs font-mono-code text-slate-300">
          Amino-Acid Sequence (Single-letter codes):
        </label>
        <div className="relative">
          <input
            type="text"
            value={sequence}
            onChange={(e) => onSequenceChange(e.target.value)}
            placeholder="e.g. A P R L R F Y M N"
            disabled={isSimulating}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono-code text-sm uppercase tracking-wider focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-all"
          />
          {seqInfo && !validationError && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5" />
          )}
        </div>

        {validationError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Sequence Badges */}
      {seqInfo && !validationError && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {seqInfo.amino_acids.map((aa) => (
              <span
                key={aa.index}
                className={`px-2.5 py-1 rounded-md text-xs font-mono-code font-semibold border ${
                  aa.type === 'Hydrophobic'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : aa.type === 'Basic' || aa.type === 'Acidic'
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                }`}
                title={`${aa.name} (${aa.type})`}
              >
                {aa.code} <span className="text-[10px] opacity-60">#{aa.index + 1}</span>
              </span>
            ))}
          </div>

          {/* Sequence Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-mono-code">Sequence Length</span>
              <span className="text-lg font-bold text-white font-heading">{seqInfo.length} AAs</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-mono-code">Lattice Turns</span>
              <span className="text-lg font-bold text-cyan-300 font-heading">{seqInfo.num_turns}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-mono-code">Search Space</span>
              <span className="text-lg font-bold text-indigo-300 font-heading">{seqInfo.search_space_size.toLocaleString()} states</span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center">
              <span className="text-[11px] text-cyan-300 block font-mono-code">Estimated Qubits</span>
              <span className="text-lg font-bold text-cyan-200 font-heading">{seqInfo.estimated_total_qubits} Qubits</span>
            </div>
          </div>

          {/* Important Model Notice */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">MODEL-DEPENDENT ESTIMATE:</strong> Qubit counts reflect our 3D lattice turn-space encoding model (2 qubits/turn + interaction qubits) and do not represent a universal quantum hardware requirement.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
