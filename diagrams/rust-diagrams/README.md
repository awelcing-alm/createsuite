# Rust Diagrams

High-performance technical diagram generation library for accuracy, visualization, and performance.

## Features

- **Multiple Diagram Types**: Architecture, Sequence, Flowchart, DataFlow diagrams
- **High Performance**: Rayon-based parallel rendering, optimized layout algorithms
- **SVG Export**: Clean, scalable SVG output with customizable styling
- **WASM Support**: Run diagrams directly in the browser
- **CLI Tool**: Generate diagrams from the command line
- **TypeScript Bindings**: Full TypeScript support for web applications

## Installation

```toml
[dependencies]
rust-diagrams = { git = "https://github.com/awelcing-alm/createsuite", subpath = "diagrams/rust-diagrams" }
```

## Quick Start

### Rust

```rust
use rust_diagrams::diagram_types::ArchitectureDiagramBuilder;
use rust_diagrams::diagram_types::ComponentType;
use rust_diagrams::diagram_types::SystemComponent;
use rust_diagrams::export::SvgExporter;

let diagram = ArchitectureDiagramBuilder::new("My Architecture")
    .add_component(SystemComponent {
        id: "api".to_string(),
        name: "API Gateway".to_string(),
        component_type: ComponentType::Gateway,
        description: Some("Entry point".to_string()),
        tech_stack: Some("Phoenix".to_string()),
        ports: vec![],
    })
    .add_component(SystemComponent {
        id: "service".to_string(),
        name: "Backend".to_string(),
        component_type: ComponentType::Service,
        description: Some("Business logic".to_string()),
        tech_stack: Some("Elixir".to_string()),
        ports: vec![],
    })
    .add_connection("api", "service", "HTTP")
    .layout()
    .build();

let svg = SvgExporter::new().export(&diagram, &Default::default());
```

### TypeScript (Pure JS)

```typescript
import { createArchitectureDiagram, createSequenceDiagram, PureJsDiagramRenderer } from './pure-js';

const renderer = new PureJsDiagramRenderer();

const archDiagram = createArchitectureDiagram('My System')
  .addClient('client', 'Frontend')
  .addService('api', 'API Gateway')
  .addDatabase('db', 'Database')
  .addConnection('client', 'api', 'HTTP')
  .addConnection('api', 'db', 'SQL')
  .build();

document.body.innerHTML = renderer.renderHtml(archDiagram);
```

### CLI

```bash
# Generate architecture diagram
cargo run --bin diagram-cli -- architecture --title "My System" -o output.svg

# Generate disconnect analysis diagram
cargo run --bin diagram-cli -- disconnect -o disconnect.svg

# Export diagram to different formats
cargo run --bin diagram-cli -- export --input diagram.json --format html -o output.html
```

## Elixir BE ↔ Agent-UI Disconnect Analysis

This library includes specialized tools to visualize and analyze the disconnect between your Elixir backend and Agent-UI frontend:

```rust
use rust_diagrams::disconnect::DisconnectDiagramGenerator;

let generator = DisconnectDiagramGenerator::new();
let report = generator.generate_full_disconnect_report();

println!("Critical Issues: {}", report.critical_count);
println!("High Issues: {}", report.high_count);
```

### Key Disconnects Identified

1. **Protocol Translation Gap** (Critical) - WebSocket to GenServer translation issues
2. **State Synchronization Delay** (High) - Real-time state not properly propagated
3. **Git Bridge Latency** (High) - Double-write pattern inconsistency
4. **Agent Lifecycle Mismatch** (Medium) - Supervised model doesn't map to UI
5. **Convoy Grouping Semantic Gap** (Medium) - Different grouping logic
6. **Error Propagation Opacity** (Low) - Error context lost in translation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     rust-diagrams                           │
├─────────────────────────────────────────────────────────────┤
│  engine/      - Core diagram model, layout algorithms      │
│  shapes/      - SVG shape rendering                        │
│  diagram_types/ - Architecture, Sequence, Flowchart builders│
│  export/      - SVG, HTML, JSON export                    │
│  disconnect/  - Elixir-UI disconnect analysis              │
│  wasm/        - WASM bindings for browser                 │
└─────────────────────────────────────────────────────────────┘
```

## Performance

- Force-directed layout: O(n²) with n = number of nodes
- Layered layout: O(v + e) with v = vertices, e = edges
- SVG rendering: Parallel via Rayon
- WASM rendering: ~50ms for typical architecture diagrams

## License

MIT
