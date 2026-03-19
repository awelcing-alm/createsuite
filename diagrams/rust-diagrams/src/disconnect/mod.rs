use crate::diagram_types::{
    ActorType, ArchitectureDiagramBuilder, ComponentType, MessageType, SequenceActor,
    SequenceDiagram, SequenceMessage,
};
use crate::engine::{Diagram, DiagramStyle, TECH_DARK};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisconnectAnalysis {
    pub title: String,
    pub description: String,
    pub issues: Vec<DisconnectIssue>,
    pub components: Vec<ComponentIssue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisconnectIssue {
    pub id: String,
    pub severity: IssueSeverity,
    pub title: String,
    pub description: String,
    pub location: IssueLocation,
    pub recommendation: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IssueSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueLocation {
    pub component: String,
    pub connection: Option<String>,
    pub protocol: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentIssue {
    pub component_id: String,
    pub issues: Vec<String>,
}

pub struct DisconnectDiagramGenerator {
    style: DiagramStyle,
}

impl DisconnectDiagramGenerator {
    pub fn new() -> Self {
        Self {
            style: DiagramStyle {
                preset: (*TECH_DARK).clone(),
                show_grid: true,
                show_legend: true,
                padding: 50.0,
                node_spacing: 180.0,
            },
        }
    }

    pub fn generate_elixir_agent_disconnect_diagram(&self) -> Diagram {
        let mut builder = ArchitectureDiagramBuilder::new("Elixir BE ↔ Agent-UI Disconnect")
            .with_style(self.style.clone());

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "agent-ui".to_string(),
            name: "Agent UI".to_string(),
            component_type: ComponentType::Client,
            description: Some("React/Vite frontend with macOS desktop aesthetic".to_string()),
            tech_stack: Some("React 19, TypeScript, Vite".to_string()),
            ports: vec![
                crate::diagram_types::PortDef {
                    name: "WebSocket".to_string(),
                    protocol: "Socket.IO".to_string(),
                    direction: crate::diagram_types::PortDirection::Bidirectional,
                },
                crate::diagram_types::PortDef {
                    name: "REST".to_string(),
                    protocol: "HTTP/JSON".to_string(),
                    direction: crate::diagram_types::PortDirection::Bidirectional,
                },
            ],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "api-gateway".to_string(),
            name: "API Gateway".to_string(),
            component_type: ComponentType::Gateway,
            description: Some("Entry point for all client connections".to_string()),
            tech_stack: Some("Phoenix Gateway".to_string()),
            ports: vec![crate::diagram_types::PortDef {
                name: "External".to_string(),
                protocol: "HTTP/WS".to_string(),
                direction: crate::diagram_types::PortDirection::Bidirectional,
            }],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "elixir-backend".to_string(),
            name: "Elixir Backend".to_string(),
            component_type: ComponentType::Service,
            description: Some("Phoenix framework backend services".to_string()),
            tech_stack: Some("Elixir, Phoenix, ETS".to_string()),
            ports: vec![crate::diagram_types::PortDef {
                name: "Task Management".to_string(),
                protocol: "GenServer".to_string(),
                direction: crate::diagram_types::PortDirection::Bidirectional,
            }],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "task-manager".to_string(),
            name: "Task Manager".to_string(),
            component_type: ComponentType::Service,
            description: Some("Git-backed task tracking system".to_string()),
            tech_stack: Some("Elixir, Git".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "agent-orchestrator".to_string(),
            name: "Agent Orchestrator".to_string(),
            component_type: ComponentType::Service,
            description: Some("Orchestrates multi-agent workflows".to_string()),
            tech_stack: Some("Elixir".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "convoy-manager".to_string(),
            name: "Convoy Manager".to_string(),
            component_type: ComponentType::Service,
            description: Some("Groups related tasks into convoys".to_string()),
            tech_stack: Some("Elixir".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "message-broker".to_string(),
            name: "Message Broker".to_string(),
            component_type: ComponentType::Queue,
            description: Some("Inter-agent communication".to_string()),
            tech_stack: Some("Phoenix PubSub".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "git-storage".to_string(),
            name: "Git Storage".to_string(),
            component_type: ComponentType::Storage,
            description: Some("Persistent state via git".to_string()),
            tech_stack: Some("simple-git".to_string()),
            ports: vec![],
        });

        builder = builder.add_connection("agent-ui", "api-gateway", "HTTP/WebSocket");
        builder = builder.add_connection("api-gateway", "elixir-backend", "GenServer");
        builder = builder.add_connection("elixir-backend", "task-manager", "ETS Messages");
        builder = builder.add_connection("elixir-backend", "agent-orchestrator", "Supervision");
        builder = builder.add_connection("elixir-backend", "convoy-manager", "Supervision");
        builder = builder.add_connection("agent-orchestrator", "message-broker", "PubSub");
        builder = builder.add_connection("convoy-manager", "message-broker", "PubSub");
        builder = builder.add_connection("task-manager", "git-storage", "Git Operations");

        builder = builder.add_group("Frontend Layer", &["agent-ui"], "#58a6ff");

        builder = builder.add_group(
            "Backend Services",
            &[
                "elixir-backend",
                "task-manager",
                "agent-orchestrator",
                "convoy-manager",
                "message-broker",
            ],
            "#238636",
        );

        builder = builder.add_group("Storage Layer", &["git-storage"], "#8957e5");

        builder.layout().build()
    }

    pub fn generate_protocol_mismatch_diagram(&self) -> SequenceDiagram {
        let mut diagram = SequenceDiagram::new("Protocol Mismatch Analysis");

        diagram = diagram.add_actor(SequenceActor {
            id: "ui".to_string(),
            name: "Agent UI".to_string(),
            actor_type: ActorType::Agent,
        });

        diagram = diagram.add_actor(SequenceActor {
            id: "gateway".to_string(),
            name: "Phoenix Gateway".to_string(),
            actor_type: ActorType::Service,
        });

        diagram = diagram.add_actor(SequenceActor {
            id: "be".to_string(),
            name: "Elixir Backend".to_string(),
            actor_type: ActorType::Service,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg1".to_string(),
            from: "ui".to_string(),
            to: "gateway".to_string(),
            label: "WebSocket Connect".to_string(),
            message_type: MessageType::Sync,
            step: 1,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg2".to_string(),
            from: "ui".to_string(),
            to: "gateway".to_string(),
            label: "Task Create".to_string(),
            message_type: MessageType::Async,
            step: 2,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg3".to_string(),
            from: "gateway".to_string(),
            to: "be".to_string(),
            label: "GenServer Call".to_string(),
            message_type: MessageType::Sync,
            step: 3,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg4".to_string(),
            from: "be".to_string(),
            to: "gateway".to_string(),
            label: "Response".to_string(),
            message_type: MessageType::Response,
            step: 4,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg5".to_string(),
            from: "gateway".to_string(),
            to: "ui".to_string(),
            label: "Socket.IO Event".to_string(),
            message_type: MessageType::Async,
            step: 5,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg6".to_string(),
            from: "ui".to_string(),
            to: "gateway".to_string(),
            label: "Agent Spawn".to_string(),
            message_type: MessageType::Sync,
            step: 6,
        });

        diagram = diagram.add_message(SequenceMessage {
            id: "msg7".to_string(),
            from: "gateway".to_string(),
            to: "ui".to_string(),
            label: "ERROR: Timeout".to_string(),
            message_type: MessageType::Error,
            step: 7,
        });

        diagram
    }

    pub fn generate_state_sync_issue_diagram(&self) -> Diagram {
        let mut builder = ArchitectureDiagramBuilder::new("State Synchronization Issues")
            .with_style(self.style.clone());

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "ui-state".to_string(),
            name: "UI State".to_string(),
            component_type: ComponentType::Client,
            description: Some("React state (convoyManager, taskManager)".to_string()),
            tech_stack: Some("Zustand/Jotai".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "server-state".to_string(),
            name: "Server State".to_string(),
            component_type: ComponentType::Service,
            description: Some("ETS-backed task state".to_string()),
            tech_stack: Some("Elixir GenServer".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "git-state".to_string(),
            name: "Git State".to_string(),
            component_type: ComponentType::Storage,
            description: Some("Persisted via simple-git".to_string()),
            tech_stack: Some("Node.js simple-git".to_string()),
            ports: vec![],
        });

        builder = builder.add_component(crate::diagram_types::SystemComponent {
            id: "sync-issue".to_string(),
            name: "⚠ Sync Gap".to_string(),
            component_type: ComponentType::Network,
            description: Some("Potential state drift between layers".to_string()),
            tech_stack: None,
            ports: vec![],
        });

        builder = builder.add_connection("ui-state", "server-state", "HTTP Poll");
        builder = builder.add_connection("ui-state", "git-state", "Git Push");
        builder = builder.add_connection("server-state", "git-state", "Git Write");

        builder.layout().build()
    }

    pub fn analyze_disconnects(&self) -> DisconnectAnalysis {
        DisconnectAnalysis {
            title: "Elixir Backend ↔ Agent-UI Disconnect Analysis".to_string(),
            description: "Comprehensive analysis of architectural disconnects between Elixir backend and TypeScript/React frontend".to_string(),
            issues: vec![
                DisconnectIssue {
                    id: "DISC-001".to_string(),
                    severity: IssueSeverity::Critical,
                    title: "Protocol Translation Gap".to_string(),
                    description: "WebSocket messages from Agent UI must be translated to GenServer calls, introducing latency and potential message loss".to_string(),
                    location: IssueLocation {
                        component: "api-gateway".to_string(),
                        connection: Some("WebSocket → GenServer".to_string()),
                        protocol: Some("Socket.IO ↔ GenServer".to_string()),
                    },
                    recommendation: "Implement direct WebSocket handlers in Phoenix channels with automatic GenServer translation".to_string(),
                },
                DisconnectIssue {
                    id: "DISC-002".to_string(),
                    severity: IssueSeverity::High,
                    title: "State Synchronization Delay".to_string(),
                    description: "UI state updates are pulled on intervals while Elixir backend uses ETS for real-time state. Convoy and task updates may appear stale".to_string(),
                    location: IssueLocation {
                        component: "convoy-manager".to_string(),
                        connection: Some("Server State → UI State".to_string()),
                        protocol: Some("HTTP/Polling".to_string()),
                    },
                    recommendation: "Use Phoenix Presence for real-time state sync across all connected clients".to_string(),
                },
                DisconnectIssue {
                    id: "DISC-003".to_string(),
                    severity: IssueSeverity::High,
                    title: "Git Bridge Latency".to_string(),
                    description: "simple-git operations run on Node.js side while Elixir uses its own Git state. Double-write pattern introduces inconsistency risk".to_string(),
                    location: IssueLocation {
                        component: "git-storage".to_string(),
                        connection: Some("task-manager → git-state".to_string()),
                        protocol: Some("File System".to_string()),
                    },
                    recommendation: "Consolidate Git operations in one layer; prefer Elixir's Porcelain or Gitx for atomic operations".to_string(),
                },
                DisconnectIssue {
                    id: "DISC-004".to_string(),
                    severity: IssueSeverity::Medium,
                    title: "Agent Lifecycle Mismatch".to_string(),
                    description: "Elixir's supervised agent model doesn't map directly to UI agent representations. Status updates can be out of sync".to_string(),
                    location: IssueLocation {
                        component: "agent-orchestrator".to_string(),
                        connection: Some("Agent Lifecycle".to_string()),
                        protocol: Some("Supervision Tree".to_string()),
                    },
                    recommendation: "Implement explicit state machine for agent lifecycle visible to UI with proper terminal states".to_string(),
                },
                DisconnectIssue {
                    id: "DISC-005".to_string(),
                    severity: IssueSeverity::Medium,
                    title: "Convoy Grouping Semantic Gap".to_string(),
                    description: "Convoy grouping logic exists in Elixir but UI shows different grouping due to TypeScript state transformation".to_string(),
                    location: IssueLocation {
                        component: "convoy-manager".to_string(),
                        connection: Some("Elixir Convoys → TS Convoys".to_string()),
                        protocol: Some("JSON Serialization".to_string()),
                    },
                    recommendation: "Define shared convoy schema with validation at both boundaries".to_string(),
                },
                DisconnectIssue {
                    id: "DISC-006".to_string(),
                    severity: IssueSeverity::Low,
                    title: "Error Propagation Opacity".to_string(),
                    description: "Elixir errors are caught at gateway level and converted to generic HTTP responses. Original error context is lost".to_string(),
                    location: IssueLocation {
                        component: "api-gateway".to_string(),
                        connection: Some("Backend → Gateway".to_string()),
                        protocol: Some("GenServer Responses".to_string()),
                    },
                    recommendation: "Implement structured error responses with error codes that map to UI error states".to_string(),
                },
            ],
            components: vec![
                ComponentIssue {
                    component_id: "task-manager".to_string(),
                    issues: vec![
                        "Task status enum mismatch: TS uses TaskStatus enum, Elixir uses atom keys".to_string(),
                        "Priority levels not synchronized during concurrent updates".to_string(),
                    ],
                },
                ComponentIssue {
                    component_id: "convoy-manager".to_string(),
                    issues: vec![
                        "Convoy status tracking happens in ETS but UI polls Git for updates".to_string(),
                        "Task assignment events not propagated to UI in real-time".to_string(),
                    ],
                },
                ComponentIssue {
                    component_id: "agent-orchestrator".to_string(),
                    issues: vec![
                        "Agent mailbox messages not exposed to UI".to_string(),
                        "Terminal PID mapping between Elixir and node-pty is implicit".to_string(),
                    ],
                },
            ],
        }
    }

    pub fn generate_full_disconnect_report(&self) -> DisconnectReport {
        let analysis = self.analyze_disconnects();

        DisconnectReport {
            summary: "Multiple critical disconnects identified between Elixir backend and Agent UI"
                .to_string(),
            critical_count: analysis
                .issues
                .iter()
                .filter(|i| i.severity == IssueSeverity::Critical)
                .count(),
            high_count: analysis
                .issues
                .iter()
                .filter(|i| i.severity == IssueSeverity::High)
                .count(),
            medium_count: analysis
                .issues
                .iter()
                .filter(|i| i.severity == IssueSeverity::Medium)
                .count(),
            low_count: analysis
                .issues
                .iter()
                .filter(|i| i.severity == IssueSeverity::Low)
                .count(),
            diagrams: DisconnectDiagrams {
                architecture: self.generate_elixir_agent_disconnect_diagram(),
                sequence: self.generate_protocol_mismatch_diagram(),
                state_sync: self.generate_state_sync_issue_diagram(),
            },
            analysis,
        }
    }
}

impl Default for DisconnectDiagramGenerator {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisconnectReport {
    pub summary: String,
    pub critical_count: usize,
    pub high_count: usize,
    pub medium_count: usize,
    pub low_count: usize,
    pub diagrams: DisconnectDiagrams,
    pub analysis: DisconnectAnalysis,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisconnectDiagrams {
    pub architecture: Diagram,
    pub sequence: SequenceDiagram,
    pub state_sync: Diagram,
}
