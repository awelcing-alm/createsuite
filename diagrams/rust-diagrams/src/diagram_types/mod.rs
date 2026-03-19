use crate::engine::{
    ArrowHead, Bounds, Diagram, DiagramKind, DiagramStyle, Edge, EdgeStyle, LayeredLayout,
    LayoutContext, LayoutEngine, LineStyle, Node, NodeGroup, NodeShape, NodeStyle, Point,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemComponent {
    pub id: String,
    pub name: String,
    pub component_type: ComponentType,
    pub description: Option<String>,
    pub tech_stack: Option<String>,
    pub ports: Vec<PortDef>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ComponentType {
    Service,
    Database,
    Queue,
    Cache,
    Gateway,
    Client,
    External,
    Storage,
    Compute,
    Network,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortDef {
    pub name: String,
    pub protocol: String,
    pub direction: PortDirection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PortDirection {
    Input,
    Output,
    Bidirectional,
}

pub struct ArchitectureDiagramBuilder {
    diagram: Diagram,
    components: HashMap<String, SystemComponent>,
}

impl ArchitectureDiagramBuilder {
    pub fn new(title: &str) -> Self {
        Self {
            diagram: Diagram::new(title, DiagramKind::Architecture),
            components: HashMap::new(),
        }
    }

    pub fn with_style(mut self, style: DiagramStyle) -> Self {
        self.diagram.style = style;
        self
    }

    pub fn add_component(mut self, component: SystemComponent) -> Self {
        let style = self.get_style_for_type(&component.component_type);
        let node = Node::new(
            &component.id,
            &component.name,
            Bounds::new(0.0, 0.0, 180.0, 80.0),
        )
        .with_style(style);

        self.components.insert(component.id.clone(), component);
        self.diagram.add_node(node);
        self
    }

    pub fn add_connection(mut self, source_id: &str, target_id: &str, protocol: &str) -> Self {
        let edge = Edge::new(
            &format!("{}-{}", source_id, target_id),
            source_id,
            target_id,
        )
        .with_label(protocol);

        self.diagram.add_edge(edge);
        self
    }

    pub fn add_group(mut self, name: &str, node_ids: &[&str], color: &str) -> Self {
        let group = NodeGroup {
            id: format!("group-{}", name.to_lowercase().replace(' ', "-")),
            name: name.to_string(),
            node_ids: node_ids.iter().map(|s| s.to_string()).collect(),
            style: crate::engine::GroupStyle {
                fill_color: format!("{}20", color),
                stroke_color: color.to_string(),
                stroke_width: 2.0,
                corner_radius: 12.0,
                label_position: Point::new(0.0, 0.0),
            },
            bounds: None,
        };
        self.diagram.groups.push(group);
        self
    }

    fn get_style_for_type(&self, ct: &ComponentType) -> NodeStyle {
        match ct {
            ComponentType::Service => NodeStyle {
                shape: NodeShape::RoundedRect,
                fill_color: "#238636".to_string(),
                stroke_color: "#2ea043".to_string(),
                ..Default::default()
            },
            ComponentType::Database => NodeStyle {
                shape: NodeShape::Cylinder,
                fill_color: "#9e6a03".to_string(),
                stroke_color: "#d29922".to_string(),
                ..Default::default()
            },
            ComponentType::Queue => NodeStyle {
                shape: NodeShape::Queue,
                fill_color: "#8957e5".to_string(),
                stroke_color: "#a371f7".to_string(),
                ..Default::default()
            },
            ComponentType::Cache => NodeStyle {
                shape: NodeShape::Cylinder,
                fill_color: "#da3633".to_string(),
                stroke_color: "#f85149".to_string(),
                ..Default::default()
            },
            ComponentType::Gateway => NodeStyle {
                shape: NodeShape::Hexagon,
                fill_color: "#0066cc".to_string(),
                stroke_color: "#388bfd".to_string(),
                ..Default::default()
            },
            ComponentType::Client => NodeStyle {
                shape: NodeShape::RoundedRect,
                fill_color: "#1f6feb".to_string(),
                stroke_color: "#58a6ff".to_string(),
                ..Default::default()
            },
            ComponentType::External => NodeStyle {
                shape: NodeShape::Cloud,
                fill_color: "#6e7681".to_string(),
                stroke_color: "#8b949e".to_string(),
                ..Default::default()
            },
            ComponentType::Storage => NodeStyle {
                shape: NodeShape::Document,
                fill_color: "#8b949e".to_string(),
                stroke_color: "#c9d1d9".to_string(),
                ..Default::default()
            },
            ComponentType::Compute => NodeStyle {
                shape: NodeShape::Rectangle,
                fill_color: "#bf4b8a".to_string(),
                stroke_color: "#db61a2".to_string(),
                ..Default::default()
            },
            ComponentType::Network => NodeStyle {
                shape: NodeShape::Circle,
                fill_color: "#00cc66".to_string(),
                stroke_color: "#39d353".to_string(),
                ..Default::default()
            },
        }
    }

    pub fn layout(mut self) -> Self {
        let ctx = LayoutContext::default();
        let engine = LayeredLayout::new();
        engine.layout(&mut self.diagram, &ctx);

        for group in &mut self.diagram.groups {
            let mut min_x = f64::MAX;
            let mut min_y = f64::MAX;
            let mut max_x = f64::MIN;
            let mut max_y = f64::MIN;

            for node_id in &group.node_ids {
                if let Some(node) = self.diagram.nodes.get(node_id) {
                    min_x = min_x.min(node.bounds.x);
                    min_y = min_y.min(node.bounds.y);
                    max_x = max_x.max(node.bounds.x + node.bounds.width);
                    max_y = max_y.max(node.bounds.y + node.bounds.height);
                }
            }

            group.bounds = Some(Bounds::new(
                min_x - 20.0,
                min_y - 40.0,
                max_x - min_x + 40.0,
                max_y - min_y + 60.0,
            ));
        }

        self
    }

    pub fn build(self) -> Diagram {
        self.diagram
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SequenceActor {
    pub id: String,
    pub name: String,
    pub actor_type: ActorType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActorType {
    User,
    Agent,
    Service,
    System,
    External,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SequenceMessage {
    pub id: String,
    pub from: String,
    pub to: String,
    pub label: String,
    pub message_type: MessageType,
    pub step: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MessageType {
    Sync,
    Async,
    Response,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SequenceDiagram {
    pub title: String,
    pub actors: Vec<SequenceActor>,
    pub messages: Vec<SequenceMessage>,
    pub style: DiagramStyle,
}

impl SequenceDiagram {
    pub fn new(title: &str) -> Self {
        Self {
            title: title.to_string(),
            actors: Vec::new(),
            messages: Vec::new(),
            style: DiagramStyle::default(),
        }
    }

    pub fn add_actor(mut self, actor: SequenceActor) -> Self {
        self.actors.push(actor);
        self
    }

    pub fn add_message(mut self, message: SequenceMessage) -> Self {
        self.messages.push(message);
        self
    }

    pub fn render_svg(&self) -> String {
        let _renderer = crate::shapes::SvgRenderer::new();
        let actor_width = 100.0;
        let actor_spacing = 150.0;
        let header_height = 60.0;
        let line_height = 50.0;
        let lifeline_start = 100.0;

        let width = actor_width * self.actors.len() as f64
            + actor_spacing * (self.actors.len() - 1) as f64
            + 100.0;
        let height = header_height + line_height * (self.messages.len() as f64 + 2.0) + 50.0;

        let mut svg = format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {} {}" width="{}" height="{}">"#,
            width, height, width, height
        );

        svg.push_str(&format!(
            r#"<rect width="100%" height="100%" fill="{}"/>"#,
            self.style.preset.background
        ));

        for (i, actor) in self.actors.iter().enumerate() {
            let x = lifeline_start + i as f64 * (actor_width + actor_spacing);

            let color = match actor.actor_type {
                ActorType::User => "#58a6ff",
                ActorType::Agent => "#a371f7",
                ActorType::Service => "#3fb950",
                ActorType::System => "#f0883e",
                ActorType::External => "#8b949e",
            };

            svg.push_str(&format!(
                r#"<rect x="{}" y="10" width="{}" height="40" rx="8" fill="{}" stroke="{}" stroke-width="2"/>"#,
                x, actor_width, color, color
            ));
            svg.push_str(&format!(
                r#"<text x="{}" y="35" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">{}</text>"#,
                x + actor_width / 2.0,
                &actor.name
            ));

            let lifeline_top = header_height;
            let lifeline_bottom = height - 50.0;
            svg.push_str(&format!(
                r#"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{}" stroke-width="2" stroke-dasharray="5,5"/>"#,
                x + actor_width / 2.0,
                lifeline_top,
                x + actor_width / 2.0,
                lifeline_bottom,
                color
            ));
        }

        for (i, msg) in self.messages.iter().enumerate() {
            let y = header_height + 40.0 + i as f64 * line_height;
            let from_idx = self
                .actors
                .iter()
                .position(|a| a.id == msg.from)
                .unwrap_or(0) as f64;
            let to_idx = self.actors.iter().position(|a| a.id == msg.to).unwrap_or(0) as f64;

            let from_x =
                lifeline_start + from_idx * (actor_width + actor_spacing) + actor_width / 2.0;
            let to_x = lifeline_start + to_idx * (actor_width + actor_spacing) + actor_width / 2.0;

            let (line_color, _arrow_style) = match msg.message_type {
                MessageType::Sync => ("#c9d1d9", ArrowHead::TriangleFilled),
                MessageType::Async => ("#8b949e", ArrowHead::Triangle),
                MessageType::Response => ("#3fb950", ArrowHead::DiamondFilled),
                MessageType::Error => ("#f85149", ArrowHead::TriangleFilled),
            };

            let direction = if to_idx > from_idx { 1.0 } else { -1.0 };
            let arrow_x = to_x - direction * 15.0;

            svg.push_str(&format!(
                r#"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{}" stroke-width="2"/>"#,
                from_x, y, arrow_x, y, line_color
            ));

            if direction > 0.0 {
                svg.push_str(&format!(
                    r#"<polygon points="{},{} {},{} {},{}" fill="{}"/>"#,
                    arrow_x,
                    y,
                    arrow_x - 10.0,
                    y - 5.0,
                    arrow_x - 10.0,
                    y + 5.0,
                    line_color
                ));
            } else {
                svg.push_str(&format!(
                    r#"<polygon points="{},{} {},{} {},{}" fill="{}"/>"#,
                    arrow_x,
                    y,
                    arrow_x + 10.0,
                    y - 5.0,
                    arrow_x + 10.0,
                    y + 5.0,
                    line_color
                ));
            }

            let label_x = (from_x + to_x) / 2.0;
            svg.push_str(&format!(
                r##"<rect x="{}" y="{}" width="{}" height="20" rx="4" fill="#0d1117" stroke="#21262d"/>"##,
                label_x - 40.0,
                y - 10.0,
                80.0
            ));
            svg.push_str(&format!(
                r##"<text x="{}" y="{}" text-anchor="middle" dominant-baseline="middle" fill="#c9d1d9" font-family="system-ui, sans-serif" font-size="10">{}</text>"##,
                label_x,
                y,
                &msg.label
            ));

            svg.push_str(&format!(
                r##"<text x="{}" y="{}" fill="#6e7681" font-family="system-ui, sans-serif" font-size="10">{}</text>"##,
                lifeline_start + 10.0,
                y + 4.0,
                msg.step
            ));
        }

        svg.push_str("</svg>");
        svg
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowchartNode {
    pub id: String,
    pub label: String,
    pub node_type: FlowchartNodeType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FlowchartNodeType {
    Start,
    End,
    Process,
    Decision,
    Input,
    Output,
}

pub struct FlowchartBuilder {
    diagram: Diagram,
    flowchart_nodes: Vec<FlowchartNode>,
}

impl FlowchartBuilder {
    pub fn new(title: &str) -> Self {
        Self {
            diagram: Diagram::new(title, DiagramKind::Flowchart),
            flowchart_nodes: Vec::new(),
        }
    }

    pub fn add_node(mut self, node: FlowchartNode) -> Self {
        let style = match node.node_type {
            FlowchartNodeType::Start | FlowchartNodeType::End => NodeStyle {
                shape: NodeShape::Circle,
                fill_color: "#238636".to_string(),
                stroke_color: "#2ea043".to_string(),
                ..Default::default()
            },
            FlowchartNodeType::Process => NodeStyle {
                shape: NodeShape::Rectangle,
                fill_color: "#1f6feb".to_string(),
                stroke_color: "#58a6ff".to_string(),
                ..Default::default()
            },
            FlowchartNodeType::Decision => NodeStyle {
                shape: NodeShape::Diamond,
                fill_color: "#d29922".to_string(),
                stroke_color: "#f0883e".to_string(),
                ..Default::default()
            },
            FlowchartNodeType::Input => NodeStyle {
                shape: NodeShape::Parallelogram,
                fill_color: "#8957e5".to_string(),
                stroke_color: "#a371f7".to_string(),
                ..Default::default()
            },
            FlowchartNodeType::Output => NodeStyle {
                shape: NodeShape::Parallelogram,
                fill_color: "#bf4b8a".to_string(),
                stroke_color: "#db61a2".to_string(),
                ..Default::default()
            },
        };

        let n =
            Node::new(&node.id, &node.label, Bounds::new(0.0, 0.0, 140.0, 60.0)).with_style(style);
        self.flowchart_nodes.push(node);
        self.diagram.add_node(n);
        self
    }

    pub fn add_flow(mut self, from: &str, to: &str, label: Option<&str>) -> Self {
        let mut edge = Edge::new(&format!("flow-{}", from), from, to);
        if let Some(l) = label {
            edge = edge.with_label(l);
        }
        self.diagram.add_edge(edge);
        self
    }

    pub fn layout_linear(mut self) -> Self {
        let ctx = LayoutContext::default();
        let engine = LayeredLayout::new();
        engine.layout(&mut self.diagram, &ctx);
        self
    }

    pub fn build(self) -> Diagram {
        self.diagram
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFlowElement {
    pub id: String,
    pub name: String,
    pub flow_type: DataFlowType,
    pub format: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DataFlowType {
    HttpRequest,
    HttpResponse,
    WebSocket,
    GraphQL,
    RPC,
    Event,
    Message,
    File,
}

pub struct DataFlowDiagramBuilder {
    diagram: Diagram,
    elements: Vec<DataFlowElement>,
}

impl DataFlowDiagramBuilder {
    pub fn new(title: &str) -> Self {
        Self {
            diagram: Diagram::new(title, DiagramKind::DataFlow),
            elements: Vec::new(),
        }
    }

    pub fn add_element(mut self, element: DataFlowElement) -> Self {
        let style = match element.flow_type {
            DataFlowType::HttpRequest | DataFlowType::HttpResponse => NodeStyle {
                shape: NodeShape::RoundedRect,
                fill_color: "#1f6feb".to_string(),
                stroke_color: "#58a6ff".to_string(),
                corner_radius: 4.0,
                ..Default::default()
            },
            DataFlowType::WebSocket => NodeStyle {
                shape: NodeShape::RoundedRect,
                fill_color: "#8957e5".to_string(),
                stroke_color: "#a371f7".to_string(),
                corner_radius: 4.0,
                ..Default::default()
            },
            DataFlowType::GraphQL => NodeStyle {
                shape: NodeShape::Hexagon,
                fill_color: "#e535ab".to_string(),
                stroke_color: "#f0abfc".to_string(),
                ..Default::default()
            },
            DataFlowType::RPC => NodeStyle {
                shape: NodeShape::Rectangle,
                fill_color: "#bf4b8a".to_string(),
                stroke_color: "#db61a2".to_string(),
                ..Default::default()
            },
            DataFlowType::Event => NodeStyle {
                shape: NodeShape::Diamond,
                fill_color: "#d29922".to_string(),
                stroke_color: "#f0883e".to_string(),
                ..Default::default()
            },
            DataFlowType::Message => NodeStyle {
                shape: NodeShape::RoundedRect,
                fill_color: "#3fb950".to_string(),
                stroke_color: "#56d364".to_string(),
                corner_radius: 4.0,
                ..Default::default()
            },
            DataFlowType::File => NodeStyle {
                shape: NodeShape::Document,
                fill_color: "#8b949e".to_string(),
                stroke_color: "#c9d1d9".to_string(),
                ..Default::default()
            },
        };

        let desc = element.format.as_ref().map(|f| format!("[{}]", f));
        let mut node = Node::new(
            &element.id,
            &element.name,
            Bounds::new(0.0, 0.0, 160.0, 70.0),
        )
        .with_style(style);
        node.description = desc;
        self.elements.push(element);
        self.diagram.add_node(node);
        self
    }

    pub fn add_flow(mut self, from: &str, to: &str, flow_type: DataFlowType) -> Self {
        let edge_style = match flow_type {
            DataFlowType::HttpRequest => EdgeStyle {
                end_arrow: ArrowHead::Triangle,
                ..Default::default()
            },
            DataFlowType::WebSocket => EdgeStyle {
                line_style: LineStyle::Solid,
                end_arrow: ArrowHead::Triangle,
                stroke_color: "#a371f7".to_string(),
                ..Default::default()
            },
            DataFlowType::Event => EdgeStyle {
                line_style: LineStyle::Dashed,
                end_arrow: ArrowHead::Triangle,
                stroke_color: "#f0883e".to_string(),
                ..Default::default()
            },
            _ => EdgeStyle::default(),
        };

        let mut edge = Edge::new(&format!("flow-{}-{}", from, to), from, to);
        edge.style = edge_style;
        self.diagram.add_edge(edge);
        self
    }

    pub fn layout(mut self) -> Self {
        let ctx = LayoutContext::default();
        let engine = LayeredLayout::new();
        engine.layout(&mut self.diagram, &ctx);
        self
    }

    pub fn build(self) -> Diagram {
        self.diagram
    }
}
