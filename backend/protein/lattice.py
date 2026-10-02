"""
3D Lattice folding engine for protein conformations.
Generates 3D coordinates from turn bitstrings and computes Hamiltonian terms: H_gc, H_ch, H_in.
"""

from typing import Dict, List, Tuple
import numpy as np
from .mj_matrix import get_contact_energy

# Direction mapping relative to local 3D direction vector v
def get_next_direction(v: Tuple[int, int, int], turn_code: int) -> Tuple[int, int, int]:
    """
    turn_code:
    0: Right (+90 deg local X-Y or equivalent)
    1: Left  (-90 deg local X-Y or equivalent)
    2: Up    (+90 deg local Z)
    3: Down  (-90 deg local Z)
    """
    vx, vy, vz = v
    if vx == 1:
        table = [(0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)]
    elif vx == -1:
        table = [(0, -1, 0), (0, 1, 0), (0, 0, -1), (0, 0, 1)]
    elif vy == 1:
        table = [(-1, 0, 0), (1, 0, 0), (0, 0, 1), (0, 0, -1)]
    elif vy == -1:
        table = [(1, 0, 0), (-1, 0, 0), (0, 0, -1), (0, 0, 1)]
    elif vz == 1:
        table = [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0)]
    else: # vz == -1
        table = [(-1, 0, 0), (1, 0, 0), (0, -1, 0), (0, 1, 0)]
    
    return table[turn_code % 4]

def bitstring_to_turns(bitstring: str, num_turns: int) -> List[int]:
    """
    Converts a bitstring (e.g. "011000...") into a list of turn integer codes (0-3).
    Each turn is encoded by 2 bits.
    """
    turns = []
    # Pad bitstring if needed
    needed_bits = num_turns * 2
    padded = bitstring.ljust(needed_bits, '0')
    
    for i in range(num_turns):
        pair = padded[2*i : 2*i + 2]
        turn_code = int(pair, 2)
        turns.append(turn_code)
    return turns

def generate_coordinates(sequence: str, turns: List[int]) -> List[Tuple[int, int, int]]:
    """
    Generates 3D integer coordinates for each amino acid given a sequence and list of turn codes.
    """
    n = len(sequence)
    coords = [(0, 0, 0)]
    if n == 1:
        return coords
    
    # Second amino acid placed at (1, 0, 0)
    coords.append((1, 0, 0))
    current_v = (1, 0, 0)
    current_pos = (1, 0, 0)
    
    for i in range(n - 2):
        turn_code = turns[i] if i < len(turns) else 0
        current_v = get_next_direction(current_v, turn_code)
        current_pos = (
            current_pos[0] + current_v[0],
            current_pos[1] + current_v[1],
            current_pos[2] + current_v[2]
        )
        coords.append(current_pos)
    
    return coords

def compute_hamiltonian_components(
    sequence: str, 
    coords: List[Tuple[int, int, int]], 
    lambda_gc: float = 50.0, 
    lambda_ch: float = 10.0
) -> Dict:
    """
    Computes H_gc (Geometrical constraint), H_ch (Chirality constraint), H_in (Interaction energy),
    and total energy H = H_gc + H_ch + H_in.
    """
    n = len(coords)
    
    # 1. H_gc: Geometrical constraint (Penalize overlaps / collisions)
    unique_coords = set(coords)
    num_collisions = n - len(unique_coords)
    
    # Also check if any duplicate position occurs multiple times
    coord_counts = {}
    for c in coords:
        coord_counts[c] = coord_counts.get(c, 0) + 1
    
    extra_collisions = sum(count - 1 for count in coord_counts.values())
    h_gc = lambda_gc * extra_collisions
    
    # 2. H_ch: Chirality constraint / steric loop violations
    # Penalize 4-cycle loop self-intersections or unphysical sharp chirality reversals
    h_ch_violations = 0
    for i in range(n - 3):
        # Check if i and i+3 form an impossible tight fold
        if coords[i] == coords[i+3]:
            h_ch_violations += 1
    h_ch = lambda_ch * h_ch_violations
    
    # 3. H_in: Interaction energy between non-bonded lattice neighbors
    h_in = 0.0
    contacts = []
    
    for i in range(n):
        for j in range(i + 2, n):
            # Check Manhattan distance
            dist = abs(coords[i][0] - coords[j][0]) + abs(coords[i][1] - coords[j][1]) + abs(coords[i][2] - coords[j][2])
            if dist == 1: # Adjacent in 3D lattice
                energy = get_contact_energy(sequence[i], sequence[j])
                h_in += energy
                contacts.append({
                    "aa1_index": i,
                    "aa1_code": sequence[i],
                    "aa2_index": j,
                    "aa2_code": sequence[j],
                    "energy": energy,
                    "pos1": list(coords[i]),
                    "pos2": list(coords[j])
                })
    
    total_energy = h_gc + h_ch + h_in
    is_valid = (extra_collisions == 0)
    
    return {
        "h_gc": round(h_gc, 4),
        "h_ch": round(h_ch, 4),
        "h_in": round(h_in, 4),
        "total_energy": round(total_energy, 4),
        "num_collisions": extra_collisions,
        "chirality_violations": h_ch_violations,
        "is_valid": is_valid,
        "contacts": contacts,
        "coordinates": [list(c) for c in coords]
    }
