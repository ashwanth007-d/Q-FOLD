"""
Quantum Encoding module for mapping protein conformations to qubits.
"""

import os
import sys
from typing import Dict, List

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from backend.protein.sequence import get_sequence_info
except ModuleNotFoundError:
    from protein.sequence import get_sequence_info

def get_quantum_encoding_details(sequence: str) -> Dict:
    """
    Returns complete quantum encoding breakdown including:
    - Configuration qubits (geometry turn space)
    - Interaction qubits (non-bonded contacts)
    - Total qubits required
    - Qubit diagram specification
    - Explanations
    """
    seq_info = get_sequence_info(sequence)
    n_amino = seq_info["length"]
    n_turns = seq_info["num_turns"]
    config_qubits = seq_info["config_qubits"]
    interaction_qubits = seq_info["interaction_qubits"]
    total_qubits = seq_info["estimated_total_qubits"]
    
    qubits = []
    # Configuration qubits
    for i in range(n_turns):
        q_idx1 = 2 * i
        q_idx2 = 2 * i + 1
        qubits.append({
            "index": q_idx1,
            "name": f"q_{q_idx1}",
            "role": "Configuration (Turn Bit 0)",
            "turn_index": i,
            "aa_pair": f"{sequence[i+1]} -> {sequence[i+2]}",
            "type": "geometry"
        })
        qubits.append({
            "index": q_idx2,
            "name": f"q_{q_idx2}",
            "role": "Configuration (Turn Bit 1)",
            "turn_index": i,
            "aa_pair": f"{sequence[i+1]} -> {sequence[i+2]}",
            "type": "geometry"
        })
    
    # Interaction qubits
    for j in range(interaction_qubits):
        q_idx = config_qubits + j
        qubits.append({
            "index": q_idx,
            "name": f"q_{q_idx}",
            "role": f"Interaction Contact {j+1}",
            "turn_index": None,
            "aa_pair": "Pairwise contact state",
            "type": "interaction"
        })
        
    return {
        "sequence": sequence,
        "length": n_amino,
        "num_turns": n_turns,
        "config_qubits": config_qubits,
        "interaction_qubits": interaction_qubits,
        "total_qubits": total_qubits,
        "encoding_strategy": "Relative 3D Lattice Turn Space (2 Qubits / Turn) + Pairwise Interaction Qubits",
        "qubit_list": qubits,
        "reference_comparison": {
            "reference_bradykinin_qubits": 17,
            "our_bradykinin_qubits": total_qubits,
            "explanation": (
                "The reference project (Perdomo-Ortiz et al. / Robert et al.) encodes Bradykinin (9 AAs) "
                "on a tetrahedral/3D lattice using 14 configuration qubits for 7 relative turn angles and 3 interaction qubits (total 17 qubits). "
                f"Our implementation uses {total_qubits} qubits based on the same turn-based lattice decomposition."
            )
        }
    }
