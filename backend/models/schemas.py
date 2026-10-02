"""
API Request and Response schemas for Q-FOLD backend.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class ValidateSequenceRequest(BaseModel):
    sequence: str = Field(..., example="APRLRFYMN")

class OptimizationRequest(BaseModel):
    sequence: str = Field(default="APRLRFYMN", example="APRLRFYMN")
    method: str = Field(default="VQE", example="VQE") # VQE, QAOA, Classical
    max_iterations: int = Field(default=50, ge=5, le=300)
    force_fallback: bool = Field(default=False)

class SimulationResponse(BaseModel):
    simulation_id: str
    sequence: str
    num_amino_acids: int
    num_qubits: int
    config_qubits: int
    method: str
    backend: str
    is_classical_fallback: bool
    fallback_reason: Optional[str] = None
    energy: float
    h_gc: float
    h_ch: float
    h_in: float
    is_valid: bool
    iterations: int
    coordinates: List[List[int]]
    contacts: List[Dict[str, Any]]
    trajectory: List[Dict[str, Any]]
    energy_landscape: List[Dict[str, Any]]
    sequence_info: Dict[str, Any]
