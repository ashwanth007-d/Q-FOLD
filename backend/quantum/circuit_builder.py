"""
Parameterized Quantum Circuit Builder and Statevector Simulator using Qiskit 2.x.
"""

from typing import List, Tuple
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import real_amplitudes
from qiskit.quantum_info import Statevector, SparsePauliOp

def create_ansatz_circuit(num_qubits: int, reps: int = 1) -> QuantumCircuit:
    """
    Creates a hardware-efficient parameterized quantum circuit (real_amplitudes ansatz)
    with Ry rotations and CZ entangling gates.
    """
    # Use standard real_amplitudes function from Qiskit 2.x
    ansatz = real_amplitudes(num_qubits=num_qubits, reps=reps, entanglement='linear')
    return ansatz

def compute_expectation_value(
    ansatz: QuantumCircuit, 
    parameters: np.ndarray, 
    pauli_op: SparsePauliOp
) -> float:
    """
    Computes exact expectation value <psi(theta)| H |psi(theta)> using Qiskit Statevector.
    """
    # Bind parameters to circuit
    bound_circuit = ansatz.assign_parameters(parameters)
    # Compute statevector from circuit
    sv = Statevector.from_instruction(bound_circuit)
    # Compute expectation value <sv| H |sv>
    expectation = sv.expectation_value(pauli_op)
    return float(np.real(expectation))

def sample_circuit_bitstrings(
    ansatz: QuantumCircuit, 
    parameters: np.ndarray, 
    shots: int = 1000
) -> List[Tuple[str, float]]:
    """
    Samples computational basis bitstrings from the optimized statevector.
    Returns list of (bitstring, probability) sorted by highest probability.
    """
    bound_circuit = ansatz.assign_parameters(parameters)
    sv = Statevector.from_instruction(bound_circuit)
    probs = sv.probabilities_dict()
    
    # Sort bitstrings by probability descending
    sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)
    return sorted_probs
