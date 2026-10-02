export interface AminoAcidInfo {
  index: number;
  code: string;
  name: string;
  type: string;
  charge: number;
}

export interface SequenceInfo {
  sequence: string;
  length: number;
  num_turns: number;
  config_qubits: number;
  interaction_qubits: number;
  estimated_total_qubits: number;
  search_space_size: number;
  hydrophobic_count: number;
  polar_count: number;
  amino_acids: AminoAcidInfo[];
}

export interface QubitDetail {
  index: number;
  name: string;
  role: string;
  turn_index: number | null;
  aa_pair: string;
  type: 'geometry' | 'interaction';
}

export interface EncodingDetails {
  sequence: string;
  length: number;
  num_turns: number;
  config_qubits: number;
  interaction_qubits: number;
  total_qubits: number;
  encoding_strategy: string;
  qubit_list: QubitDetail[];
  reference_comparison: {
    reference_bradykinin_qubits: number;
    our_bradykinin_qubits: number;
    explanation: string;
  };
}

export interface ContactInfo {
  aa1_index: number;
  aa1_code: string;
  aa2_index: number;
  aa2_code: string;
  energy: number;
  pos1: [number, number, number];
  pos2: [number, number, number];
}

export interface TrajectoryPoint {
  iteration: number;
  energy: number;
  best_energy?: number;
}

export interface LandscapeCandidate {
  bitstring: string;
  energy: number;
  probability?: number;
  is_valid: boolean;
  h_gc: number;
  h_ch: number;
  h_in: number;
}

export interface SimulationResult {
  simulation_id?: string;
  sequence: string;
  method: string;
  backend?: string;
  is_classical_fallback: boolean;
  fallback_reason?: string | null;
  iterations: number;
  num_qubits: number;
  config_qubits?: number;
  total_energy: number;
  h_gc: number;
  h_ch: number;
  h_in: number;
  best_bitstring: string;
  is_valid: boolean;
  coordinates: [number, number, number][];
  contacts: ContactInfo[];
  trajectory: TrajectoryPoint[];
  energy_landscape: LandscapeCandidate[];
  sequence_info: SequenceInfo;
}
