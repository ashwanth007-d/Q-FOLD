import React from 'react';
import { X, HelpCircle, BookOpen, Cpu, Dna, Activity, Award, Zap, ShieldCheck } from 'lucide-react';

interface ExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainDrawer: React.FC<ExplainDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const topics = [
    {
      title: 'What is a Qubit?',
      icon: Cpu,
      color: 'text-cyan-400',
      desc: 'A qubit (quantum bit) is the fundamental unit of quantum information. Unlike a classical bit (which can only be 0 or 1), a qubit can exist in a superposition of states |0⟩ and |1⟩ until measured. In Q-FOLD, qubits represent the 3D discrete turn angles of the amino acid backbone.'
    },
    {
      title: 'What is Protein Folding?',
      icon: Dna,
      color: 'text-emerald-400',
      desc: 'Protein folding is the physical process by which a linear polypeptide chain of amino acids folds into its characteristic three-dimensional native structure. A protein’s biological function relies entirely on its 3D spatial conformation.'
    },
    {
      title: 'Why is Protein Folding Hard? (Levinthal’s Paradox)',
      icon: HelpCircle,
      color: 'text-amber-400',
      desc: 'An unfolded polypeptide chain has an astronomical number of possible spatial conformations (e.g. 4^N for lattice turn models). Searching all possible configurations classically exhibits exponential scaling. Quantum optimization algorithms leverage quantum superposition and entanglement to explore complex energy landscapes efficiently.'
    },
    {
      title: 'What is a Hamiltonian H(q)?',
      icon: Activity,
      color: 'text-indigo-400',
      desc: 'The Hamiltonian is a mathematical operator representing the total energy function of the system. In Q-FOLD, H(q) combines: (1) H_gc (geometrical penalty against self-collisions), (2) H_ch (chirality penalty), and (3) H_in (interaction contact energy between non-bonded amino acids).'
    },
    {
      title: 'What Does Low Energy Mean?',
      icon: Award,
      color: 'text-purple-400',
      desc: 'According to thermodynamic principles (Anfinsen’s dogma), a protein’s native folded structure corresponds to the global minimum of its free energy landscape. Finding the lowest-energy state yields the most stable candidate conformation.'
    },
    {
      title: 'What is VQE (Variational Quantum Eigensolver)?',
      icon: Zap,
      color: 'text-pink-400',
      desc: 'VQE is a hybrid quantum-classical algorithm that prepares a parameterized quantum trial state |ψ(θ)⟩ on a quantum processor (or local simulator) and measures its expectation value ⟨ψ(θ)|H|ψ(θ)⟩. A classical optimizer iteratively updates parameters θ to minimize energy towards the ground state.'
    },
    {
      title: 'What is QAOA (Quantum Approximate Optimization Algorithm)?',
      icon: BookOpen,
      color: 'text-cyan-400',
      desc: 'QAOA is a quantum algorithm designed for combinatorial optimization problems. It applies alternating layers of problem Hamiltonian phase evolutions e^{-i γ H} and transverse mixer evolutions e^{-i β B} to search for optimal solutions.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-cyan-500/30 p-6 overflow-y-auto space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Educational Mode (Explain)</h2>
              <p className="text-xs text-slate-400">Core Concepts & Quantum Theory Guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
          <span>
            This educational platform uses a simplified 3D lattice bead model. It demonstrates quantum optimization principles and does NOT replace real-world all-atom molecular dynamics simulations.
          </span>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.map((t, idx) => {
            const IconComp = t.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-md bg-slate-900 ${t.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-100">{t.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-7">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
