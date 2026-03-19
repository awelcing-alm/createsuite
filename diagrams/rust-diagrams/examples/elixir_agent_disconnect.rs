use rust_diagrams::disconnect::DisconnectDiagramGenerator;
use rust_diagrams::export::{HtmlExporter, SvgExportOptions, SvgExporter};
use std::fs;

fn main() {
    println!("Generating Elixir BE ↔ Agent-UI Disconnect Diagrams...\n");

    let generator = DisconnectDiagramGenerator::new();
    let report = generator.generate_full_disconnect_report();

    println!("Disconnect Analysis Summary");
    println!("============================");
    println!("{}", report.summary);
    println!();
    println!("Issues Found:");
    println!("  Critical: {}", report.critical_count);
    println!("  High: {}", report.high_count);
    println!("  Medium: {}", report.medium_count);
    println!("  Low: {}", report.low_count);
    println!();

    let svg_exporter = SvgExporter::new();
    let arch_svg = svg_exporter.export(&report.diagrams.architecture, &SvgExportOptions::default());
    fs::write("outputs/elixir-agent-disconnect.svg", &arch_svg)
        .expect("Failed to write architecture SVG");
    println!("Generated: outputs/elixir-agent-disconnect.svg");

    let seq_svg = report.diagrams.sequence.render_svg();
    fs::write("outputs/protocol-mismatch.svg", &seq_svg).expect("Failed to write sequence SVG");
    println!("Generated: outputs/protocol-mismatch.svg");

    let state_svg = svg_exporter.export(&report.diagrams.state_sync, &SvgExportOptions::default());
    fs::write("outputs/state-sync-issue.svg", &state_svg).expect("Failed to write state sync SVG");
    println!("Generated: outputs/state-sync-issue.svg");

    let html = HtmlExporter::export(&report.diagrams.architecture, &arch_svg);
    fs::write("outputs/elixir-agent-disconnect.html", &html).expect("Failed to write HTML report");
    println!("Generated: outputs/elixir-agent-disconnect.html");

    let analysis_json =
        serde_json::to_string_pretty(&report.analysis).expect("Failed to serialize analysis");
    fs::write("outputs/disconnect-analysis.json", &analysis_json)
        .expect("Failed to write analysis JSON");
    println!("Generated: outputs/disconnect-analysis.json");

    println!("\nDetailed Issues:");
    println!("================");
    for issue in &report.analysis.issues {
        println!("\n[{}] {} - {:?}", issue.id, issue.title, issue.severity);
        println!("  {}", issue.description);
        println!(
            "  Location: {} / {:?}",
            issue.location.component, issue.location.connection
        );
        println!("  Recommendation: {}", issue.recommendation);
    }

    println!("\n\nAll diagrams generated successfully!");
}
