# Routing Paradigms: Link-State (Dijkstra) vs. Distance-Vector (Bellman-Ford)

An interactive, dark-mode, high-precision distributed systems laboratory web application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Motion (`motion/react`)**, with a canvas-driven **SonarGrid** telemetry foundation.

---

## Architecture & Layout Overview

### 1. `SonarGrid` Canvas Telemetry Foundation
- **Path**: `components/ui/sonar-grid.tsx` & `src/components/ui/sonar-grid.tsx`
- **Features**:
  - High-performance 2D Canvas dot matrix field with theme-aware dynamic coloring.
  - Interactive tap/click radar ping emission (`interactive = true`) answering user interaction with radial wavefronts.
  - Periodic ambient telemetry pings representing background packet radar sweeps and LSP broadcast waves.
  - Smooth wavefront damping, cubic easing ($t^2 \cdot (3 - 2t)$), and dot radius amplitude scaling ($2.4\times$).
  - Built-in `prefers-reduced-motion` detection, `ResizeObserver`, and `IntersectionObserver` pause/resume lifecycle management.

### 2. `DeconstructedPacketHero` (Hero Section)
- **300vh Scroll-Driven 3D Perspective Assembly**:
  - Layer 1: Data Link (`802.3 Frame` — `SRC MAC`, `DEST MAC`, `FCS`)
  - Layer 2: Network (`IPv4 Packet` — `TTL`, `CHKSUM`, `SRC IP`, `DEST IP`)
  - Layer 3: Transport (`TCP Segment` — `PORT 443`, `SEQ`, `ACK`, `WINDOW`)
  - Layer 4: Application (`Raw Payload` — `TLSv1.3`, `HEX BUFFER`)
- Smooth scroll physics driven by `useScroll`, `useSpring`, and `useTransform`.
- Anchored over the interactive canvas-driven `SonarGrid` backdrop.

### 3. `RoutingMeshBridge` (Layer 3 Transition Bridge)
- Seamless scroll continuity bridge transitioning from the deconstructed Layer 3 IPv4 packet header to the distributed multi-router Autonomous System (AS-65001) control plane.

### 4. `ParadigmDivergence` (Section 02)
- **Synchronized Split-Screen Console**:
  - **Link-State** (OSPF / IS-IS): *"Tell everyone about my neighbors."* Demonstrates reliable LSP flooding to establish an identical, synchronized Link-State Database (LSDB) across the entire autonomous system.
  - **Distance-Vector** (RIPv1/v2 / EIGRP): *"Tell my neighbors about everyone."* Demonstrates local vector passing along physical adjacencies ("routing by rumor").
- **Interactive Feature Matrix**:
  - 8-dimension evaluation table (Topology View, Algorithm Type, Message Scope, Shared Content, Convergence Speed, Loop Resilience, Resource Demand, Industry Standards) with deep-dive inspection drawers and RFC citations (RFC 2328, RFC 2453, RFC 7868).

### 5. `LinkStateVisualizer` (Section 03)
- **Interactive SVG Topology**: 6-node mesh network ($A$ through $F$) with configurable bidirectional link costs and clickable link-severing controls.
- **True Algorithmic State Machine (Dijkstra's SPF)**:
  - Configurable source root router ($A$ through $F$).
  - Settled set $N'$ tracker with illuminated emerald glowing nodes.
  - Live relaxation equation breakdown:
    $$D(v) = \min\big(D(v),\, D(w) + c(w, v)\big)$$
  - Real-time Link-State Database (LSDB) inspector displaying flooded router-LSAs (Sequence number, Age, Checksum, declared adjacencies).
  - Stepper controls: `[Step Forward]`, `[Auto-Play SPF (1.2s)]`, `[Sever Link A-B]`, `[Reset]`.

### 6. `DistanceVectorVisualizer` (Section 04)
- **Decentralized Distance Matrix**:
  - Single-router local perspective view and global aggregated 6x6 matrix view.
- **Bellman-Ford Dynamic Programming Calculator**:
  $$D_x(y) = \min_{v \in \text{Neighbors}(x)} \Big\{ c(x, v) + D_v(y) \Big\}$$
  - Real-time candidate evaluation breakdown showing neighbor vector comparisons.
- **Rumor-Passing Packet Animation**: Vector packets sliding strictly along direct physical links during gossip cycles.
- Step counter showing iteration cycles $0 \to 1 \to 2 \dots \to$ convergence.

### 7. `PathologyLabSandbox` (Section 05)
- **Scenario Topology**: Linear 3-node graph ($A \longleftrightarrow B \longleftrightarrow C$).
- **Count-to-Infinity Reproduction**:
  - Trigger: `[SEVER LINK A-B]`.
  - Unmitigated Mode: Demonstrates $B$ and $C$ bouncing stale rumors ($D(A) = 2 \to 3 \to 4 \dots \to 16$).
- **Mitigation Controls**:
  - `[x] Split Horizon` (never advertise a route back out the interface it was learned from).
  - `[x] Poison Reverse` (explicitly advertise metric $\infty = 16$ back to route supplier, RFC 2453).
  - `[x] Hop-Count Ceiling` (clamp maximum metric at 16 as defined in RFC 2453 RIPv2).
- **Packet Sniffer Terminal**: Monospace log stream showing exact RFC 2453 RIPv2 response frames.
- **Interactive Data Plane Probe (Ping Test)**: Simulates packet traversal from $C \to A$ with live TTL decrements and packet drop detection under active routing loops.

### 8. `FIBTelemetryTerminal` (Section 06)
- **Side-by-Side Kernel Forwarding Information Base (FIB)**:
  - Link-State FIB (OSPF / CEF Hardware Accelerated) vs. Distance-Vector FIB (RIPv2 UDP Multicast).
  - Displays: Destination Prefix, Next-Hop IP, Outgoing Interface, Convergence Latency ($\Delta t$), and RAM Footprint.
- **Live Packet Probe & FIB Lookup Simulator**: Injects probe packets from Ingress Node $A$ to any destination, performing Longest Prefix Match (LPM) lookups.
- **Topology Churn Stress Test**: Simulates link flaps to contrast sub-second SPF re-convergence with multi-second holddown timer convergence.

---

## Running Locally

```bash
# Navigate to the project directory
cd routing-paradigms

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Production build
npm run build
```
