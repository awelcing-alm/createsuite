use crate::engine::{Diagram, DiagramKind};
use crate::shapes::{ShapeRenderOptions, SvgRenderer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SvgExportOptions {
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub include_metadata: bool,
    pub minify: bool,
    pub precision: usize,
}

impl Default for SvgExportOptions {
    fn default() -> Self {
        Self {
            width: None,
            height: None,
            include_metadata: true,
            minify: false,
            precision: 2,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PngExportOptions {
    pub scale: f64,
    pub background: Option<String>,
}

impl Default for PngExportOptions {
    fn default() -> Self {
        Self {
            scale: 2.0,
            background: None,
        }
    }
}

pub struct SvgExporter {
    renderer: SvgRenderer,
}

impl SvgExporter {
    pub fn new() -> Self {
        Self {
            renderer: SvgRenderer::new(),
        }
    }

    fn fmt(&self, n: f64) -> String {
        format!("{:.2}", n)
    }

    pub fn export(&self, diagram: &Diagram, options: &SvgExportOptions) -> String {
        let bounds = diagram.bounds();
        let width = options.width.unwrap_or(bounds.width);
        let height = options.height.unwrap_or(bounds.height);

        let mut svg = String::new();

        let wh_attr = if let (Some(w), Some(h)) = (options.width, options.height) {
            format!(r##"width="{}" height="{}""##, w, h)
        } else {
            String::new()
        };

        svg.push_str(&format!(
            r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {} {}" {} class="diagram-{}" data-diagram-id="{}">"##,
            self.fmt(width),
            self.fmt(height),
            wh_attr,
            match diagram.kind {
                DiagramKind::Architecture => "architecture",
                DiagramKind::Sequence => "sequence",
                DiagramKind::Flowchart => "flowchart",
                DiagramKind::Component => "component",
                DiagramKind::DataFlow => "dataflow",
                DiagramKind::Network => "network",
            },
            diagram.id
        ));

        svg.push_str(
            r##"
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#8b949e"/>
    </marker>
    <marker id="diamond" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <polygon points="0 5, 5 0, 10 5, 5 10" fill="none" stroke="#8b949e"/>
    </marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#21262d" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
"##,
        );

        if diagram.style.show_grid {
            svg.push_str(
                r##"  <rect width="100%" height="100%" fill="url(#smallGrid)"/>
"##,
            );
        }

        svg.push_str(&format!(
            r##"  <rect x="0" y="0" width="{}" height="{}" fill="{}"/>
"##,
            self.fmt(width),
            self.fmt(height),
            diagram.style.preset.background
        ));

        if !diagram.title.is_empty() {
            svg.push_str(&format!(
                r##"  <text x="20" y="30" fill="#c9d1d9" font-family="system-ui" font-size="18" font-weight="bold">{}</text>
"##,
                diagram.title
            ));
        }

        for group in &diagram.groups {
            if let Some(gb) = &group.bounds {
                svg.push_str(&format!(
                    r##"  <rect x="{}" y="{}" width="{}" height="{}" rx="{}" ry="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="0.3"/>
"##,
                    self.fmt(gb.x),
                    self.fmt(gb.y),
                    self.fmt(gb.width),
                    self.fmt(gb.height),
                    self.fmt(group.style.corner_radius),
                    self.fmt(group.style.corner_radius),
                    group.style.fill_color,
                    group.style.stroke_color,
                    self.fmt(group.style.stroke_width)
                ));
                svg.push_str(&format!(
                    r##"  <text x="{}" y="{}" fill="{}" font-family="system-ui" font-size="12" font-weight="bold">{}</text>
"##,
                    self.fmt(gb.x + 10.0),
                    self.fmt(gb.y + 20.0),
                    group.style.stroke_color,
                    group.name
                ));
            }
        }

        let render_options = ShapeRenderOptions::default();
        for node in diagram.nodes.values() {
            svg.push_str(&format!(
                "  <g class=\"node\" data-node-id=\"{}\">\n",
                node.id
            ));
            svg.push_str(&self.renderer.render_node(node, &render_options));
            svg.push_str("  </g>\n");
        }

        let node_bounds: HashMap<_, _> = diagram
            .nodes
            .iter()
            .map(|(id, n)| (id.clone(), n.bounds.clone()))
            .collect();

        for edge in diagram.edges.values() {
            if let (Some(src), Some(tgt)) = (
                node_bounds.get(&edge.source_id),
                node_bounds.get(&edge.target_id),
            ) {
                svg.push_str(&format!(
                    "  <g class=\"edge\" data-edge-id=\"{}\">\n",
                    edge.id
                ));
                svg.push_str(&self.renderer.render_edge(edge, src, tgt, &render_options));
                svg.push_str("  </g>\n");
            }
        }

        if diagram.style.show_legend && !diagram.metadata.is_empty() {
            svg.push_str("  <g class=\"legend\" transform=\"translate(20, ");
            svg.push_str(&self.fmt(height - 100.0));
            svg.push_str(")\">\n");
            svg.push_str("    <rect x=\"-10\" y=\"-20\" width=\"150\" height=\"80\" rx=\"4\" fill=\"#0d1117\" stroke=\"#21262d\"/>\n");

            let mut ly = -5.0;
            for (key, value) in diagram.metadata.iter().take(4) {
                svg.push_str(&format!(
                    "    <text x=\"0\" y=\"{}\" fill=\"#8b949e\" font-family=\"system-ui\" font-size=\"10\">{}: {}</text>\n",
                    ly, key, value
                ));
                ly += 15.0;
            }
            svg.push_str("  </g>\n");
        }

        if options.include_metadata {
            svg.push_str(&format!(
                "  <metadata>\n    <diagram title=\"{}\" id=\"{}\" kind=\"{:?}\" created=\"{}\" updated=\"{}\"/>\n  </metadata>\n",
                diagram.title,
                diagram.id,
                diagram.kind,
                diagram.created_at.to_rfc3339(),
                diagram.updated_at.to_rfc3339()
            ));
        }

        svg.push_str("</svg>");

        if options.minify {
            svg = svg
                .lines()
                .map(|l| l.trim())
                .filter(|l| !l.is_empty())
                .collect::<Vec<_>>()
                .join("");
        }

        svg
    }
}

impl Default for SvgExporter {
    fn default() -> Self {
        Self::new()
    }
}

pub struct JsonExporter;

impl JsonExporter {
    pub fn export(diagram: &Diagram) -> String {
        serde_json::to_string_pretty(diagram).unwrap_or_default()
    }
}

pub struct PngExporter;

impl PngExporter {
    pub fn export(_svg: &str, _options: &PngExportOptions) -> Result<Vec<u8>, String> {
        Err("PNG export requires the 'image' feature. Use SVG export instead.".to_string())
    }
}

pub struct HtmlExporter;

impl HtmlExporter {
    pub fn export(diagram: &Diagram, svg_content: &str) -> String {
        let bg = "#0d1117";
        format!(
            r##"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      background: {};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }}
    .diagram-container {{
      max-width: 100%;
      overflow: auto;
    }}
    .diagram-container svg {{
      display: block;
      max-width: 100%;
      height: auto;
    }}
  </style>
</head>
<body>
  <div class="diagram-container">
    {}
  </div>
  <script>
    document.querySelectorAll('.node').forEach(node => {{
      node.style.cursor = 'pointer';
      node.addEventListener('click', () => {{
        console.log('Node clicked:', node.dataset.nodeId);
      }});
    }});
  </script>
</body>
</html>"##,
            diagram.title, bg, svg_content
        )
    }
}
