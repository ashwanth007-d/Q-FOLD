"""
Amino acid sequence parser and validator.
"""

from typing import Dict, List, Tuple

# Standard 20 Amino Acids with single-letter codes
VALID_AMINO_ACIDS = {
    'A': {'name': 'Alanine', 'type': 'Hydrophobic', 'charge': 0, 'mass': 89.1},
    'R': {'name': 'Arginine', 'type': 'Basic', 'charge': 1, 'mass': 174.2},
    'N': {'name': 'Asparagine', 'type': 'Polar', 'charge': 0, 'mass': 132.1},
    'D': {'name': 'Aspartic Acid', 'type': 'Acidic', 'charge': -1, 'mass': 133.1},
    'C': {'name': 'Cysteine', 'type': 'Polar', 'charge': 0, 'mass': 121.2},
    'E': {'name': 'Glutamic Acid', 'type': 'Acidic', 'charge': -1, 'mass': 147.1},
    'Q': {'name': 'Glutamine', 'type': 'Polar', 'charge': 0, 'mass': 146.1},
    'G': {'name': 'Glycine', 'type': 'Special', 'charge': 0, 'mass': 75.1},
    'H': {'name': 'Histidine', 'type': 'Basic', 'charge': 1, 'mass': 155.2},
    'I': {'name': 'Isoleucine', 'type': 'Hydrophobic', 'charge': 0, 'mass': 131.2},
    'L': {'name': 'Leucine', 'type': 'Hydrophobic', 'charge': 0, 'mass': 131.2},
    'K': {'name': 'Lysine', 'type': 'Basic', 'charge': 1, 'mass': 146.2},
    'M': {'name': 'Methionine', 'type': 'Hydrophobic', 'charge': 0, 'mass': 149.2},
    'F': {'name': 'Phenylalanine', 'type': 'Hydrophobic', 'charge': 0, 'mass': 165.2},
    'P': {'name': 'Proline', 'type': 'Special', 'charge': 0, 'mass': 115.1},
    'S': {'name': 'Serine', 'type': 'Polar', 'charge': 0, 'mass': 105.1},
    'T': {'name': 'Threonine', 'type': 'Polar', 'charge': 0, 'mass': 119.1},
    'W': {'name': 'Tryptophan', 'type': 'Hydrophobic', 'charge': 0, 'mass': 204.2},
    'Y': {'name': 'Tyrosine', 'type': 'Polar', 'charge': 0, 'mass': 181.2},
    'V': {'name': 'Valine', 'type': 'Hydrophobic', 'charge': 0, 'mass': 117.1}
}

# Predefined Bradykinin sequence
BRADYKININ_SEQUENCE = "APRLRFYMN"

def validate_sequence(sequence: str) -> Tuple[bool, str, str]:
    """
    Validates an amino acid sequence.
    Returns (is_valid, cleaned_sequence, error_message)
    """
    if not sequence:
        return False, "", "Sequence cannot be empty."
    
    # Remove spaces and convert to uppercase
    cleaned = "".join(sequence.split()).upper()
    
    if len(cleaned) < 3:
        return False, cleaned, "Sequence must contain at least 3 amino acids for 3D lattice folding."
    
    if len(cleaned) > 20:
        return False, cleaned, "Sequence length exceeds 20 amino acids. Local simulation limit is 20 AAs."
    
    invalid_chars = [char for char in cleaned if char not in VALID_AMINO_ACIDS]
    if invalid_chars:
        return False, cleaned, f"Invalid amino acid symbol(s): {', '.join(set(invalid_chars))}. Only standard single-letter codes are allowed."
    
    return True, cleaned, ""

def get_sequence_info(sequence: str) -> Dict:
    """
    Computes sequence statistics and details for visualization and estimation.
    """
    is_valid, cleaned, err = validate_sequence(sequence)
    if not is_valid:
        raise ValueError(err)
    
    n = len(cleaned)
    turns = max(0, n - 2)
    # Turn encoding: 2 qubits per relative turn in 3D (Right, Left, Up, Down)
    config_qubits = turns * 2
    # Potential interaction pairs |i-j| >= 3
    num_contact_pairs = max(0, (n - 2) * (n - 3) // 2)
    interaction_qubits = min(3, num_contact_pairs) # Reference interaction qubit allocation model
    
    total_qubits = config_qubits + interaction_qubits
    
    hydrophobic_count = sum(1 for aa in cleaned if VALID_AMINO_ACIDS[aa]['type'] == 'Hydrophobic')
    polar_count = sum(1 for aa in cleaned if VALID_AMINO_ACIDS[aa]['type'] in ('Polar', 'Basic', 'Acidic'))
    
    return {
        "sequence": cleaned,
        "length": n,
        "num_turns": turns,
        "config_qubits": config_qubits,
        "interaction_qubits": interaction_qubits,
        "estimated_total_qubits": total_qubits,
        "search_space_size": 4 ** turns,
        "hydrophobic_count": hydrophobic_count,
        "polar_count": polar_count,
        "amino_acids": [
            {
                "index": i,
                "code": aa,
                "name": VALID_AMINO_ACIDS[aa]['name'],
                "type": VALID_AMINO_ACIDS[aa]['type'],
                "charge": VALID_AMINO_ACIDS[aa]['charge']
            }
            for i, aa in enumerate(cleaned)
        ]
    }
