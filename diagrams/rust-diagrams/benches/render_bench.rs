use criterion::{black_box, criterion_group, criterion_main, Criterion};
use rust_diagrams::diagram_types::{ArchitectureDiagramBuilder, ComponentType, SystemComponent};
use rust_diagrams::engine::{
    Bounds, Diagram, DiagramKind, Edge, LayeredLayout, LayoutContext, Node, NodeShape, NodeStyle,
};
use rust_diagrams::export::SvgExporter;
use rust_diagrams::shapes::SvgRenderer;

fn create_test_diagram(node_count: usize) -> Diagram {
    let mut diagram = Diagram::new("Benchmark", DiagramKind::Architecture);

    for i in 0..node_count {
        let node = Node::new(
            &format!("node_{}", i),
            &format!("Node {}", i),
            Bounds::new(0.0, 0.0, 100.0, 50.0),
        );
        diagram.add_node(node);

        if i > 0 {
            let edge = Edge::new(
                &format!("edge_{}", i),
                &format!("node_{}", i - 1),
                &format!("node_{}", i),
            );
            diagram.add_edge(edge);
        }
    }

    diagram
}

fn benchmark_svg_rendering(c: &mut Criterion) {
    let diagram = create_test_diagram(50);
    let renderer = SvgRenderer::new();

    c.bench_function("svg_render_50_nodes", |b| {
        b.iter(|| {
            for node in diagram.nodes.values() {
                black_box(renderer.render_node(node, &Default::default()));
            }
        })
    });
}

fn benchmark_layout(c: &mut Criterion) {
    let mut diagram = create_test_diagram(100);
    let ctx = LayoutContext::default();
    let layout = LayeredLayout::new();

    c.bench_function("layout_100_nodes", |b| {
        b.iter(|| {
            layout.layout(black_box(&mut diagram), &ctx);
        })
    });
}

fn benchmark_export(c: &mut Criterion) {
    let diagram = create_test_diagram(30);
    let exporter = SvgExporter::new();

    c.bench_function("export_svg_30_nodes", |b| {
        b.iter(|| {
            black_box(exporter.export(black_box(&diagram), &Default::default()));
        })
    });
}

fn benchmark_architecture_builder(c: &mut Criterion) {
    c.bench_function("build_architecture_20_components", |b| {
        b.iter(|| {
            let _ = ArchitectureDiagramBuilder::new("Benchmark")
                .add_component(SystemComponent {
                    id: "1".to_string(),
                    name: "Service 1".to_string(),
                    component_type: ComponentType::Service,
                    description: None,
                    tech_stack: None,
                    ports: vec![],
                })
                .add_component(SystemComponent {
                    id: "2".to_string(),
                    name: "Service 2".to_string(),
                    component_type: ComponentType::Service,
                    description: None,
                    tech_stack: None,
                    ports: vec![],
                })
                .add_component(SystemComponent {
                    id: "3".to_string(),
                    name: "Service 3".to_string(),
                    component_type: ComponentType::Service,
                    description: None,
                    tech_stack: None,
                    ports: vec![],
                })
                .add_component(SystemComponent {
                    id: "4".to_string(),
                    name: "Database".to_string(),
                    component_type: ComponentType::Database,
                    description: None,
                    tech_stack: None,
                    ports: vec![],
                })
                .add_connection("1", "2", "HTTP")
                .add_connection("2", "3", "WS")
                .add_connection("3", "4", "SQL")
                .layout()
                .build();
        })
    });
}

criterion_group!(
    benches,
    benchmark_svg_rendering,
    benchmark_layout,
    benchmark_export,
    benchmark_architecture_builder
);
criterion_main!(benches);
