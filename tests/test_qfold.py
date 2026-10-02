"""
Comprehensive test suite for Q-FOLD backend.
"""

import pytest
from fastapi.testclient import TestClient

from backend.protein.sequence import validate_sequence, get_sequence_info, BRADYKININ_SEQUENCE
from backend.protein.lattice import generate_coordinates, compute_hamiltonian_components, bitstring_to_turns
from backend.quantum.encoding import get_quantum_encoding_details
from backend.quantum.hamiltonian import build_diagonal_hamiltonian_pauli, evaluate_bitstring_energy
from backend.optimization.vqe_solver import run_vqe_simulation
from backend.optimization.qaoa_solver import run_qaoa_simulation
from backend.optimization.classical_fallback import run_classical_fallback_optimization
from backend.app import app

client = TestClient(app)

def test_sequence_validation():
    valid, cleaned, err = validate_sequence("A P R L R F Y M N")
    assert valid is True
    assert cleaned == "APRLRFYMN"
    
    valid_invalid, _, err_msg = validate_sequence("APRLX")
    assert valid_invalid is False
    assert "Invalid amino acid" in err_msg

def test_bradykinin_info():
    info = get_sequence_info(BRADYKININ_SEQUENCE)
    assert info["length"] == 9
    assert info["num_turns"] == 7
    assert info["config_qubits"] == 14

def test_lattice_coordinates():
    turns = [0, 1, 2, 3] # R, L, U, D
    coords = generate_coordinates("APRLR", turns)
    assert len(coords) == 5
    assert coords[0] == (0, 0, 0)
    assert coords[1] == (1, 0, 0)
    
    res = compute_hamiltonian_components("APRLR", coords)
    assert "total_energy" in res
    assert "h_gc" in res
    assert "h_ch" in res
    assert "h_in" in res

def test_quantum_encoding():
    enc = get_quantum_encoding_details("APRLRFYMN")
    assert enc["config_qubits"] == 14
    assert enc["total_qubits"] == 17
    assert len(enc["qubit_list"]) == 17

def test_vqe_solver_short():
    res = run_vqe_simulation("APRL", max_iterations=15)
    assert res["method"].startswith("VQE")
    assert res["is_classical_fallback"] is False
    assert "total_energy" in res
    assert len(res["trajectory"]) > 0

def test_classical_fallback_long():
    # Bradykinin 9-AA has 14 config qubits -> triggers classical fallback or VQE
    res = run_vqe_simulation("APRLRFYMN", max_iterations=20)
    assert res["is_classical_fallback"] is True
    assert "Classical fallback used" in res["fallback_reason"]
    assert res["is_valid"] is True

def test_qaoa_solver_short():
    res = run_qaoa_simulation("APR", max_iterations=10)
    assert res["method"].startswith("QAOA")
    assert res["is_classical_fallback"] is False

def test_api_endpoints():
    res_root = client.get("/")
    assert res_root.status_code == 200
    
    res_val = client.post("/api/protein/validate", json={"sequence": "APRL"})
    assert res_val.status_code == 200
    assert res_val.json()["valid"] is True
    
    res_opt = client.post("/api/simulation/optimize", json={"sequence": "APRL", "method": "VQE", "max_iterations": 10})
    assert res_opt.status_code == 200
    data = res_opt.json()
    assert "total_energy" in data
    assert "coordinates" in data
    assert "simulation_id" in data
