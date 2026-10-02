import React from 'react';
import { Play, Settings, Cpu, ShieldAlert, CheckCircle } from 'lucide-react';
import { SimulationResult } from '../types';

interface OptimizationPanelProps {
  method: string;
  onMethodChange: (m: string) => void;
  maxIterations: number;
  onMaxIterationsChange: (n: number) => void;
  onRunOptimization: () => void;
  isSimulating: boolean;
  result: SimulationResult | null;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  method,
  onMethodChange,
  maxIterations,
  onMaxIterationsChange,
  onRunOptimization,
  isSimulating,
  result
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-5 border border-cyan-500/20">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-white">Optimization Engine</h3>
          <p className="text-xs text-slate-400">Configure quantum optimization algorithm & execution settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-mono-code text-slate-300">
            Optimization Method:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'VQE', name: 'VQE', desc: 'Variational Quantum Eigensolver' },
              { id: 'QAOA', name: 'QAOA', desc: 'Quantum Approximate Optimization' },
              { id: 'CLASSICAL', name: 'Classical', desc: 'Exact / Simulated Annealing' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onMethodChange(m.id)}
                disabled={isSimulating}
                className={`p-3 rounded-xl border text-left transition-all ${
                  method === m.id
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold font-heading text-sm text-cyan-300">{m.name}</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Iterations Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono-code">
            <span className="text-slate-300">Max Iterations:</span>
            <span className="text-cyan-300 font-bold">{maxIterations}</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="10"
            value={maxIterations}
            onChange={(e) => onMaxIterationsChange(Number(e.target.value))}
            disabled={isSimulating}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] font-mono-code text-slate-500">
            <span>10 iterations</span>
            <span>150 iterations</span>
          </div>
        </div>
      </div>

      {/* Explicit Fallback Warning Badge if result triggered fallback */}
      {result && result.is_classical_fallback && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold font-mono-code text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            CLASSICAL FALLBACK APPLIED
          </div>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            {result.fallback_reason}
          </p>
        </div>
      )}

      {/* Run Optimization Button */}
      <button
        onClick={onRunOptimization}
        disabled={isSimulating}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold font-heading text-sm tracking-wider shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {isSimulating ? (
          <>
            <Cpu className="w-5 h-5 animate-spin text-cyan-300" />
            <span>Executing Quantum Simulation...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>Run Quantum Optimization</span>
          </>
        )}
      </button>
    </div>
  );
};
