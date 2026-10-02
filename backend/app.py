"""
Q-FOLD FastAPI Web Application & REST API Server.
"""

import os
import sys

# Ensure current and parent directory are in sys.path so 'backend' module is always found
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if os.path.dirname(__file__) not in sys.path:
    sys.path.insert(0, os.path.dirname(__file__))

import uuid
from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.protein.sequence import validate_sequence, get_sequence_info, BRADYKININ_SEQUENCE
from backend.quantum.encoding import get_quantum_encoding_details
from backend.optimization.vqe_solver import run_vqe_simulation
from backend.optimization.qaoa_solver import run_qaoa_simulation
from backend.optimization.classical_fallback import run_classical_fallback_optimization
from backend.models.schemas import ValidateSequenceRequest, OptimizationRequest

app = FastAPI(
    title="Q-FOLD — Quantum Protein Folding Optimizer API",
    description="REST API for quantum optimization of 3D lattice protein folding landscapes using Qiskit.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static frontend files if built static or frontend/dist directory exists
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
if not os.path.exists(static_dir):
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")

# In-memory storage for active simulation sessions
SIMULATIONS_STORE: Dict[str, Dict] = {}

@app.get("/")
def read_root():
    return {
        "service": "Q-FOLD API",
        "status": "online",
        "description": "Quantum Optimization of Protein Folding Landscapes"
    }

@app.post("/api/protein/validate")
def validate_protein(req: ValidateSequenceRequest):
    is_valid, cleaned, err = validate_sequence(req.sequence)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err)
    
    info = get_sequence_info(cleaned)
    encoding = get_quantum_encoding_details(cleaned)
    return {
        "valid": True,
        "info": info,
        "encoding": encoding
    }

@app.get("/api/protein/bradykinin")
def get_bradykinin_info():
    info = get_sequence_info(BRADYKININ_SEQUENCE)
    encoding = get_quantum_encoding_details(BRADYKININ_SEQUENCE)
    return {
        "sequence": BRADYKININ_SEQUENCE,
        "info": info,
        "encoding": encoding,
        "reference_note": "Bradykinin 9-AA demo model uses 17 qubits (14 config + 3 interaction)."
    }

@app.post("/api/simulation/start")
def start_simulation(req: OptimizationRequest):
    is_valid, cleaned, err = validate_sequence(req.sequence)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err)
    
    sim_id = str(uuid.uuid4())
    info = get_sequence_info(cleaned)
    
    SIMULATIONS_STORE[sim_id] = {
        "simulation_id": sim_id,
        "sequence": cleaned,
        "status": "initialized",
        "params": req.dict(),
        "info": info,
        "result": None
    }
    
    return {
        "simulation_id": sim_id,
        "sequence": cleaned,
        "status": "initialized",
        "info": info
    }

@app.post("/api/simulation/optimize")
def optimize_simulation(req: OptimizationRequest):
    is_valid, cleaned, err = validate_sequence(req.sequence)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err)
    
    method_upper = req.method.upper()
    
    if method_upper == "QAOA":
        res = run_qaoa_simulation(
            cleaned, 
            max_iterations=req.max_iterations, 
            force_fallback=req.force_fallback
        )
    elif method_upper == "CLASSICAL":
        res = run_classical_fallback_optimization(
            cleaned, 
            max_iterations=req.max_iterations, 
            reason="Classical optimization selected by user."
        )
    else: # Default VQE
        res = run_vqe_simulation(
            cleaned, 
            max_iterations=req.max_iterations, 
            force_fallback=req.force_fallback
        )
        
    sim_id = str(uuid.uuid4())
    res["simulation_id"] = sim_id
    SIMULATIONS_STORE[sim_id] = res
    return res

@app.get("/api/simulation/{sim_id}")
def get_simulation(sim_id: str):
    if sim_id not in SIMULATIONS_STORE:
        raise HTTPException(status_code=404, detail="Simulation ID not found.")
    return SIMULATIONS_STORE[sim_id]

@app.get("/api/simulation/{sim_id}/result")
def get_simulation_result(sim_id: str):
    if sim_id not in SIMULATIONS_STORE:
        raise HTTPException(status_code=404, detail="Simulation ID not found.")
    sim = SIMULATIONS_STORE[sim_id]
    return {
        "simulation_id": sim_id,
        "sequence": sim.get("sequence"),
        "total_energy": sim.get("total_energy"),
        "h_gc": sim.get("h_gc"),
        "h_ch": sim.get("h_ch"),
        "h_in": sim.get("h_in"),
        "coordinates": sim.get("coordinates"),
        "contacts": sim.get("contacts"),
        "is_valid": sim.get("is_valid")
    }

@app.get("/api/simulation/{sim_id}/energy")
def get_simulation_energy(sim_id: str):
    if sim_id not in SIMULATIONS_STORE:
        raise HTTPException(status_code=404, detail="Simulation ID not found.")
    sim = SIMULATIONS_STORE[sim_id]
    return {
        "simulation_id": sim_id,
        "trajectory": sim.get("trajectory", []),
        "energy_landscape": sim.get("energy_landscape", []),
        "total_energy": sim.get("total_energy")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
