use rust_diagrams::diagram_types::ArchitectureDiagramBuilder;
use rust_diagrams::diagram_types::ComponentType;
use rust_diagrams::diagram_types::SystemComponent;
use rust_diagrams::export::{HtmlExporter, SvgExportOptions, SvgExporter};

fn main() {
    println!("Generating Architecture Diagram Example...\n");

    let mut builder = ArchitectureDiagramBuilder::new("CreateSuite System Architecture")
        .with_style(rust_diagrams::engine::DiagramStyle::default());

    builder = builder.add_component(SystemComponent {
        id: "frontend".to_string(),
        name: "Agent UI".to_string(),
        component_type: ComponentType::Client,
        description: Some("React frontend with macOS aesthetic".to_string()),
        tech_stack: Some("React 19, TypeScript, Vite".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "vite-server".to_string(),
        name: "Vite Dev Server".to_string(),
        component_type: ComponentType::Compute,
        description: Some("Development server and hot reload".to_string()),
        tech_stack: Some("Vite".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "node-server".to_string(),
        name: "Node.js Server".to_string(),
        component_type: ComponentType::Service,
        description: Some("Express + Socket.IO server".to_string()),
        tech_stack: Some("Node.js, Express, Socket.IO".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "fly-gateway".to_string(),
        name: "Fly.io Gateway".to_string(),
        component_type: ComponentType::Network,
        description: Some("Cloud hosting and scaling".to_string()),
        tech_stack: Some("Fly.io".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "agent-orchestrator".to_string(),
        name: "Agent Orchestrator".to_string(),
        component_type: ComponentType::Service,
        description: Some("Orchestrates AI agents".to_string()),
        tech_stack: Some("Elixir, Phoenix".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "task-manager".to_string(),
        name: "Task Manager".to_string(),
        component_type: ComponentType::Service,
        description: Some("Git-backed task tracking".to_string()),
        tech_stack: Some("Elixir".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "convoy-manager".to_string(),
        name: "Convoy Manager".to_string(),
        component_type: ComponentType::Service,
        description: Some("Groups related tasks".to_string()),
        tech_stack: Some("Elixir".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "git-storage".to_string(),
        name: "Git Storage".to_string(),
        component_type: ComponentType::Storage,
        description: Some("Persistent state".to_string()),
        tech_stack: Some("Git".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "pubsub".to_string(),
        name: "Phoenix PubSub".to_string(),
        component_type: ComponentType::Queue,
        description: Some("Real-time messaging".to_string()),
        tech_stack: Some("Phoenix".to_string()),
        ports: vec![],
    });

    builder = builder.add_connection("frontend", "vite-server", "HMR");
    builder = builder.add_connection("vite-server", "node-server", "WS");
    builder = builder.add_connection("node-server", "fly-gateway", "HTTP");
    builder = builder.add_connection("fly-gateway", "agent-orchestrator", "WebSocket");
    builder = builder.add_connection("agent-orchestrator", "task-manager", "ETS");
    builder = builder.add_connection("agent-orchestrator", "convoy-manager", "ETS");
    builder = builder.add_connection("agent-orchestrator", "pubsub", "PubSub");
    builder = builder.add_connection("task-manager", "git-storage", "Git");
    builder = builder.add_connection("convoy-manager", "git-storage", "Git");

    builder = builder.add_group("Frontend Layer", &["frontend", "vite-server"], "#58a6ff");

    builder = builder.add_group(
        "Backend Layer",
        &[
            "node-server",
            "fly-gateway",
            "agent-orchestrator",
            "task-manager",
            "convoy-manager",
            "pubsub",
        ],
        "#238636",
    );

    builder = builder.add_group("Storage Layer", &["git-storage"], "#8957e5");

    let diagram = builder.layout().build();

    let svg_exporter = SvgExporter::new();
    let svg = svg_exporter.export(&diagram, &SvgExportOptions::default());

    std::fs::create_dir_all("outputs").ok();
    std::fs::write("outputs/architecture-basic.svg", &svg).expect("Failed to write SVG");

    let html = HtmlExporter::export(&diagram, &svg);
    std::fs::write("outputs/architecture-basic.html", &html).expect("Failed to write HTML");

    println!("Generated architecture-basic.svg and architecture-basic.html");
}
