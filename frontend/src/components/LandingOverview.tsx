import React from 'react';
import { ArrowRight, Dna, Cpu, Activity, Award, Box, Zap } from 'lucide-react';

interface LandingOverviewProps {
  onLaunch: () => void;
}

export const LandingOverview: React.FC<LandingOverviewProps> = ({ onLaunch }) => {
  const steps = [
    { title: 'Protein Folding', desc: 'Amino acid sequence & lattice model', icon: Dna, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { title: 'Quantum Encoding', desc: 'Turn qubits & interaction qubits', icon: Cpu, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { title: 'Hamiltonian Construction', desc: 'H = H_gc + H_ch + H_in', icon: Activity, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { title: 'Optimization', desc: 'VQE / QAOA quantum simulation', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/30' },
    { title: 'Lowest-Energy State', desc: 'Ground state candidate search', icon: Award, color: 'text-purple-400', border: 'border-purple-500/30' },
    { title: '3D Structure', desc: 'Interactive 3D lattice conformation', icon: Box, color: 'text-pink-400', border: 'border-pink-500/30' }
  ];

  return (
    <section className="glass-panel rounded-2xl p-6 lg:p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
        <h2 className="font-heading text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-indigo-300">
          Quantum Optimization of Protein Folding Landscapes
        </h2>
        <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
          Explore how quantum algorithms like VQE and QAOA optimize simplified 3D lattice models of amino acid chains to find low-energy, stable protein conformations.
        </p>
      </div>

      {/* Visual Flow Diagram */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <div key={idx} className="relative group">
              <div className={`h-full p-4 rounded-xl bg-slate-900/80 border ${step.border} flex flex-col items-center text-center space-y-2.5 transition-all group-hover:border-cyan-400/50 group-hover:bg-slate-800/80 shadow-lg`}>
                <div className={`p-2 rounded-lg bg-slate-950 ${step.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="font-heading text-xs font-bold text-slate-100">
                  {step.title}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {step.desc}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-cyan-500/50">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Launch Button */}
      <div className="flex justify-center">
        <button
          onClick={onLaunch}
          className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-950/50 transition-all hover:scale-[1.02]"
        >
          <span>Launch Simulation</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
