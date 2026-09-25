import {
  type NodeId,
  type GraphNode,
  type GraphEdge,
  type DijkstraStep,
  type DistanceVectorStep,
  type RoutingTableMap,
  type LspPacket,
  type PathologyIteration,
  type FibEntry,
  type KernelFibTelemetry
} from '../types/routing';

export const INITIAL_NODES: GraphNode[] = [
  { id: 'A', label: 'Router-A (AS-65001)', x: 120, y: 110, ip: '10.0.1.1', asNumber: 65001, loopback: '192.168.0.1/32' },
  { id: 'B', label: 'Router-B (Core-1)',   x: 350, y: 60,  ip: '10.0.2.1', asNumber: 65001, loopback: '192.168.0.2/32' },
  { id: 'C', label: 'Router-C (AS-65002)', x: 580, y: 110, ip: '10.0.3.1', asNumber: 65001, loopback: '192.168.0.3/32' },
  { id: 'D', label: 'Router-D (Edge-1)',   x: 120, y: 280, ip: '10.0.4.1', asNumber: 65001, loopback: '192.168.0.4/32' },
  { id: 'E', label: 'Router-E (Core-2)',   x: 350, y: 330, ip: '10.0.5.1', asNumber: 65001, loopback: '192.168.0.5/32' },
  { id: 'F', label: 'Router-F (Edge-2)',   x: 580, y: 280, ip: '10.0.6.1', asNumber: 65001, loopback: '192.168.0.6/32' },
];

export const INITIAL_EDGES: GraphEdge[] = [
  { id: 'A-B', source: 'A', target: 'B', cost: 2 },
  { id: 'A-D', source: 'A', target: 'D', cost: 5 },
  { id: 'B-C', source: 'B', target: 'C', cost: 3 },
  { id: 'B-D', source: 'B', target: 'D', cost: 4 },
  { id: 'B-E', source: 'B', target: 'E', cost: 2 },
  { id: 'C-F', source: 'C', target: 'F', cost: 1 },
  { id: 'D-E', source: 'D', target: 'E', cost: 2 },
  { id: 'E-F', source: 'E', target: 'F', cost: 3 },
];

/**
 * Returns active neighbors and weights for a node based on current edges
 */
export function getActiveAdjacency(
  _nodes: GraphNode[],
  edges: GraphEdge[]
): Record<NodeId, Record<NodeId, number>> {
  const adj: Record<NodeId, Record<NodeId, number>> = {
    A: {} as Record<NodeId, number>,
    B: {} as Record<NodeId, number>,
    C: {} as Record<NodeId, number>,
    D: {} as Record<NodeId, number>,
    E: {} as Record<NodeId, number>,
    F: {} as Record<NodeId, number>,
  };

  for (const edge of edges) {
    if (edge.isSevered) continue;
    adj[edge.source][edge.target] = edge.cost;
    adj[edge.target][edge.source] = edge.cost;
  }

  return adj;
}

/**
 * Generate full step-by-step Dijkstra execution trace for Link-State Visualizer
 */
export function computeDijkstraSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  source: NodeId
): DijkstraStep[] {
  const adj = getActiveAdjacency(nodes, edges);
  const nodeIds = nodes.map(n => n.id);
  const steps: DijkstraStep[] = [];

  const settled: NodeId[] = [];
  const dist: Record<NodeId, number> = {
    A: Infinity, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity
  };
  const pred: Record<NodeId, NodeId | null> = {
    A: null, B: null, C: null, D: null, E: null, F: null
  };

  // Step 0: Initialization
  dist[source] = 0;
  for (const n of nodeIds) {
    if (n !== source && adj[source][n] !== undefined) {
      dist[n] = adj[source][n];
      pred[n] = source;
    }
  }

  steps.push({
    stepIndex: 0,
    currentNode: source,
    settledNodes: [source],
    tentativeDistances: { ...dist },
    predecessors: { ...pred },
    explanation: `INIT: Base router ${source} selected. N' = {${source}}, D(${source}) = 0. Tentative costs assigned from flooded LSDB.`,
    formulaState: {
      node: source,
      minCost: 0,
      calcString: `D(${source}) = 0 (Source Root)`
    }
  });

  settled.push(source);

  let stepCount = 1;
  while (settled.length < nodeIds.length) {
    // Find node w not in N' with minimum dist[w]
    let minW: NodeId | null = null;
    let minDist = Infinity;

    for (const n of nodeIds) {
      if (!settled.includes(n)) {
        if (dist[n] < minDist) {
          minDist = dist[n];
          minW = n;
        }
      }
    }

    if (minW === null || minDist === Infinity) {
      // Remaining nodes unreachable
      steps.push({
        stepIndex: stepCount++,
        currentNode: source,
        settledNodes: [...settled],
        tentativeDistances: { ...dist },
        predecessors: { ...pred },
        explanation: `CONVERGENCE REACHED: All remaining nodes are unreachable due to topology partitioning or link severing.`,
        formulaState: {
          node: source,
          minCost: minDist,
          calcString: `SPF Tree complete for set N' = {${settled.join(', ')}}`
        }
      });
      break;
    }

    // Add minW to settled set N'
    settled.push(minW);

    steps.push({
      stepIndex: stepCount++,
      currentNode: minW,
      settledNodes: [...settled],
      tentativeDistances: { ...dist },
      predecessors: { ...pred },
      explanation: `SETTLE: Node ${minW} has lowest tentative distance (${dist[minW]}). Admitted to settled set N' = {${settled.join(', ')}}.`,
      formulaState: {
        node: minW,
        minCost: dist[minW],
        calcString: `w* = argmin_{v ∉ N'} D(v) = ${minW} (Cost: ${dist[minW]})`
      }
    });

    // Relax all unsettled neighbors of minW
    const neighbors = Object.keys(adj[minW]) as NodeId[];
    for (const v of neighbors) {
      if (!settled.includes(v)) {
        const edgeCost = adj[minW][v];
        const candidateCost = dist[minW] + edgeCost;
        const oldCost = dist[v];

        if (candidateCost < oldCost) {
          dist[v] = candidateCost;
          pred[v] = minW;

          steps.push({
            stepIndex: stepCount++,
            currentNode: minW,
            settledNodes: [...settled],
            tentativeDistances: { ...dist },
            predecessors: { ...pred },
            examiningNeighbor: v,
            relaxedEdge: { from: minW, to: v, oldCost, newCost: candidateCost },
            explanation: `RELAXATION: Found shorter path to ${v} via ${minW}. c(${minW},${v}) = ${edgeCost}. D(${v}) updated: ${oldCost === Infinity ? '∞' : oldCost} → ${candidateCost}.`,
            formulaState: {
              node: v,
              minCost: candidateCost,
              calcString: `D(${v}) = min(${oldCost === Infinity ? '∞' : oldCost}, D(${minW}) + c(${minW},${v})) = min(${oldCost === Infinity ? '∞' : oldCost}, ${dist[minW]} + ${edgeCost}) = ${candidateCost}`
            }
          });
        } else {
          steps.push({
            stepIndex: stepCount++,
            currentNode: minW,
            settledNodes: [...settled],
            tentativeDistances: { ...dist },
            predecessors: { ...pred },
            examiningNeighbor: v,
            explanation: `EVALUATE: Path to ${v} via ${minW} costs ${dist[minW]} + ${edgeCost} = ${candidateCost}, which is ≥ current best ${dist[v]}. No update.`,
            formulaState: {
              node: v,
              minCost: dist[v],
              calcString: `D(${v}) = min(${dist[v]}, ${dist[minW]} + ${edgeCost}) = ${dist[v]} (No Relaxation)`
            }
          });
        }
      }
    }
  }

  return steps;
}

/**
 * Generate Link-State Database (LSDB) representation
 */
export function generateLSDB(nodes: GraphNode[], edges: GraphEdge[]): LspPacket[] {
  const adj = getActiveAdjacency(nodes, edges);

  return nodes.map((node, idx) => {
    const neighborKeys = Object.keys(adj[node.id]) as NodeId[];
    const neighbors = neighborKeys.map(nid => ({
      neighborId: nid,
      metric: adj[node.id][nid]
    }));

    return {
      routerId: node.id,
      sequenceNumber: `0x8000000${idx + 3}`,
      age: 24 + idx * 8,
      checksum: `0x${(1234 + idx * 379).toString(16).toUpperCase()}`,
      neighbors
    };
  });
}

/**
 * Generate Distance Vector iterative cycles (Bellman-Ford)
 */
export function computeDistanceVectorCycles(
  nodes: GraphNode[],
  edges: GraphEdge[]
): DistanceVectorStep[] {
  const nodeIds = nodes.map(n => n.id);
  const adj = getActiveAdjacency(nodes, edges);

  // Initial table initialization at t = 0
  const currentTables: RoutingTableMap = {} as RoutingTableMap;
  for (const x of nodeIds) {
    currentTables[x] = {} as Record<NodeId, { destination: NodeId; cost: number; nextHop: NodeId | '-' }>;
    for (const y of nodeIds) {
      if (x === y) {
        currentTables[x][y] = { destination: y, cost: 0, nextHop: '-' };
      } else if (adj[x][y] !== undefined) {
        currentTables[x][y] = { destination: y, cost: adj[x][y], nextHop: y };
      } else {
        currentTables[x][y] = { destination: y, cost: Infinity, nextHop: '-' };
      }
    }
  }

  const steps: DistanceVectorStep[] = [];

  // Deep clone helper
  const cloneTables = (t: RoutingTableMap): RoutingTableMap => {
    const res: RoutingTableMap = {} as RoutingTableMap;
    for (const k of Object.keys(t) as NodeId[]) {
      res[k] = {} as Record<NodeId, { destination: NodeId; cost: number; nextHop: NodeId | '-' }>;
      for (const y of Object.keys(t[k]) as NodeId[]) {
        res[k][y] = { ...t[k][y] };
      }
    }
    return res;
  };

  steps.push({
    cycle: 0,
    converged: false,
    tables: cloneTables(currentTables),
    exchanges: [],
    activeUpdates: [],
    explanation: `CYCLE 0 (LOCAL KNOWLEDGE ONLY): Each router populates its private vector with directly connected link costs. Non-neighbors are metric ∞.`
  });

  let converged = false;
  let cycle = 1;
  const MAX_CYCLES = 8;

  while (!converged && cycle <= MAX_CYCLES) {
    const nextTables = cloneTables(currentTables);
    const updates: {
      node: NodeId;
      dest: NodeId;
      oldCost: number;
      newCost: number;
      via: NodeId;
    }[] = [];

    const exchanges: {
      from: NodeId;
      to: NodeId;
      vector: Record<NodeId, number>;
    }[] = [];

    // Each node sends its distance vector to its direct neighbors
    for (const x of nodeIds) {
      const neighbors = Object.keys(adj[x]) as NodeId[];
      for (const neighbor of neighbors) {
        const vec: Record<NodeId, number> = {} as Record<NodeId, number>;
        for (const dest of nodeIds) {
          vec[dest] = currentTables[x][dest].cost;
        }
        exchanges.push({ from: x, to: neighbor, vector: vec });
      }
    }

    // Each node x relaxes using Bellman-Ford: D_x(y) = min_v { c(x, v) + D_v(y) }
    for (const x of nodeIds) {
      const neighbors = Object.keys(adj[x]) as NodeId[];

      for (const y of nodeIds) {
        if (x === y) continue;

        let bestCost = Infinity;
        let bestHop: NodeId | '-' = '-';

        // Evaluate all neighbors v of x
        for (const v of neighbors) {
          const linkCost = adj[x][v];
          const neighborDistToY = currentTables[v][y].cost;
          if (neighborDistToY !== Infinity) {
            const total = linkCost + neighborDistToY;
            if (total < bestCost) {
              bestCost = total;
              bestHop = v;
            }
          }
        }

        const currentEntry = currentTables[x][y];
        if (bestCost !== currentEntry.cost) {
          updates.push({
            node: x,
            dest: y,
            oldCost: currentEntry.cost,
            newCost: bestCost,
            via: bestHop as NodeId
          });
          nextTables[x][y] = {
            destination: y,
            cost: bestCost,
            nextHop: bestHop
          };
        }
      }
    }

    if (updates.length === 0) {
      converged = true;
      steps.push({
        cycle,
        converged: true,
        tables: cloneTables(nextTables),
        exchanges,
        activeUpdates: [],
        explanation: `CYCLE ${cycle} [CONVERGENCE VERIFIED]: No router updated any distance vector. System has reached global distributed equilibrium.`
      });
      break;
    } else {
      steps.push({
        cycle,
        converged: false,
        tables: cloneTables(nextTables),
        exchanges,
        activeUpdates: updates,
        explanation: `CYCLE ${cycle}: Neighbors exchanged distance vectors. Detected ${updates.length} table relaxations across the mesh via Bellman-Ford Equation.`
      });
      // Copy over
      for (const k of nodeIds) {
        for (const y of nodeIds) {
          currentTables[k][y] = { ...nextTables[k][y] };
        }
      }
      cycle++;
    }
  }

  return steps;
}

/**
 * Pathology Lab: Count-to-Infinity & Loop Mitigation Simulation
 * Linear topology: A <---> B <---> C
 * Nominal costs: c(A, B) = 1, c(B, C) = 1
 * When A-B is severed: c(A, B) = ∞
 */
export function simulatePathologyRun(options: {
  splitHorizon: boolean;
  poisonReverse: boolean;
  hopLimit16: boolean;
}): PathologyIteration[] {
  const { splitHorizon, poisonReverse, hopLimit16 } = options;
  const iterations: PathologyIteration[] = [];
  const INFINITY_VAL = hopLimit16 ? 16 : 99;

  // Initial Converged State:
  // B routes to A directly: cost 1, nextHop 'A'
  // C routes to A via B: cost 2, nextHop 'B'
  let bCostToA = 1;
  let bHopToA: 'A' | 'B' | 'C' | 'DIRECT' | 'UNREACHABLE' = 'A';
  let cCostToA = 2;
  let cHopToA: 'A' | 'B' | 'C' | 'DIRECT' | 'UNREACHABLE' = 'B';

  iterations.push({
    iteration: 0,
    linkSevered: false,
    bState: { id: 'B', distanceToA: bCostToA, nextHopToA: bHopToA },
    cState: { id: 'C', distanceToA: cCostToA, nextHopToA: cHopToA },
    eventLog: 'NOMINAL CONVERGED STATE: B reaches A directly (c=1). C reaches A via B (c=2). Link A-B operational.'
  });

  // Iteration 1: Link A-B is severed!
  iterations.push({
    iteration: 1,
    linkSevered: true,
    bState: { id: 'B', distanceToA: Infinity, nextHopToA: 'UNREACHABLE' },
    cState: { id: 'C', distanceToA: cCostToA, nextHopToA: cHopToA },
    eventLog: 'FAULT TRIGGER: Link A-B physical carrier dropped (c(A, B) = ∞). B marks direct path down.'
  });

  // Simulation loop up to 16 cycles
  let currentBCost = Infinity;
  let currentBHop: 'A' | 'B' | 'C' | 'DIRECT' | 'UNREACHABLE' = 'UNREACHABLE';
  let currentCCost = 2;
  let currentCHop: 'A' | 'B' | 'C' | 'DIRECT' | 'UNREACHABLE' = 'B';

  for (let it = 2; it <= 16; it++) {
    // Round: C advertises its vector to B
    let advertisedCostToB: number | 'INF' = currentCCost;
    let packetType: 'STANDARD' | 'SPLIT_HORIZON_SUPPRESSED' | 'POISONED_REVERSE' = 'STANDARD';

    if (poisonReverse) {
      // C routes to A via B, so it advertises metric 16/∞ back to B
      advertisedCostToB = 'INF';
      packetType = 'POISONED_REVERSE';
    } else if (splitHorizon) {
      // C routes to A via B, so it suppresses advertising route to A to B
      advertisedCostToB = 'INF';
      packetType = 'SPLIT_HORIZON_SUPPRESSED';
    }

    if (advertisedCostToB === 'INF') {
      // B learns C has no independent path to A!
      currentBCost = Infinity;
      currentBHop = 'UNREACHABLE';
      currentCCost = Infinity;
      currentCHop = 'UNREACHABLE';

      iterations.push({
        iteration: it,
        linkSevered: true,
        bState: { id: 'B', distanceToA: currentBCost, nextHopToA: currentBHop },
        cState: { id: 'C', distanceToA: currentCCost, nextHopToA: currentCHop },
        packetExchanged: {
          from: 'C',
          to: 'B',
          advertisedCost: 'INF',
          type: packetType
        },
        eventLog: poisonReverse
          ? `[POISON REVERSE TRIGGERED]: C advertises D(A) = ∞ to B because C's next-hop is B. B immediately knows route is invalid. Loop prevented in 1 round!`
          : `[SPLIT HORIZON ACTIVE]: C suppresses advertisement of D(A) to B. B receives no alternative path and declares A unreachable. Convergence preserved!`
      });
      break;
    } else {
      // Unmitigated Count-to-Infinity!
      // B accepts C's stale rumor: D_B(A) = c(B,C) + D_C(A) = 1 + currentCCost
      const newBCost = 1 + currentCCost;
      currentBCost = hopLimit16 && newBCost >= 16 ? 16 : newBCost;
      currentBHop = 'C';

      // Next half of cycle: B advertises back to C: D_C(A) = c(C, B) + D_B(A) = 1 + currentBCost
      const newCCost = 1 + currentBCost;
      currentCCost = hopLimit16 && newCCost >= 16 ? 16 : newCCost;
      currentCHop = 'B';

      const reachedCeiling = (currentBCost >= INFINITY_VAL && currentCCost >= INFINITY_VAL);

      iterations.push({
        iteration: it,
        linkSevered: true,
        bState: { id: 'B', distanceToA: currentBCost, nextHopToA: currentBHop },
        cState: { id: 'C', distanceToA: currentCCost, nextHopToA: currentCHop },
        packetExchanged: {
          from: 'C',
          to: 'B',
          advertisedCost: currentCCost,
          type: 'STANDARD'
        },
        eventLog: reachedCeiling
          ? `[CEILING REACHED]: Count-to-infinity reached RFC 2453 metric limit (16). Nodes clamp metric to ∞ and discard poison loop.`
          : `[COUNT-TO-INFINITY LOOP]: Stale rumor bounce! B routes to A via C (c=${currentBCost}), C routes to A via B (c=${currentCCost}). Packet ping will loop indefinitely!`
      });

      if (reachedCeiling) {
        break;
      }
    }
  }

  return iterations;
}

/**
 * Generate synthetic kernel FIB tables (Linux FIB / Cisco CEF style)
 */
export function generateFIBTelemetries(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { linkState: KernelFibTelemetry; distanceVector: KernelFibTelemetry } {
  const dijkstraSteps = computeDijkstraSteps(nodes, edges, 'A');
  const finalDijkstra = dijkstraSteps[dijkstraSteps.length - 1];

  const dvSteps = computeDistanceVectorCycles(nodes, edges);
  const finalDv = dvSteps[dvSteps.length - 1];

  const lsEntries: FibEntry[] = nodes.map(n => {
    const cost = finalDijkstra.tentativeDistances[n.id];
    
    // Trace back to first hop from A
    let curr = n.id;
    while (finalDijkstra.predecessors[curr] && finalDijkstra.predecessors[curr] !== 'A') {
      curr = finalDijkstra.predecessors[curr]!;
    }
    const firstHop = curr === 'A' ? n.id : curr;

    const nextHopIp = n.id === 'A' ? '127.0.0.1' : nodes.find(x => x.id === firstHop)?.ip || '10.0.1.2';
    const iface = firstHop === 'B' ? 'eth0' : firstHop === 'D' ? 'eth1' : 'lo';

    return {
      prefix: `${n.ip.replace(/\.\d+$/, '.0')}/24`,
      destinationNode: n.id,
      nextHopIp: cost === Infinity ? 'DROP' : nextHopIp,
      interfaceName: cost === Infinity ? 'null0' : iface,
      metric: cost === Infinity ? 999999 : cost * 10,
      flags: cost === Infinity ? 'D' : 'UG',
      status: cost === Infinity ? 'STALE' : 'ACTIVE'
    };
  });

  const dvEntries: FibEntry[] = nodes.map(n => {
    const entry = finalDv.tables['A']?.[n.id];
    const cost = entry?.cost ?? Infinity;
    const nextHopId = entry?.nextHop ?? '-';
    const nextHopIp = nextHopId === '-' ? (n.id === 'A' ? '127.0.0.1' : 'DROP') : nodes.find(x => x.id === nextHopId)?.ip || 'DROP';
    const iface = nextHopId === 'B' ? 'eth0' : nextHopId === 'D' ? 'eth1' : nextHopId === '-' ? 'lo' : 'eth2';

    return {
      prefix: `${n.ip.replace(/\.\d+$/, '.0')}/24`,
      destinationNode: n.id,
      nextHopIp,
      interfaceName: cost === Infinity ? 'null0' : iface,
      metric: cost === Infinity ? 16 : cost,
      flags: cost === Infinity ? 'D' : 'UG',
      status: cost === Infinity ? 'STALE' : 'ACTIVE'
    };
  });

  return {
    linkState: {
      algorithm: 'LINK_STATE',
      convergenceTimeMs: 14.8,
      memoryKb: 348,
      cpuOverhead: 'High (SPF Computation $O(|E| \\log |V|)$)',
      entries: lsEntries
    },
    distanceVector: {
      algorithm: 'DISTANCE_VECTOR',
      convergenceTimeMs: 4200.0,
      memoryKb: 48,
      cpuOverhead: 'Low (Simple addition $O(|V|)$)',
      entries: dvEntries
    }
  };
}
