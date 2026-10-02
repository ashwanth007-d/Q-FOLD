"""
Classical lattice optimization engine (Branch & Bound / Simulated Annealing).
Used as an explicit fallback when sequence complexity exceeds local quantum simulation limits.
"""

import os
import sys
from typing import Dict, List
import numpy as np

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from backend.protein.sequence import get_sequence_info
    from backend.protein.lattice import (
        bitstring_to_turns, 
        generate_coordinates, 
        compute_hamiltonian_components
    )
    from backend.quantum.hamiltonian import evaluate_bitstring_energy
except ModuleNotFoundError:
    from protein.sequence import get_sequence_info
    from protein.lattice import (
        bitstring_to_turns, 
        generate_coordinates, 
        compute_hamiltonian_components
    )
    from quantum.hamiltonian import evaluate_bitstring_energy

def run_classical_fallback_optimization(
    sequence: str, 
    max_iterations: int = 100,
    reason: str = "Classical fallback used because requested sequence exceeds practical local quantum simulation limits."
) -> Dict:
    """
    Performs classical conformational energy optimization over the 3D lattice space.
    """
    seq_info = get_sequence_info(sequence)
    n_turns = seq_info["num_turns"]
    n_bits = n_turns * 2
    total_states = 1 << n_bits
    
    # Track optimization trajectory
    trajectory = []
    candidates = []
    
    # Simulated Annealing / Greedy Search
    np.random.seed(42)
    current_bit_arr = np.random.randint(0, 2, size=n_bits)
    current_bstr = "".join(map(str, current_bit_arr))
    current_res = evaluate_bitstring_energy(sequence, current_bstr)
    best_res = current_res
    best_bstr = current_bstr
    
    temp = 10.0
    cooling_rate = 0.92
    
    for i in range(1, max_iterations + 1):
        # Flip random bit
        flip_idx = np.random.randint(0, n_bits) if n_bits > 0 else 0
        candidate_bit_arr = current_bit_arr.copy()
        if n_bits > 0:
            candidate_bit_arr[flip_idx] = 1 - candidate_bit_arr[flip_idx]
        candidate_bstr = "".join(map(str, candidate_bit_arr))
        
        cand_res = evaluate_bitstring_energy(sequence, candidate_bstr)
        candidates.append({
            "bitstring": candidate_bstr,
            "energy": cand_res["total_energy"],
            "is_valid": cand_res["is_valid"],
            "h_gc": cand_res["h_gc"],
            "h_ch": cand_res["h_ch"],
            "h_in": cand_res["h_in"]
        })
        
        delta_e = cand_res["total_energy"] - current_res["total_energy"]
        # Metropolis acceptance rule
        if delta_e < 0 or np.random.rand() < np.exp(-delta_e / max(temp, 1e-3)):
            current_bit_arr = candidate_bit_arr
            current_bstr = candidate_bstr
            current_res = cand_res
            
            if current_res["total_energy"] < best_res["total_energy"] and current_res["is_valid"]:
                best_res = current_res
                best_bstr = current_bstr
        
        temp *= cooling_rate
        
        trajectory.append({
            "iteration": i,
            "energy": float(current_res["total_energy"]),
            "best_energy": float(best_res["total_energy"])
        })
        
    # Sort energy landscape candidates
    unique_candidates = {}
    for c in candidates:
        if c["bitstring"] not in unique_candidates:
            unique_candidates[c["bitstring"]] = c
    landscape = sorted(list(unique_candidates.values()), key=lambda x: x["energy"])[:10]
    
    return {
        "sequence": sequence,
        "method": "Classical Fallback (Simulated Annealing)",
        "is_classical_fallback": True,
        "fallback_reason": reason,
        "iterations": max_iterations,
        "num_qubits": seq_info["estimated_total_qubits"],
        "total_energy": best_res["total_energy"],
        "h_gc": best_res["h_gc"],
        "h_ch": best_res["h_ch"],
        "h_in": best_res["h_in"],
        "best_bitstring": best_bstr,
        "is_valid": best_res["is_valid"],
        "coordinates": best_res["coordinates"],
        "contacts": best_res["contacts"],
        "trajectory": trajectory,
        "energy_landscape": landscape,
        "sequence_info": seq_info
    }
