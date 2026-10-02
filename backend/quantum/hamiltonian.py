"""
Hamiltonian builder and cost evaluator for quantum protein folding.
Maps lattice energy penalties H_gc, H_ch, H_in to diagonal Ising Pauli Hamiltonian H.
"""

import os
import sys
from typing import Dict, List, Tuple
import numpy as np
from qiskit.quantum_info import SparsePauliOp

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from backend.protein.sequence import get_sequence_info
    from backend.protein.lattice import (
        bitstring_to_turns, 
        generate_coordinates, 
        compute_hamiltonian_components
    )
except ModuleNotFoundError:
    from protein.sequence import get_sequence_info
    from protein.lattice import (
        bitstring_to_turns, 
        generate_coordinates, 
        compute_hamiltonian_components
    )

def evaluate_bitstring_energy(sequence: str, bitstring: str) -> Dict:
    """
    Evaluates exact H_gc, H_ch, H_in, H_total and coordinates for a given binary bitstring.
    """
    seq_info = get_sequence_info(sequence)
    num_turns = seq_info["num_turns"]
    turns = bitstring_to_turns(bitstring, num_turns)
    coords = generate_coordinates(sequence, turns)
    components = compute_hamiltonian_components(sequence, coords)
    components["bitstring"] = bitstring
    components["turns"] = turns
    return components

def build_diagonal_hamiltonian_pauli(sequence: str, max_qubits: int = 12) -> Tuple[SparsePauliOp, List[float], int]:
    """
    Builds a Qiskit SparsePauliOp representing the cost Hamiltonian H(q) in Z basis.
    Returns (pauli_op, energy_vector, num_qubits).
    """
    seq_info = get_sequence_info(sequence)
    num_qubits = seq_info["config_qubits"]
    
    # Cap qubits for full basis enumeration if necessary
    effective_qubits = min(num_qubits, max_qubits)
    num_states = 1 << effective_qubits
    
    energies = np.zeros(num_states, dtype=float)
    
    for i in range(num_states):
        # Format bitstring
        bstr = format(i, f'0{effective_qubits}b')
        comp = evaluate_bitstring_energy(sequence, bstr)
        energies[i] = comp["total_energy"]
    
    # Fast Walsh-Hadamard transform to extract Pauli Z string coefficients
    # H = sum_S c_S Z_S
    # c_S = (1 / 2^n) sum_x f(x) (-1)^(S . x)
    n = effective_qubits
    coeffs = energies.copy()
    
    # In-place Walsh-Hadamard Transform
    for len_block in range(1, n + 1):
        half = 1 << (len_block - 1)
        for i in range(0, num_states, 1 << len_block):
            for j in range(half):
                u = coeffs[i + j]
                v = coeffs[i + j + half]
                coeffs[i + j] = u + v
                coeffs[i + j + half] = u - v
                
    coeffs /= num_states
    
    # Build Pauli operators for non-zero terms
    pauli_list = []
    threshold = 1e-6
    
    for mask in range(num_states):
        c = coeffs[mask]
        if abs(c) > threshold:
            # Construct Pauli string (Z or I at each qubit index)
            # Qiskit qubit order: index 0 is rightmost in bitstring
            chars = []
            for q in range(n):
                if (mask >> q) & 1:
                    chars.append('Z')
                else:
                    chars.append('I')
            # Reverse string for Qiskit qubit indexing convention (q_{n-1} ... q_0)
            pauli_str = "".join(reversed(chars))
            pauli_list.append((pauli_str, float(c)))
            
    if not pauli_list:
        pauli_list.append(('I' * n, 0.0))
        
    pauli_op = SparsePauliOp.from_list(pauli_list)
    return pauli_op, energies.tolist(), n
