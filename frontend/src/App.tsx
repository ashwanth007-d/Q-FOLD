import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { LandingOverview } from './components/LandingOverview';
import { ProteinInputPanel } from './components/ProteinInputPanel';
import { QuantumEncodingPanel } from './components/QuantumEncodingPanel';
import { HamiltonianPanel } from './components/HamiltonianPanel';
import { OptimizationPanel } from './components/OptimizationPanel';
import { ConvergenceChart } from './components/ConvergenceChart';
import { EnergyLandscapePanel } from './components/EnergyLandscapePanel';
import { Protein3DViewer } from './components/Protein3DViewer';
import { ExplainDrawer } from './components/ExplainDrawer';
import { SequenceInfo, EncodingDetails, SimulationResult } from './types';

const API_BASE = 'http://127.0.0.1:8000';

export const App: React.FC = () => {
  const [sequence, setSequence] = useState('APRLRFYMN');
  const [method, setMethod] = useState('VQE');
  const [maxIterations, setMaxIterations] = useState(50);

  const [seqInfo, setSeqInfo] = useState<SequenceInfo | null>(null);
  const [encoding, setEncoding] = useState<EncodingDetails | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  // Validate sequence when text changes
  useEffect(() => {
    if (!sequence.trim()) {
      setValidationError("Sequence cannot be empty.");
      setSeqInfo(null);
      setEncoding(null);
      return;
    }

    axios.post(`${API_BASE}/api/protein/validate`, { sequence })
      .then(res => {
        setValidationError(null);
        setSeqInfo(res.data.info);
        setEncoding(res.data.encoding);
      })
      .catch(err => {
        const errMsg = err.response?.data?.detail || "Invalid sequence format.";
        setValidationError(errMsg);
        setSeqInfo(null);
        setEncoding(null);
      });
  }, [sequence]);

  // Initial simulation run on load
  useEffect(() => {
    handleRunOptimization();
  }, []);

  const handleRunOptimization = (overrideSeq?: string) => {
    const targetSeq = overrideSeq || sequence;
    setIsSimulating(true);

    axios.post(`${API_BASE}/api/simulation/optimize`, {
      sequence: targetSeq,
      method: method,
      max_iterations: maxIterations,
      force_fallback: false
    })
      .then(res => {
        setSimulationResult(res.data);
        setIsSimulating(false);
      })
      .catch(err => {
        console.error("Optimization failed", err);
        setIsSimulating(false);
      });
  };

  const handleRunBradykinin = () => {
    setSequence('APRLRFYMN');
    handleRunOptimization('APRLRFYMN');
  };

  const scrollToInput = () => {
    const elem = document.getElementById('protein-input-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onOpenExplain={() => setIsExplainOpen(true)}
        onRunBradykinin={handleRunBradykinin}
        isSimulating={isSimulating}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
        
        {/* Landing Hero Overview */}
        <LandingOverview onLaunch={scrollToInput} />

        {/* Top Grid: Sequence Input + Quantum Encoding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProteinInputPanel
            sequence={sequence}
            onSequenceChange={setSequence}
            onRunBradykinin={handleRunBradykinin}
            seqInfo={seqInfo}
            validationError={validationError}
            isSimulating={isSimulating}
          />

          <QuantumEncodingPanel encoding={encoding} />
        </div>

        {/* Hamiltonian & Optimization Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HamiltonianPanel result={simulationResult} />

          <OptimizationPanel
            method={method}
            onMethodChange={setMethod}
            maxIterations={maxIterations}
            onMaxIterationsChange={setMaxIterations}
            onRunOptimization={() => handleRunOptimization()}
            isSimulating={isSimulating}
            result={simulationResult}
          />
        </div>

        {/* 3D Protein Structure Result */}
        <Protein3DViewer result={simulationResult} />

        {/* Energy Convergence & Landscape Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConvergenceChart
            trajectory={simulationResult?.trajectory ?? []}
            method={simulationResult?.method ?? method}
          />

          <EnergyLandscapePanel candidates={simulationResult?.energy_landscape ?? []} />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 font-mono-code space-y-1">
        <p>Q-FOLD — Quantum Protein Folding Optimizer | Qiskit 2.x Simulation Model</p>
        <p className="text-[11px] text-slate-600">
          Educational & Research Prototype. Uses 3D lattice representation. Does not replace experimental structure determination.
        </p>
      </footer>

      {/* Educational Mode Drawer */}
      <ExplainDrawer
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
      />
    </div>
  );
};

export default App;
