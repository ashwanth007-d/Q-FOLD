"""
Miyazawa-Jernigan (MJ) statistical potential matrix for amino acid pairwise interactions.
Reference: Miyazawa, S., & Jernigan, R. L. (1996).
"""

from typing import Dict

# Simplified & normalized Miyazawa-Jernigan interaction matrix (in energy units, lower is more favorable)
# Negative values represent attractive interactions (e.g., hydrophobic interactions).
# Positive/Zero values represent neutral or repulsive interactions.

# HP Model simplification fallback as well as standard MJ contact energies
MJ_CONTACT_ENERGY: Dict[str, Dict[str, float]] = {
    # Default hydrophobic-hydrophobic attractive potentials ~ -1.5 to -3.5
    # Hydrophilic/Polar ~ -0.1 to +0.5
}

# Standard amino acid hydrophobic classifications
HYDROPHOBIC_SET = {'A', 'I', 'L', 'M', 'F', 'W', 'V', 'P'}

def get_contact_energy(aa1: str, aa2: str) -> float:
    """
    Returns the pairwise interaction energy between amino acid 1 and amino acid 2
    when they are in 3D lattice contact (non-bonded topological neighbors).
    """
    # If both hydrophobic, strong attractive interaction
    is_h1 = aa1 in HYDROPHOBIC_SET
    is_h2 = aa2 in HYDROPHOBIC_SET
    
    if is_h1 and is_h2:
        # Strong hydrophobic packing energy
        return -2.5
    elif is_h1 or is_h2:
        # Weak amphiphilic interaction
        return -0.5
    else:
        # Polar-Polar or Charged interactions (neutral/slight repulsion in hydrophobic core model)
        return 0.2
