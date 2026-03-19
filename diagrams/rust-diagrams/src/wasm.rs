use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

use rust_diagrams::diagram_types::{
    ActorType, ArchitectureDiagramBuilder, ComponentType, MessageType, SequenceActor,
    SequenceDiagram, SequenceMessage, SystemComponent,
};
use rust_diagrams::disconnect::DisconnectDiagramGenerator;
use rust_diagrams::engine::{Diagram, DiagramKind, DiagramStyle, StylePreset, TECH_DARK};
use rust_diagrams::export::{HtmlExporter, SvgExportOptions, SvgExporter};

#[wasm_bindgen]
pub struct DiagramRenderer {
    svg_exporter: SvgExporter,
}

#[wasm_bindgen]
impl DiagramRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            svg_exporter: SvgExporter::new(),
        }
    }

    #[wasm_bindgen]
    pub fn render_svg(&self, diagram_json: &str) -> String {
        match serde_json::from_str::<Diagram>(diagram_json) {
            Ok(diagram) => self
                .svg_exporter
                .export(&diagram, &SvgExportOptions::default()),
            Err(e) => format!("{{\"error\": \"Failed to parse diagram: {}\"}}", e),
        }
    }

    #[wasm_bindgen]
    pub fn render_html(&self, diagram_json: &str) -> String {
        match serde_json::from_str::<Diagram>(diagram_json) {
            Ok(diagram) => {
                let svg = self
                    .svg_exporter
                    .export(&diagram, &SvgExportOptions::default());
                HtmlExporter::export(&diagram, &svg)
            }
            Err(e) => format!("{{\"error\": \"Failed to parse diagram: {}\"}}", e),
        }
    }

    #[wasm_bindgen]
    pub fn generate_disconnect_diagram(&self) -> String {
        let generator = DisconnectDiagramGenerator::new();
        let diagram = generator.generate_elixir_agent_disconnect_diagram();
        serde_json::to_string(&diagram).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn generate_disconnect_svg(&self) -> String {
        let generator = DisconnectDiagramGenerator::new();
        let diagram = generator.generate_elixir_agent_disconnect_diagram();
        self.svg_exporter
            .export(&diagram, &SvgExportOptions::default())
    }

    #[wasm_bindgen]
    pub fn generate_disconnect_analysis(&self) -> String {
        let generator = DisconnectDiagramGenerator::new();
        let report = generator.generate_full_disconnect_report();
        serde_json::to_string(&report.analysis).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn generate_disconnect_html(&self) -> String {
        let generator = DisconnectDiagramGenerator::new();
        let report = generator.generate_full_disconnect_report();
        let svg = self
            .svg_exporter
            .export(&report.diagrams.architecture, &SvgExportOptions::default());
        HtmlExporter::export(&report.diagrams.architecture, &svg)
    }
}

impl Default for DiagramRenderer {
    fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
pub struct ArchitectureDiagramBuilderJs {
    builder: ArchitectureDiagramBuilder,
}

#[wasm_bindgen]
impl ArchitectureDiagramBuilderJs {
    #[wasm_bindgen(constructor)]
    pub fn new(title: &str) -> Self {
        Self {
            builder: ArchitectureDiagramBuilder::new(title).with_style(DiagramStyle::default()),
        }
    }

    #[wasm_bindgen]
    pub fn add_service(mut self, id: &str, name: &str, description: &str) -> Self {
        self.builder = self.builder.add_component(SystemComponent {
            id: id.to_string(),
            name: name.to_string(),
            component_type: ComponentType::Service,
            description: Some(description.to_string()),
            tech_stack: None,
            ports: vec![],
        });
        self
    }

    #[wasm_bindgen]
    pub fn add_database(mut self, id: &str, name: &str, description: &str) -> Self {
        self.builder = self.builder.add_component(SystemComponent {
            id: id.to_string(),
            name: name.to_string(),
            component_type: ComponentType::Database,
            description: Some(description.to_string()),
            tech_stack: None,
            ports: vec![],
        });
        self
    }

    #[wasm_bindgen]
    pub fn add_client(mut self, id: &str, name: &str, description: &str) -> Self {
        self.builder = self.builder.add_component(SystemComponent {
            id: id.to_string(),
            name: name.to_string(),
            component_type: ComponentType::Client,
            description: Some(description.to_string()),
            tech_stack: None,
            ports: vec![],
        });
        self
    }

    #[wasm_bindgen]
    pub fn add_queue(mut self, id: &str, name: &str, description: &str) -> Self {
        self.builder = self.builder.add_component(SystemComponent {
            id: id.to_string(),
            name: name.to_string(),
            component_type: ComponentType::Queue,
            description: Some(description.to_string()),
            tech_stack: None,
            ports: vec![],
        });
        self
    }

    #[wasm_bindgen]
    pub fn add_connection(mut self, source_id: &str, target_id: &str, protocol: &str) -> Self {
        self.builder = self.builder.add_connection(source_id, target_id, protocol);
        self
    }

    #[wasm_bindgen]
    pub fn build(self) -> String {
        let diagram = self.builder.layout().build();
        serde_json::to_string(&diagram).unwrap_or_default()
    }
}

#[wasm_bindgen]
pub struct SequenceDiagramBuilderJs {
    diagram: SequenceDiagram,
}

#[wasm_bindgen]
impl SequenceDiagramBuilderJs {
    #[wasm_bindgen(constructor)]
    pub fn new(title: &str) -> Self {
        Self {
            diagram: SequenceDiagram::new(title),
        }
    }

    #[wasm_bindgen]
    pub fn add_actor(mut self, id: &str, name: &str, actor_type: &str) -> Self {
        let at = match actor_type {
            "user" => ActorType::User,
            "agent" => ActorType::Agent,
            "service" => ActorType::Service,
            "system" => ActorType::System,
            _ => ActorType::External,
        };

        self.diagram = self.diagram.add_actor(SequenceActor {
            id: id.to_string(),
            name: name.to_string(),
            actor_type: at,
        });
        self
    }

    #[wasm_bindgen]
    pub fn add_message(mut self, from_id: &str, to_id: &str, label: &str, msg_type: &str) -> Self {
        let mt = match msg_type {
            "sync" => MessageType::Sync,
            "async" => MessageType::Async,
            "response" => MessageType::Response,
            "error" => MessageType::Error,
            _ => MessageType::Sync,
        };

        let step = self.diagram.messages.len() + 1;

        self.diagram = self.diagram.add_message(SequenceMessage {
            id: format!("msg{}", step),
            from: from_id.to_string(),
            to: to_id.to_string(),
            label: label.to_string(),
            message_type: mt,
            step,
        });
        self
    }

    #[wasm_bindgen]
    pub fn render_svg(&self) -> String {
        self.diagram.render_svg()
    }

    #[wasm_bindgen]
    pub fn to_json(&self) -> String {
        serde_json::to_string(&self.diagram).unwrap_or_default()
    }
}

#[wasm_bindgen(start)]
pub fn wasm_main() {
    console_log!("Diagram WASM module initialized");
}
