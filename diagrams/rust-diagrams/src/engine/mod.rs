use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiagramKind {
    Architecture,
    Sequence,
    Flowchart,
    Component,
    DataFlow,
    Network,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LayoutAlgorithm {
    ForceDirected,
    Layered,
    Grid,
    Linear,
    Custom,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StylePreset {
    pub name: String,
    pub background: String,
    pub grid_color: String,
    pub font_family: String,
}

lazy_static::lazy_static! {
    pub static ref TECH_DARK: StylePreset = StylePreset {
        name: "tech-dark".to_string(),
        background: "#0d1117".to_string(),
        grid_color: "#21262d".to_string(),
        font_family: "JetBrains Mono, Consolas, monospace".to_string(),
    };

    pub static ref TECH_LIGHT: StylePreset = StylePreset {
        name: "tech-light".to_string(),
        background: "#ffffff".to_string(),
        grid_color: "#e1e4e8".to_string(),
        font_family: "Inter, system-ui, sans-serif".to_string(),
    };

    pub static ref BLUEPRINT: StylePreset = StylePreset {
        name: "blueprint".to_string(),
        background: "#1a365d".to_string(),
        grid_color: "#2a4a7f".to_string(),
        font_family: "Courier New, monospace".to_string(),
    };
}

pub fn tech_dark() -> StylePreset {
    TECH_DARK.clone()
}

pub fn tech_light() -> StylePreset {
    TECH_LIGHT.clone()
}

pub fn blueprint() -> StylePreset {
    BLUEPRINT.clone()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagramStyle {
    pub preset: StylePreset,
    pub show_grid: bool,
    pub show_legend: bool,
    pub padding: f64,
    pub node_spacing: f64,
}

impl Default for DiagramStyle {
    fn default() -> Self {
        Self {
            preset: (*TECH_DARK).clone(),
            show_grid: true,
            show_legend: true,
            padding: 40.0,
            node_spacing: 120.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

impl Point {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    pub fn distance_to(&self, other: &Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        (dx * dx + dy * dy).sqrt()
    }

    pub fn midpoint(&self, other: &Point) -> Point {
        Point::new((self.x + other.x) / 2.0, (self.y + other.y) / 2.0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dimensions {
    pub width: f64,
    pub height: f64,
}

impl Dimensions {
    pub fn new(width: f64, height: f64) -> Self {
        Self { width, height }
    }

    pub fn square(size: f64) -> Self {
        Self::new(size, size)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

impl Bounds {
    pub fn new(x: f64, y: f64, width: f64, height: f64) -> Self {
        Self {
            x,
            y,
            width,
            height,
        }
    }

    pub fn contains(&self, point: &Point) -> bool {
        point.x >= self.x
            && point.x <= self.x + self.width
            && point.y >= self.y
            && point.y <= self.y + self.height
    }

    pub fn center(&self) -> Point {
        Point::new(self.x + self.width / 2.0, self.y + self.height / 2.0)
    }

    pub fn intersects(&self, other: &Bounds) -> bool {
        self.x < other.x + other.width
            && self.x + self.width > other.x
            && self.y < other.y + other.height
            && self.y + self.height > other.y
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum NodeShape {
    Rectangle,
    RoundedRect,
    Circle,
    Diamond,
    Parallelogram,
    Hexagon,
    Cylinder,
    Person,
    Document,
    Database,
    Queue,
    Cloud,
    Arrow,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ArrowHead {
    None,
    Triangle,
    Diamond,
    Circle,
    TriangleFilled,
    DiamondFilled,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LineStyle {
    Solid,
    Dashed,
    Dotted,
    Double,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeStyle {
    pub shape: NodeShape,
    pub fill_color: String,
    pub stroke_color: String,
    pub stroke_width: f64,
    pub corner_radius: f64,
    pub opacity: f64,
}

impl Default for NodeStyle {
    fn default() -> Self {
        Self {
            shape: NodeShape::Rectangle,
            fill_color: "#238636".to_string(),
            stroke_color: "#2ea043".to_string(),
            stroke_width: 2.0,
            corner_radius: 8.0,
            opacity: 1.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeStyle {
    pub stroke_color: String,
    pub stroke_width: f64,
    pub line_style: LineStyle,
    pub start_arrow: ArrowHead,
    pub end_arrow: ArrowHead,
    pub label_position: f64,
    pub dash_pattern: Option<Vec<f64>>,
}

impl Default for EdgeStyle {
    fn default() -> Self {
        Self {
            stroke_color: "#8b949e".to_string(),
            stroke_width: 2.0,
            line_style: LineStyle::Solid,
            start_arrow: ArrowHead::None,
            end_arrow: ArrowHead::Triangle,
            label_position: 0.5,
            dash_pattern: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub label: String,
    pub description: Option<String>,
    pub bounds: Bounds,
    pub style: NodeStyle,
    pub metadata: HashMap<String, String>,
    pub ports: Vec<Port>,
}

impl Node {
    pub fn new(id: &str, label: &str, bounds: Bounds) -> Self {
        Self {
            id: id.to_string(),
            label: label.to_string(),
            description: None,
            bounds,
            style: NodeStyle::default(),
            metadata: HashMap::new(),
            ports: Vec::new(),
        }
    }

    pub fn with_style(mut self, style: NodeStyle) -> Self {
        self.style = style;
        self
    }

    pub fn center(&self) -> Point {
        self.bounds.center()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Port {
    pub id: String,
    pub position: PortPosition,
    pub direction: PortDirection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PortPosition {
    Top,
    Bottom,
    Left,
    Right,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PortDirection {
    Input,
    Output,
    Bidirectional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub label: Option<String>,
    pub waypoints: Vec<Point>,
    pub style: EdgeStyle,
    pub metadata: HashMap<String, String>,
}

impl Edge {
    pub fn new(id: &str, source_id: &str, target_id: &str) -> Self {
        Self {
            id: id.to_string(),
            source_id: source_id.to_string(),
            target_id: target_id.to_string(),
            label: None,
            waypoints: Vec::new(),
            style: EdgeStyle::default(),
            metadata: HashMap::new(),
        }
    }

    pub fn with_label(mut self, label: &str) -> Self {
        self.label = Some(label.to_string());
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagram {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub kind: DiagramKind,
    pub style: DiagramStyle,
    pub nodes: HashMap<String, Node>,
    pub edges: HashMap<String, Edge>,
    pub groups: Vec<NodeGroup>,
    pub metadata: HashMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Diagram {
    pub fn new(title: &str, kind: DiagramKind) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            title: title.to_string(),
            description: None,
            kind,
            style: DiagramStyle::default(),
            nodes: HashMap::new(),
            edges: HashMap::new(),
            groups: Vec::new(),
            metadata: HashMap::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn add_node(&mut self, node: Node) -> &Node {
        let id = node.id.clone();
        self.nodes.insert(id, node);
        self.nodes
            .get(&self.nodes.keys().last().unwrap().clone())
            .unwrap()
    }

    pub fn add_edge(&mut self, edge: Edge) -> &Edge {
        let id = edge.id.clone();
        self.edges.insert(id, edge);
        self.edges
            .get(&self.edges.keys().last().unwrap().clone())
            .unwrap()
    }

    pub fn get_node(&self, id: &str) -> Option<&Node> {
        self.nodes.get(id)
    }

    pub fn get_node_mut(&mut self, id: &str) -> Option<&mut Node> {
        self.nodes.get_mut(id)
    }

    pub fn get_edge(&self, id: &str) -> Option<&Edge> {
        self.edges.get(id)
    }

    pub fn remove_node(&mut self, id: &str) -> Option<Node> {
        self.nodes.remove(id)
    }

    pub fn remove_edge(&mut self, id: &str) -> Option<Edge> {
        self.edges.remove(id)
    }

    pub fn bounds(&self) -> Bounds {
        let mut min_x = f64::MAX;
        let mut min_y = f64::MAX;
        let mut max_x = f64::MIN;
        let mut max_y = f64::MIN;

        for node in self.nodes.values() {
            min_x = min_x.min(node.bounds.x);
            min_y = min_y.min(node.bounds.y);
            max_x = max_x.max(node.bounds.x + node.bounds.width);
            max_y = max_y.max(node.bounds.y + node.bounds.height);
        }

        if min_x == f64::MAX {
            return Bounds::new(0.0, 0.0, 800.0, 600.0);
        }

        Bounds::new(
            min_x - self.style.padding,
            min_y - self.style.padding,
            max_x - min_x + self.style.padding * 2.0,
            max_y - min_y + self.style.padding * 2.0,
        )
    }

    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn edge_count(&self) -> usize {
        self.edges.len()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeGroup {
    pub id: String,
    pub name: String,
    pub node_ids: Vec<String>,
    pub style: GroupStyle,
    pub bounds: Option<Bounds>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupStyle {
    pub fill_color: String,
    pub stroke_color: String,
    pub stroke_width: f64,
    pub corner_radius: f64,
    pub label_position: Point,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutContext {
    pub algorithm: LayoutAlgorithm,
    pub bounds: Bounds,
    pub node_spacing: f64,
    pub layer_spacing: f64,
    pub start_point: Point,
}

impl Default for LayoutContext {
    fn default() -> Self {
        Self {
            algorithm: LayoutAlgorithm::Layered,
            bounds: Bounds::new(0.0, 0.0, 1200.0, 800.0),
            node_spacing: 150.0,
            layer_spacing: 200.0,
            start_point: Point::new(50.0, 50.0),
        }
    }
}

pub trait LayoutEngine: Send + Sync {
    fn layout(&self, diagram: &mut Diagram, context: &LayoutContext);
}

pub struct ForceDirectedLayout;

impl ForceDirectedLayout {
    pub fn new() -> Self {
        Self
    }

    fn repulsion_force(&self, p1: &Point, p2: &Point, strength: f64) -> Point {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let dist = (dx * dx + dy * dy).sqrt().max(1.0);
        let force = strength / (dist * dist);
        Point::new(dx / dist * force, dy / dist * force)
    }

    fn attraction_force(&self, p1: &Point, p2: &Point, strength: f64) -> Point {
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let dist = (dx * dx + dy * dy).sqrt().max(1.0);
        let force = strength * dist;
        Point::new(dx / dist * force, dy / dist * force)
    }
}

impl Default for ForceDirectedLayout {
    fn default() -> Self {
        Self::new()
    }
}

impl LayoutEngine for ForceDirectedLayout {
    fn layout(&self, diagram: &mut Diagram, context: &LayoutContext) {
        let nodes: Vec<(String, Point)> = diagram
            .nodes
            .iter()
            .map(|(id, node)| (id.clone(), node.center()))
            .collect();

        let edges: Vec<(String, String)> = diagram
            .edges
            .iter()
            .map(|(_, edge)| (edge.source_id.clone(), edge.target_id.clone()))
            .collect();

        let iterations = 50;
        let repulsion_strength = 5000.0;
        let attraction_strength = 0.01;
        let damping = 0.9;

        let mut positions: HashMap<String, Point> = nodes
            .iter()
            .map(|(id, pos)| (id.clone(), pos.clone()))
            .collect();

        for _ in 0..iterations {
            let mut forces: HashMap<String, Point> = nodes
                .iter()
                .map(|(id, _)| (id.clone(), Point::new(0.0, 0.0)))
                .collect();

            for i in 0..nodes.len() {
                for j in (i + 1)..nodes.len() {
                    let p1 = &nodes[i].1;
                    let p2 = &nodes[j].1;
                    let repulsion = self.repulsion_force(p1, p2, repulsion_strength);

                    *forces.get_mut(&nodes[i].0).unwrap() = Point::new(
                        forces.get(&nodes[i].0).unwrap().x + repulsion.x,
                        forces.get(&nodes[i].0).unwrap().y + repulsion.y,
                    );
                    *forces.get_mut(&nodes[j].0).unwrap() = Point::new(
                        forces.get(&nodes[j].0).unwrap().x - repulsion.x,
                        forces.get(&nodes[j].0).unwrap().y - repulsion.y,
                    );
                }
            }

            for edge in &edges {
                if let (Some(p1), Some(p2)) = (positions.get(&edge.0), positions.get(&edge.1)) {
                    let attraction = self.attraction_force(p1, p2, attraction_strength);
                    *forces.get_mut(&edge.0).unwrap() = Point::new(
                        forces.get(&edge.0).unwrap().x + attraction.x,
                        forces.get(&edge.0).unwrap().y + attraction.y,
                    );
                    *forces.get_mut(&edge.1).unwrap() = Point::new(
                        forces.get(&edge.1).unwrap().x - attraction.x,
                        forces.get(&edge.1).unwrap().y - attraction.y,
                    );
                }
            }

            for (id, force) in &forces {
                if let Some(pos) = positions.get_mut(id) {
                    pos.x += force.x * damping;
                    pos.y += force.y * damping;

                    pos.x = pos
                        .x
                        .max(context.bounds.x)
                        .min(context.bounds.x + context.bounds.width);
                    pos.y = pos
                        .y
                        .max(context.bounds.y)
                        .min(context.bounds.y + context.bounds.height);
                }
            }
        }

        for (id, pos) in positions {
            if let Some(node) = diagram.nodes.get_mut(&id) {
                let cx = pos.x - node.bounds.width / 2.0;
                let cy = pos.y - node.bounds.height / 2.0;
                node.bounds.x = cx;
                node.bounds.y = cy;
            }
        }
    }
}

pub struct LayeredLayout;

impl LayeredLayout {
    pub fn new() -> Self {
        Self
    }

    fn build_adjacency(&self, diagram: &Diagram) -> HashMap<String, Vec<String>> {
        let mut adj: HashMap<String, Vec<String>> = HashMap::new();
        for node in diagram.nodes.keys() {
            adj.insert(node.clone(), Vec::new());
        }
        for edge in diagram.edges.values() {
            if let Some(neighbors) = adj.get_mut(&edge.source_id) {
                neighbors.push(edge.target_id.clone());
            }
        }
        adj
    }

    fn topological_sort(&self, diagram: &Diagram) -> Vec<String> {
        let adj = self.build_adjacency(diagram);
        let mut in_degree: HashMap<String, usize> =
            diagram.nodes.keys().map(|id| (id.clone(), 0)).collect();

        for neighbors in adj.values() {
            for neighbor in neighbors {
                *in_degree.get_mut(neighbor).unwrap() += 1;
            }
        }

        let mut queue: Vec<String> = in_degree
            .iter()
            .filter(|(_, &deg)| deg == 0)
            .map(|(id, _)| id.clone())
            .collect();

        let mut result = Vec::new();
        while let Some(node) = queue.pop() {
            let node_clone = node.clone();
            result.push(node_clone);
            if let Some(neighbors) = adj.get(&node) {
                for neighbor in neighbors {
                    *in_degree.get_mut(neighbor).unwrap() -= 1;
                    if in_degree[neighbor] == 0 {
                        queue.push(neighbor.clone());
                    }
                }
            }
        }

        result
    }
}

impl Default for LayeredLayout {
    fn default() -> Self {
        Self::new()
    }
}

impl LayoutEngine for LayeredLayout {
    fn layout(&self, diagram: &mut Diagram, context: &LayoutContext) {
        let sorted = self.topological_sort(diagram);
        let mut layers: Vec<Vec<String>> = Vec::new();
        let mut assigned: HashMap<String, usize> = HashMap::new();

        for node_id in sorted {
            let layer_idx = if let Some(max_layer) = diagram
                .edges
                .iter()
                .filter(|(_, e)| e.target_id == node_id)
                .filter_map(|(_, e)| assigned.get(&e.source_id))
                .max()
            {
                max_layer + 1
            } else {
                0
            };

            if layer_idx >= layers.len() {
                layers.resize(layer_idx + 1, Vec::new());
            }
            layers[layer_idx].push(node_id.clone());
            assigned.insert(node_id, layer_idx);
        }

        let mut y = context.start_point.y;
        for layer in &layers {
            let layer_width: f64 = layer
                .iter()
                .filter_map(|id| diagram.nodes.get(id))
                .map(|n| n.bounds.width)
                .sum();

            let start_x = context.start_point.x + (context.bounds.width - layer_width) / 2.0;
            let mut x = start_x;

            for node_id in layer {
                if let Some(node) = diagram.nodes.get_mut(node_id) {
                    node.bounds.x = x;
                    node.bounds.y = y;
                    x += node.bounds.width + context.node_spacing;
                }
            }

            y += context.layer_spacing;
        }
    }
}
