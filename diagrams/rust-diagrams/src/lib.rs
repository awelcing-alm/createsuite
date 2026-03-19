pub mod diagram_types;
pub mod disconnect;
pub mod engine;
pub mod export;
pub mod shapes;

#[cfg(feature = "wasm")]
pub mod wasm;

pub use diagram_types::{
    ActorType, ArchitectureDiagramBuilder, ComponentType, DataFlowDiagramBuilder, FlowchartBuilder,
    MessageType, PortDirection, SequenceActor, SequenceDiagram, SequenceMessage, SystemComponent,
};
pub use disconnect::*;
pub use engine::{
    blueprint, tech_dark, tech_light, ArrowHead, Bounds, Diagram, DiagramKind, DiagramStyle, Edge,
    ForceDirectedLayout, LayeredLayout, LayoutContext, LayoutEngine, LineStyle, Node, NodeShape,
    NodeStyle, Point, Port as EngPort, StylePreset,
};
pub use export::{HtmlExporter, JsonExporter, SvgExportOptions, SvgExporter};
pub use shapes::SvgRenderer;

#[cfg(test)]
mod tests {
    use crate::diagram_types::{
        ActorType, ArchitectureDiagramBuilder, ComponentType, MessageType, SequenceActor,
        SequenceDiagram, SequenceMessage, SystemComponent,
    };
    use crate::engine::{
        tech_dark, Bounds, Diagram, DiagramKind, DiagramStyle, Edge, LayeredLayout, LayoutContext,
        LayoutEngine, Node, NodeShape, NodeStyle, StylePreset,
    };
    use crate::export::SvgExporter;
    use crate::shapes::SvgRenderer;

    #[test]
    fn test_node_creation() {
        let node = Node::new("test", "Test Node", Bounds::new(0.0, 0.0, 100.0, 50.0));
        assert_eq!(node.id, "test");
        assert_eq!(node.label, "Test Node");
        assert_eq!(node.bounds.width, 100.0);
    }

    #[test]
    fn test_node_style_default() {
        let style = NodeStyle::default();
        assert_eq!(style.shape, NodeShape::Rectangle);
        assert_eq!(style.stroke_width, 2.0);
    }

    #[test]
    fn test_diagram_creation() {
        let mut diagram = Diagram::new("Test Diagram", DiagramKind::Architecture);
        let node = Node::new("n1", "Node 1", Bounds::new(10.0, 10.0, 100.0, 50.0));
        diagram.add_node(node);

        assert_eq!(diagram.node_count(), 1);
        assert_eq!(diagram.title, "Test Diagram");
    }

    #[test]
    fn test_diagram_bounds() {
        let mut diagram = Diagram::new("Test", DiagramKind::Flowchart);
        diagram.add_node(Node::new("n1", "N1", Bounds::new(0.0, 0.0, 50.0, 30.0)));
        diagram.add_node(Node::new("n2", "N2", Bounds::new(100.0, 0.0, 50.0, 30.0)));

        let bounds = diagram.bounds();
        assert!(bounds.width > 100.0);
    }

    #[test]
    fn test_edge_creation() {
        let edge = Edge::new("e1", "n1", "n2").with_label("connects");
        assert_eq!(edge.label, Some("connects".to_string()));
    }

    #[test]
    fn test_layered_layout() {
        let mut diagram = Diagram::new("Test", DiagramKind::Architecture);
        diagram.add_node(Node::new("a", "A", Bounds::new(0.0, 0.0, 80.0, 40.0)));
        diagram.add_node(Node::new("b", "B", Bounds::new(0.0, 0.0, 80.0, 40.0)));
        diagram.add_node(Node::new("c", "C", Bounds::new(0.0, 0.0, 80.0, 40.0)));
        diagram.add_edge(Edge::new("e1", "a", "b"));
        diagram.add_edge(Edge::new("e2", "b", "c"));

        let ctx = LayoutContext::default();
        let layout = LayeredLayout::new();
        LayoutEngine::layout(&layout, &mut diagram, &ctx);

        assert!(diagram.nodes.get("a").unwrap().bounds.y >= 0.0);
    }

    #[test]
    fn test_svg_renderer() {
        let renderer = SvgRenderer::new();
        let node = Node::new("test", "Test", Bounds::new(10.0, 10.0, 100.0, 50.0));
        let svg = renderer.render_node(&node, &Default::default());
        assert!(svg.contains("rect"));
        assert!(svg.contains("Test"));
    }

    #[test]
    fn test_architecture_builder() {
        let diagram = ArchitectureDiagramBuilder::new("Test Architecture")
            .add_component(SystemComponent {
                id: "svc".to_string(),
                name: "Service".to_string(),
                component_type: ComponentType::Service,
                description: None,
                tech_stack: None,
                ports: vec![],
            })
            .add_connection("svc", "svc", "HTTP")
            .layout()
            .build();

        assert_eq!(diagram.title, "Test Architecture");
        assert!(diagram.node_count() >= 1);
    }

    #[test]
    fn test_sequence_diagram() {
        let diagram = SequenceDiagram::new("Test Sequence")
            .add_actor(SequenceActor {
                id: "a".to_string(),
                name: "Actor A".to_string(),
                actor_type: ActorType::User,
            })
            .add_actor(SequenceActor {
                id: "b".to_string(),
                name: "Actor B".to_string(),
                actor_type: ActorType::Service,
            })
            .add_message(SequenceMessage {
                id: "1".to_string(),
                from: "a".to_string(),
                to: "b".to_string(),
                label: "Request".to_string(),
                message_type: MessageType::Sync,
                step: 1,
            });

        assert_eq!(diagram.actors.len(), 2);
        assert_eq!(diagram.messages.len(), 1);
    }

    #[test]
    fn test_sequence_svg_rendering() {
        let diagram = SequenceDiagram::new("Test")
            .add_actor(SequenceActor {
                id: "a".to_string(),
                name: "A".to_string(),
                actor_type: ActorType::User,
            })
            .add_actor(SequenceActor {
                id: "b".to_string(),
                name: "B".to_string(),
                actor_type: ActorType::Service,
            })
            .add_message(SequenceMessage {
                id: "1".to_string(),
                from: "a".to_string(),
                to: "b".to_string(),
                label: "Hi".to_string(),
                message_type: MessageType::Sync,
                step: 1,
            });

        let svg = diagram.render_svg();
        assert!(svg.contains("<svg"));
        assert!(svg.contains(">A<"));
        assert!(svg.contains(">B<"));
        assert!(svg.contains("Hi"));
    }

    #[test]
    fn test_svg_exporter() {
        let diagram = Diagram::new("Export Test", DiagramKind::Architecture);
        let node = Node::new("n1", "Export Node", Bounds::new(20.0, 20.0, 120.0, 60.0));
        let mut d = diagram;
        d.add_node(node);

        let exporter = SvgExporter::new();
        let svg = exporter.export(&d, &Default::default());
        assert!(svg.contains("<svg"));
        assert!(svg.contains("Export Test"));
    }

    #[test]
    fn test_diagram_style_preset() {
        let preset = tech_dark();
        let style = DiagramStyle {
            preset,
            show_grid: true,
            show_legend: true,
            padding: 40.0,
            node_spacing: 120.0,
        };

        assert_eq!(style.preset.background, "#0d1117");
        assert!(style.show_grid);
    }
}
