"""
Variational Quantum Eigensolver (VQE) implementation for Quantum Protein Folding.
Uses Qiskit parameterized ansatz circuits + scipy.optimize minimization.
"""

import os
import sys
from typing import Dict, List
import numpy as np
from scipy.optimize import minimize

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from backend.protein.sequence import get_sequence_info
    from backend.protein.lattice import (
        bitstring_to_turns, 
        generate_coordinates, 
        compute_hamiltonian_components
    )
    from backend.quantum.hamiltonian import (
        build_diagonal_hamiltonian_pauli, 
        evaluate_bitstring_energy
    )
    from backend.quantum.circuit_builder import (
        create_ansatz_circuit, 
        compute_expectation_value, 
        sample_circuit_bitstrings
    )
    from backend.optimization.classical_fallback import run_classical_fallback_optimization
except ModuleNotFoundError:
    from protein.sequence import get_sequence_info
    from protein.lattice import (
        bitstring_to_turns, 
        generate_coordinates, 
        compute_hamiltonian_components
    )
    from quantum.hamiltonian import (
        build_diagonal_hamiltonian_pauli, 
        evaluate_bitstring_energy
    )
    from quantum.circuit_builder import (
        create_ansatz_circuit, 
        compute_expectation_value, 
        sample_circuit_bitstrings
    )
    from optimization.classical_fallback import run_classical_fallback_optimization

def run_vqe_simulation(
    sequence: str, 
    max_iterations: int = 50,
    reps: int = 1,
    force_fallback: bool = False
) -> Dict:
    """
    Runs VQE quantum optimization for a given protein sequence using local Qiskit simulation.
    """
    seq_info = get_sequence_info(sequence)
    total_qubits = seq_info["estimated_total_qubits"]
    config_qubits = seq_info["config_qubits"]
    
    # If qubit count is too large for fast interactive local simulation (> 12 config qubits) or explicitly forced:
    if force_fallback or config_qubits > 12:
        reason = f"Classical fallback used because requested sequence ({config_qubits} configuration qubits) exceeds practical local quantum simulation limits."
        return run_classical_fallback_optimization(sequence, max_iterations=max_iterations, reason=reason)
    
    # Construct cost Hamiltonian operator
    pauli_op, energy_vec, n_qubits = build_diagonal_hamiltonian_pauli(sequence, max_qubits=config_qubits)
    
    # Construct RealAmplitudes ansatz circuit
    ansatz = create_ansatz_circuit(n_qubits, reps=reps)
    num_params = ansatz.num_parameters
    
    # Trajectory tracker
    trajectory = []
    eval_count = 0
    
    # Objective function for SciPy minimize
    def objective_function(params: np.ndarray) -> float:
        nonlocal eval_count
        eval_count += 1
        val = compute_expectation_value(ansatz, params, pauli_op)
        if eval_count <= max_iterations:
            trajectory.append({
                "iteration": eval_count,
                "energy": round(val, 4)
            })
        return val

    # Initial parameter guess
    np.random.seed(42)
    initial_params = np.random.uniform(0, 2 * np.pi, size=num_params)
    
    # Optimize using SciPy COBYLA
    opt_res = minimize(
        objective_function, 
        initial_params, 
        method='COBYLA', 
        options={'maxiter': max_iterations, 'rhobeg': 0.5}
    )
    
    optimal_params = opt_res.x
    
    # Sample candidate bitstrings from optimal quantum state vector
    sampled_bitstrings = sample_circuit_bitstrings(ansatz, optimal_params, shots=1000)
    
    # Find lowest energy valid folding candidate from sampled quantum states
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
            
    # If no valid candidate was sampled in top states, fallback to top state or full search
    if best_candidate is None and landscape:
        best_candidate = evaluate_bitstring_energy(sequence, landscape[0]["bitstring"])
        
    return {
        "sequence": sequence,
        "method": "VQE (Variational Quantum Eigensolver)",
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
