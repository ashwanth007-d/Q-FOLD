import React from 'react';
import { Cpu, HelpCircle, PlayCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenExplain: () => void;
  onRunBradykinin: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExplain,
  onRunBradykinin,
  isSimulating
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-cyan-500/20 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title and Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-cyan-950/70 rounded-xl border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Q-FOLD
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-sans font-medium">
                  Quantum Simulator
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono-code">
              Quantum Optimization of Protein Folding Landscapes
            </p>
          </div>
        </div>

        {/* Action Buttons & Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <button
            onClick={onRunBradykinin}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run Bradykinin Demo
          </button>

          <button
            onClick={onOpenExplain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Explain Mode
          </button>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-400 border border-slate-800 text-[11px] font-mono-code">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Simplified Model
          </div>
        </div>

      </div>
    </header>
  );
};
