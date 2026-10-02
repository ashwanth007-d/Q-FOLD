"""
Quantum Approximate Optimization Algorithm (QAOA) solver for Q-FOLD.
"""

import os
import sys
from typing import Dict, List
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from backend.protein.sequence import get_sequence_info
    from backend.quantum.hamiltonian import (
        build_diagonal_hamiltonian_pauli, 
        evaluate_bitstring_energy
    )
    from backend.quantum.circuit_builder import sample_circuit_bitstrings
    from backend.optimization.classical_fallback import run_classical_fallback_optimization
except ModuleNotFoundError:
    from protein.sequence import get_sequence_info
    from quantum.hamiltonian import (
        build_diagonal_hamiltonian_pauli, 
        evaluate_bitstring_energy
    )
    from quantum.circuit_builder import sample_circuit_bitstrings
    from optimization.classical_fallback import run_classical_fallback_optimization

def create_qaoa_circuit(pauli_op, gamma: float, beta: float, num_qubits: int) -> QuantumCircuit:
    """
    Constructs a 1-layer QAOA circuit with phase separator e^{-i gamma H} and mixer e^{-i beta sum X_j}.
    """
    qc = QuantumCircuit(num_qubits)
    # Equal superposition state |+>^n
    for q in range(num_qubits):
        qc.h(q)
        
    # Phase separator layer (diagonal Pauli terms)
    # For diagonal Z terms, e^{-i gamma H} adds phase e^{-i gamma E(z)} to basis state |z>
    # In Qiskit circuit, we can append diagonal evolution or Rz/RZ gates
    for pauli_term in pauli_op:
        label = pauli_term.paulis[0].to_label()
        coeff = float(np.real(pauli_term.coeffs[0]))
        # Single qubit Z terms
        z_indices = [i for i, char in enumerate(reversed(label)) if char == 'Z']
        if len(z_indices) == 1:
            qc.rz(2 * gamma * coeff, z_indices[0])
        elif len(z_indices) == 2:
            q1, q2 = z_indices[0], z_indices[1]
            qc.cx(q1, q2)
            qc.rz(2 * gamma * coeff, q2)
            qc.cx(q1, q2)
            
    # Mixer layer e^{-i beta sum X_j} -> Rx(2*beta) on all qubits
    for q in range(num_qubits):
        qc.rx(2 * beta, q)
        
    return qc

def run_qaoa_simulation(
    sequence: str, 
    max_iterations: int = 40,
    force_fallback: bool = False
) -> Dict:
    """
    Runs QAOA quantum optimization for a given protein sequence using local Qiskit simulation.
    """
    seq_info = get_sequence_info(sequence)
    total_qubits = seq_info["estimated_total_qubits"]
    config_qubits = seq_info["config_qubits"]
    
    if force_fallback or config_qubits > 12:
        reason = f"Classical fallback used because requested sequence ({config_qubits} configuration qubits) exceeds practical local quantum simulation limits."
        return run_classical_fallback_optimization(sequence, max_iterations=max_iterations, reason=reason)
    
    pauli_op, energy_vec, n_qubits = build_diagonal_hamiltonian_pauli(sequence, max_qubits=config_qubits)
    
    trajectory = []
    eval_count = 0
    
    def objective_function(params: np.ndarray) -> float:
        nonlocal eval_count
        eval_count += 1
        gamma, beta = params[0], params[1]
        qc = create_qaoa_circuit(pauli_op, gamma, beta, n_qubits)
        sv = Statevector.from_instruction(qc)
        val = float(np.real(sv.expectation_value(pauli_op)))
        if eval_count <= max_iterations:
            trajectory.append({
                "iteration": eval_count,
                "energy": round(val, 4)
            })
        return val

    np.random.seed(42)
    initial_params = np.array([np.pi / 4, np.pi / 4])
    
    opt_res = minimize(
        objective_function, 
        initial_params, 
        method='COBYLA', 
        options={'maxiter': max_iterations}
    )
    
    optimal_gamma, optimal_beta = opt_res.x[0], opt_res.x[1]
    final_qc = create_qaoa_circuit(pauli_op, optimal_gamma, optimal_beta, n_qubits)
    sampled_bitstrings = sample_circuit_bitstrings(final_qc, [], shots=1000)
    
    best_candidate = None
    min_valid_energy = float('inf')
    landscape = []
    
    for bstr, prob in sampled_bitstrings[:16]:
        eval_res = evaluate_bitstring_energy(sequence, bstr)
        eval_res["probability"] = round(prob, 4)
        landscape.append({
            "bitstring": bstr,
            "energy": eval_res["total_energy"],
            "probability": round(prob, 4),
            "is_valid": eval_res["is_valid"],
            "h_gc": eval_res["h_gc"],
            "h_ch": eval_res["h_ch"],
            "h_in": eval_res["h_in"]
        })
        
        if eval_res["is_valid"] and eval_res["total_energy"] < min_valid_energy:
            min_valid_energy = eval_res["total_energy"]
            best_candidate = eval_res
            
    if best_candidate is None and landscape:
        best_candidate = evaluate_bitstring_energy(sequence, landscape[0]["bitstring"])
        
    return {
        "sequence": sequence,
        "method": "QAOA (Quantum Approximate Optimization Algorithm)",
        "backend": "Local Qiskit Statevector Simulator",
        "is_classical_fallback": False,
        "fallback_reason": None,
        "iterations": eval_count,
        "num_qubits": total_qubits,
        "config_qubits": config_qubits,
        "total_energy": best_candidate["total_energy"] if best_candidate else 0.0,
        "h_gc": best_candidate["h_gc"] if best_candidate else 0.0,
        "h_ch": best_candidate["h_ch"] if best_candidate else 0.0,
        "h_in": best_candidate["h_in"] if best_candidate else 0.0,
        "best_bitstring": best_candidate["bitstring"] if best_candidate else "",
        "is_valid": best_candidate["is_valid"] if best_candidate else False,
        "coordinates": best_candidate["coordinates"] if best_candidate else [],
        "contacts": best_candidate["contacts"] if best_candidate else [],
        "trajectory": trajectory,
        "energy_landscape": landscape,
        "sequence_info": seq_info
    }
