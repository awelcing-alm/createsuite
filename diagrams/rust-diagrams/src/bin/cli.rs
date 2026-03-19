use clap::{Parser, Subcommand};
use rust_diagrams::diagram_types::{
    ActorType, ArchitectureDiagramBuilder, ComponentType, FlowchartBuilder, FlowchartNode,
    FlowchartNodeType, MessageType, SequenceActor, SequenceDiagram, SequenceMessage,
    SystemComponent,
};
use rust_diagrams::disconnect::DisconnectDiagramGenerator;
use rust_diagrams::engine::{
    blueprint, tech_dark, tech_light, DiagramStyle,
};
use rust_diagrams::export::{HtmlExporter, JsonExporter, SvgExportOptions, SvgExporter};
use std::fs;

#[derive(Parser)]
#[command(name = "diagram-cli")]
#[command(about = "High-performance technical diagram generation", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Architecture {
        #[arg(short, long, default_value = "Architecture Diagram")]
        title: String,
        #[arg(short, long)]
        output: Option<String>,
        #[arg(short, long, value_enum, default_value = "dark")]
        theme: Theme,
    },
    Sequence {
        #[arg(short, long, default_value = "Sequence Diagram")]
        title: String,
        #[arg(short, long)]
        output: Option<String>,
        #[arg(short, long, value_enum, default_value = "dark")]
        theme: Theme,
    },
    Flowchart {
        #[arg(short, long, default_value = "Flowchart")]
        title: String,
        #[arg(short, long)]
        output: Option<String>,
        #[arg(short, long, value_enum, default_value = "dark")]
        theme: Theme,
    },
    Disconnect {
        #[arg(short, long, default_value = "Elixir-UI Disconnect")]
        title: String,
        #[arg(short, long)]
        output: Option<String>,
    },
    Export {
        #[arg(short, long)]
        input: String,
        #[arg(short, long, value_enum, default_value = "svg")]
        format: ExportFormat,
        #[arg(short, long)]
        output: Option<String>,
    },
}

#[derive(clap::ValueEnum, Clone, Default)]
enum Theme {
    Dark,
    #[default]
    TechDark,
    Light,
    Blueprint,
}

#[derive(clap::ValueEnum, Clone, Default)]
enum ExportFormat {
    #[default]
    Svg,
    Html,
    Json,
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Architecture {
            title,
            output,
            theme,
        } => {
            generate_architecture(&title, output.as_deref(), theme);
        }
        Commands::Sequence {
            title,
            output,
            theme,
        } => {
            generate_sequence(&title, output.as_deref(), theme);
        }
        Commands::Flowchart {
            title,
            output,
            theme,
        } => {
            generate_flowchart(&title, output.as_deref(), theme);
        }
        Commands::Disconnect { title, output, .. } => {
            generate_disconnect(&title, output.as_deref());
        }
        Commands::Export {
            input,
            format,
            output,
        } => {
            export_diagram(&input, format, output.as_deref());
        }
    }
}

fn get_style(theme: &Theme) -> DiagramStyle {
    let preset = match theme {
        Theme::Dark | Theme::TechDark => tech_dark(),
        Theme::Light => tech_light(),
        Theme::Blueprint => blueprint(),
    };
    DiagramStyle {
        preset,
        show_grid: true,
        show_legend: true,
        padding: 50.0,
        node_spacing: 180.0,
    }
}

fn generate_architecture(title: &str, output: Option<&str>, theme: Theme) {
    let style = get_style(&theme);
    let mut builder = ArchitectureDiagramBuilder::new(title).with_style(style);

    builder = builder.add_component(SystemComponent {
        id: "client".to_string(),
        name: "Client".to_string(),
        component_type: ComponentType::Client,
        description: Some("End user interface".to_string()),
        tech_stack: Some("Web Browser".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "api".to_string(),
        name: "API Gateway".to_string(),
        component_type: ComponentType::Gateway,
        description: Some("Entry point".to_string()),
        tech_stack: Some("Phoenix".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "service".to_string(),
        name: "Services".to_string(),
        component_type: ComponentType::Service,
        description: Some("Business logic".to_string()),
        tech_stack: Some("Elixir".to_string()),
        ports: vec![],
    });

    builder = builder.add_component(SystemComponent {
        id: "db".to_string(),
        name: "Database".to_string(),
        component_type: ComponentType::Database,
        description: Some("Persistent storage".to_string()),
        tech_stack: Some("PostgreSQL".to_string()),
        ports: vec![],
    });

    builder = builder.add_connection("client", "api", "HTTP");
    builder = builder.add_connection("api", "service", "GenServer");
    builder = builder.add_connection("service", "db", "Ecto");

    let diagram = builder.layout().build();

    let svg_exporter = SvgExporter::new();
    let svg = svg_exporter.export(&diagram, &SvgExportOptions::default());

    let output_path = output.unwrap_or("outputs/architecture.svg");
    fs::create_dir_all("outputs").ok();
    fs::write(output_path, &svg).expect("Failed to write SVG");

    println!("Generated: {}", output_path);
}

fn generate_sequence(title: &str, output: Option<&str>, _theme: Theme) {
    let diagram = SequenceDiagram::new(title)
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
        .add_actor(SequenceActor {
            id: "c".to_string(),
            name: "Actor C".to_string(),
            actor_type: ActorType::System,
        })
        .add_message(SequenceMessage {
            id: "1".to_string(),
            from: "a".to_string(),
            to: "b".to_string(),
            label: "Request".to_string(),
            message_type: MessageType::Sync,
            step: 1,
        })
        .add_message(SequenceMessage {
            id: "2".to_string(),
            from: "b".to_string(),
            to: "c".to_string(),
            label: "Process".to_string(),
            message_type: MessageType::Async,
            step: 2,
        })
        .add_message(SequenceMessage {
            id: "3".to_string(),
            from: "c".to_string(),
            to: "b".to_string(),
            label: "Done".to_string(),
            message_type: MessageType::Response,
            step: 3,
        })
        .add_message(SequenceMessage {
            id: "4".to_string(),
            from: "b".to_string(),
            to: "a".to_string(),
            label: "Response".to_string(),
            message_type: MessageType::Response,
            step: 4,
        });

    let svg = diagram.render_svg();

    let output_path = output.unwrap_or("outputs/sequence.svg");
    fs::create_dir_all("outputs").ok();
    fs::write(output_path, &svg).expect("Failed to write SVG");

    println!("Generated: {}", output_path);
}

fn generate_flowchart(title: &str, output: Option<&str>, theme: Theme) {
    let _style = get_style(&theme);
    let mut builder = FlowchartBuilder::new(title);

    builder = builder.add_node(FlowchartNode {
        id: "start".to_string(),
        label: "Start".to_string(),
        node_type: FlowchartNodeType::Start,
    });

    builder = builder.add_node(FlowchartNode {
        id: "input".to_string(),
        label: "Get Input".to_string(),
        node_type: FlowchartNodeType::Input,
    });

    builder = builder.add_node(FlowchartNode {
        id: "validate".to_string(),
        label: "Validate".to_string(),
        node_type: FlowchartNodeType::Decision,
    });

    builder = builder.add_node(FlowchartNode {
        id: "process".to_string(),
        label: "Process".to_string(),
        node_type: FlowchartNodeType::Process,
    });

    builder = builder.add_node(FlowchartNode {
        id: "output".to_string(),
        label: "Output".to_string(),
        node_type: FlowchartNodeType::Output,
    });

    builder = builder.add_node(FlowchartNode {
        id: "end".to_string(),
        label: "End".to_string(),
        node_type: FlowchartNodeType::End,
    });

    builder = builder.add_flow("start", "input", None);
    builder = builder.add_flow("input", "validate", None);
    builder = builder.add_flow("validate", "process", Some("Valid"));
    builder = builder.add_flow("validate", "input", Some("Invalid"));
    builder = builder.add_flow("process", "output", None);
    builder = builder.add_flow("output", "end", None);

    let diagram = builder.layout_linear().build();

    let svg_exporter = SvgExporter::new();
    let svg = svg_exporter.export(&diagram, &SvgExportOptions::default());

    let output_path = output.unwrap_or("outputs/flowchart.svg");
    fs::create_dir_all("outputs").ok();
    fs::write(output_path, &svg).expect("Failed to write SVG");

    println!("Generated: {}", output_path);
}

fn generate_disconnect(_title: &str, output: Option<&str>) {
    let generator = DisconnectDiagramGenerator::new();
    let report = generator.generate_full_disconnect_report();

    let svg_exporter = SvgExporter::new();
    let svg = svg_exporter.export(&report.diagrams.architecture, &SvgExportOptions::default());

    let output_path = output.unwrap_or("outputs/disconnect.svg");
    fs::create_dir_all("outputs").ok();
    fs::write(output_path, &svg).expect("Failed to write SVG");

    let analysis_path = "outputs/disconnect-analysis.json";
    let analysis_json = serde_json::to_string_pretty(&report.analysis).unwrap();
    fs::write(analysis_path, &analysis_json).expect("Failed to write analysis");

    println!("Generated: {}", output_path);
    println!("Generated: {}", analysis_path);
    println!();
    println!("Disconnect Summary:");
    println!("  Critical: {}", report.critical_count);
    println!("  High: {}", report.high_count);
    println!("  Medium: {}", report.medium_count);
    println!("  Low: {}", report.low_count);
}

fn export_diagram(input: &str, format: ExportFormat, output: Option<&str>) {
    let content = fs::read_to_string(input).expect("Failed to read input file");
    let diagram: rust_diagrams::engine::Diagram =
        serde_json::from_str(&content).expect("Failed to parse JSON");

    let svg_exporter = SvgExporter::new();

    match format {
        ExportFormat::Svg => {
            let svg = svg_exporter.export(&diagram, &SvgExportOptions::default());
            let output_path = output.unwrap_or("output.svg");
            fs::write(output_path, &svg).expect("Failed to write SVG");
            println!("Exported: {}", output_path);
        }
        ExportFormat::Html => {
            let svg = svg_exporter.export(&diagram, &SvgExportOptions::default());
            let html = HtmlExporter::export(&diagram, &svg);
            let output_path = output.unwrap_or("output.html");
            fs::write(output_path, &html).expect("Failed to write HTML");
            println!("Exported: {}", output_path);
        }
        ExportFormat::Json => {
            let json = JsonExporter::export(&diagram);
            let output_path = output.unwrap_or("output.json");
            fs::write(output_path, &json).expect("Failed to write JSON");
            println!("Exported: {}", output_path);
        }
    }
}
