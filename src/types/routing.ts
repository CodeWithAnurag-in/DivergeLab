export type NodeId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface GraphNode {
  id: NodeId;
  label: string;
  x: number;
  y: number;
  ip: string;
  asNumber: number;
  loopback: string;
}

export interface GraphEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  cost: number;
  isSevered?: boolean;
  activePulse?: 'cyan' | 'amber' | 'emerald' | 'rose' | null;
}

// Link-State Types
export interface LspPacket {
  routerId: NodeId;
  sequenceNumber: string;
  age: number;
  checksum: string;
  neighbors: { neighborId: NodeId; metric: number }[];
}

export interface DijkstraStep {
  stepIndex: number;
  currentNode: NodeId;
  settledNodes: NodeId[]; // Set N'
  tentativeDistances: Record<NodeId, number>; // D(v)
  predecessors: Record<NodeId, NodeId | null>; // p(v)
  examiningNeighbor?: NodeId;
  relaxedEdge?: { from: NodeId; to: NodeId; oldCost: number; newCost: number };
  explanation: string;
  formulaState: {
    node: NodeId;
    minCost: number;
    calcString: string;
  };
}

// Distance-Vector Types
export interface VectorEntry {
  destination: NodeId;
  cost: number;
  nextHop: NodeId | '-';
}

export type RoutingTableMap = Record<NodeId, Record<NodeId, VectorEntry>>;

export interface DistanceVectorStep {
  cycle: number;
  converged: boolean;
  tables: RoutingTableMap;
  exchanges: {
    from: NodeId;
    to: NodeId;
    vector: Record<NodeId, number>;
  }[];
  activeUpdates: {
    node: NodeId;
    dest: NodeId;
    oldCost: number;
    newCost: number;
    via: NodeId;
  }[];
  explanation: string;
}

// Pathology Types
export interface PathologyNodeState {
  id: 'A' | 'B' | 'C';
  distanceToA: number;
  nextHopToA: 'A' | 'B' | 'C' | 'DIRECT' | 'UNREACHABLE';
}

export interface PathologyIteration {
  iteration: number;
  linkSevered: boolean;
  bState: PathologyNodeState;
  cState: PathologyNodeState;
  packetExchanged?: {
    from: 'B' | 'C';
    to: 'B' | 'C';
    advertisedCost: number | 'INF';
    type: 'STANDARD' | 'SPLIT_HORIZON_SUPPRESSED' | 'POISONED_REVERSE';
  };
  eventLog: string;
}

// FIB Types
export interface FibEntry {
  prefix: string;
  destinationNode: NodeId;
  nextHopIp: string;
  interfaceName: string;
  metric: number;
  flags: string;
  status: 'ACTIVE' | 'CONVERGING' | 'STALE';
}

export interface KernelFibTelemetry {
  algorithm: 'LINK_STATE' | 'DISTANCE_VECTOR';
  convergenceTimeMs: number;
  memoryKb: number;
  cpuOverhead: string;
  entries: FibEntry[];
}
