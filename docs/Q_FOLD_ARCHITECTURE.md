# Q-FOLD — Architecture & Mathematical Specification

## Overview
Q-FOLD is a quantum-inspired scientific software application for modeling and optimizing protein folding energy landscapes on 3D discrete lattice grids using Qiskit quantum statevector simulators.

## Core Architectural Components

### 1. Protein Lattice Model (`backend/protein/lattice.py`)
- Sequence of $N$ amino acids: $A_1, A_2, \dots, A_N$.
- First amino acid $A_1$ at $(0,0,0)$, second $A_2$ at $(1,0,0)$.
- $N-2$ discrete relative 3D lattice turns mapped by 2 configuration qubits per turn (Right, Left, Up, Down).

### 2. Hamiltonian Construction (`backend/quantum/hamiltonian.py`)
Total Cost Hamiltonian:
$$H(q) = H_{gc}(q_{cf}) + H_{ch}(q_{cf}) + H_{in}(q_{cf}, q_{in})$$

- **Geometrical Penalty $H_{gc}$**: Penalizes spatial overlap ($r_i = r_j$ for $i \neq j$).
- **Chirality Penalty $H_{ch}$**: Penalizes steric loop collisions and unphysical 4-cycles.
- **Interaction Energy $H_{in}$**: Pairwise Miyazawa-Jernigan (MJ) contact energy matrix for non-bonded lattice neighbors $\|r_i - r_j\|_1 = 1$.

### 3. Quantum Solvers (`backend/optimization/`)
- **VQE (Variational Quantum Eigensolver)**: Uses `real_amplitudes` hardware-efficient ansatz with SciPy COBYLA optimizer and Qiskit `Statevector` expectation value calculations.
- **QAOA (Quantum Approximate Optimization Algorithm)**: 1-layer alternating phase separator and transverse mixer simulation.
- **Classical Fallback**: Simulated Annealing fallback for large qubit count instances.

### 4. Interactive 3D Visualization (`frontend/src/components/Protein3DViewer.tsx`)
- Built with Three.js.
- Color-coded amino acid spheres, backbone covalent bond cylinders, non-bonded contact interaction dashed lines, floating text labels, and camera controls.
