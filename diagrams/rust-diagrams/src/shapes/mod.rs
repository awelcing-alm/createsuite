use crate::engine::{ArrowHead, Bounds, Edge, LineStyle, Node, NodeShape, Point};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShapeRenderOptions {
    pub show_labels: bool,
    pub show_icons: bool,
    pub font_size: f64,
    pub label_color: String,
}

impl Default for ShapeRenderOptions {
    fn default() -> Self {
        Self {
            show_labels: true,
            show_icons: true,
            font_size: 14.0,
            label_color: "#c9d1d9".to_string(),
        }
    }
}

pub struct SvgRenderer {
    precision: usize,
}

impl SvgRenderer {
    pub fn new() -> Self {
        Self { precision: 2 }
    }

    fn fmt(&self, n: f64) -> String {
        format!("{:.prec$}", n, prec = self.precision)
    }

    fn pt(&self, p: &Point) -> String {
        format!("{},{}", self.fmt(p.x), self.fmt(p.y))
    }

    pub fn render_node(&self, node: &Node, options: &ShapeRenderOptions) -> String {
        let style = &node.style;
        let bounds = &node.bounds;

        let shape = match style.shape {
            NodeShape::Rectangle => self.rect(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
                0.0,
            ),
            NodeShape::RoundedRect => self.rect(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
                style.corner_radius,
            ),
            NodeShape::Circle => self.ellipse(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Diamond => self.diamond(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Parallelogram => self.parallelogram(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Hexagon => self.hexagon(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Cylinder => self.cylinder(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Person => self.person(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Document => self.document(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Database => self.cylinder(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Queue => self.queue(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Cloud => self.ellipse(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
            NodeShape::Arrow => self.arrow_shape(
                bounds,
                &style.fill_color,
                &style.stroke_color,
                style.stroke_width,
                style.opacity,
            ),
        };

        let mut result = shape;

        if options.show_labels && !node.label.is_empty() {
            let cx = bounds.x + bounds.width / 2.0;
            let cy = bounds.y + bounds.height / 2.0;
            result.push_str(&format!(
                r##"<text x="{}" y="{}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="{}" fill="{}">{}</text>"##,
                cx, cy, options.font_size, options.label_color, escape_xml(&node.label)
            ));
        }

        if let Some(desc) = &node.description {
            if options.show_labels {
                let y = bounds.y + bounds.height + options.font_size + 4.0;
                result.push_str(&format!(
                    r##"<text x="{}" y="{}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="{}" fill="#8b949e">{}</text>"##,
                    bounds.x + bounds.width / 2.0,
                    y,
                    options.font_size * 0.85,
                    escape_xml(desc)
                ));
            }
        }

        result
    }

    fn rect(
        &self,
        b: &Bounds,
        fill: &str,
        stroke: &str,
        sw: f64,
        opacity: f64,
        radius: f64,
    ) -> String {
        if radius > 0.0 {
            format!(
                r##"<rect x="{}" y="{}" width="{}" height="{}" rx="{}" ry="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
                self.fmt(b.x),
                self.fmt(b.y),
                self.fmt(b.width),
                self.fmt(b.height),
                self.fmt(radius),
                self.fmt(radius),
                fill,
                stroke,
                self.fmt(sw),
                self.fmt(opacity)
            )
        } else {
            format!(
                r##"<rect x="{}" y="{}" width="{}" height="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
                self.fmt(b.x),
                self.fmt(b.y),
                self.fmt(b.width),
                self.fmt(b.height),
                fill,
                stroke,
                self.fmt(sw),
                self.fmt(opacity)
            )
        }
    }

    fn ellipse(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let cx = b.x + b.width / 2.0;
        let cy = b.y + b.height / 2.0;
        format!(
            r##"<ellipse cx="{}" cy="{}" rx="{}" ry="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            self.fmt(cx),
            self.fmt(cy),
            self.fmt(b.width / 2.0),
            self.fmt(b.height / 2.0),
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        )
    }

    fn diamond(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let cx = b.x + b.width / 2.0;
        let cy = b.y + b.height / 2.0;
        let pts = format!(
            "{},{} {},{} {},{} {},{}",
            cx,
            b.y,
            b.x + b.width,
            cy,
            cx,
            b.y + b.height,
            b.x,
            cy
        );
        format!(
            r##"<polygon points="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            pts,
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        )
    }

    fn parallelogram(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let offset = b.width * 0.15;
        let pts = format!(
            "{},{} {},{} {},{} {},{}",
            b.x + offset,
            b.y,
            b.x + b.width,
            b.y,
            b.x + b.width - offset,
            b.y + b.height,
            b.x,
            b.y + b.height
        );
        format!(
            r##"<polygon points="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            pts,
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        )
    }

    fn hexagon(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let cx = b.x + b.width / 2.0;
        let cy = b.y + b.height / 2.0;
        let w = b.width / 2.0;
        let _h = b.height / 2.0;
        let pts = format!(
            "{},{} {},{} {},{} {},{} {},{} {},{}",
            cx - w * 0.5,
            b.y,
            cx + w * 0.5,
            b.y,
            cx + w,
            cy,
            cx + w * 0.5,
            b.y + b.height,
            cx - w * 0.5,
            b.y + b.height,
            cx - w,
            cy
        );
        format!(
            r##"<polygon points="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            pts,
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        )
    }

    fn cylinder(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let eh = b.height * 0.15;
        let top_y = b.y + eh / 2.0;
        let bottom_y = b.y + b.height - eh / 2.0;
        let body = format!(
            r##"<path d="M{} {} L{} {} A{} {} {} {} {} {} L{} Z" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            self.fmt(b.x),
            self.fmt(top_y),
            self.fmt(b.x),
            self.fmt(bottom_y),
            self.fmt(b.width / 2.0),
            self.fmt(eh / 2.0),
            0,
            1,
            0,
            self.fmt(b.x),
            self.fmt(bottom_y),
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        );
        let top = format!(
            r##"<ellipse cx="{}" cy="{}" rx="{}" ry="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            self.fmt(b.x + b.width / 2.0),
            self.fmt(top_y),
            self.fmt(b.width / 2.0),
            self.fmt(eh / 2.0),
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        );
        format!("{}{}", body, top)
    }

    fn person(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let hr = b.height * 0.2;
        let hcx = b.x + b.width / 2.0;
        let hcy = b.y + hr;
        let body_top = b.y + hr * 2.5;

        let head = format!(
            r##"<circle cx="{}" cy="{}" r="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            self.fmt(hcx),
            self.fmt(hcy),
            self.fmt(hr),
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        );
        let body = format!(
            r##"<path d="M{} {} Q{} {} {} {} Q{} {} {} {}" fill="none" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            self.fmt(b.x),
            self.fmt(body_top),
            self.fmt(hcx),
            self.fmt(body_top - b.height * 0.1),
            self.fmt(b.x + b.width),
            self.fmt(body_top),
            self.fmt(hcx),
            self.fmt(body_top - b.height * 0.1),
            self.fmt(b.x),
            self.fmt(body_top),
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        );
        format!("{}{}", head, body)
    }

    fn document(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let fold = b.width * 0.15;
        let pts = format!(
            "{},{} {},{} {},{} {},{} {},{}",
            b.x,
            b.y,
            b.x + b.width - fold,
            b.y,
            b.x + b.width,
            b.y + fold,
            b.x + b.width,
            b.y + b.height,
            b.x,
            b.y + b.height
        );
        format!(
            r##"<polygon points="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            pts,
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        )
    }

    fn queue(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let item_h = b.height / 3.0;
        let mut result = String::new();
        for i in 0..3 {
            let y = b.y + i as f64 * item_h;
            result.push_str(&self.rect(
                &Bounds::new(b.x, y, b.width, item_h - 2.0),
                fill,
                stroke,
                sw,
                opacity,
                4.0,
            ));
        }
        result
    }

    fn arrow_shape(&self, b: &Bounds, fill: &str, stroke: &str, sw: f64, opacity: f64) -> String {
        let cx = b.x + b.width / 2.0;
        let cy = b.y + b.height / 2.0;
        let pts = format!("{},{} {},{} {},{}", b.x, cy, cx, b.y, cx, b.y + b.height);
        format!(
            r##"<polygon points="{}" fill="{}" stroke="{}" stroke-width="{}" opacity="{}"/>"##,
            pts,
            fill,
            stroke,
            self.fmt(sw),
            self.fmt(opacity)
        )
    }

    pub fn render_edge(
        &self,
        edge: &Edge,
        source: &Bounds,
        target: &Bounds,
        _options: &ShapeRenderOptions,
    ) -> String {
        let style = &edge.style;
        let start = self.connection_point(source, target, true);
        let end = self.connection_point(target, source, false);

        let path = if edge.waypoints.is_empty() {
            format!("M{} {}", self.pt(&start), self.pt(&end))
        } else {
            let mut d = format!("M{}", self.pt(&start));
            for wp in &edge.waypoints {
                d.push_str(&format!(" L{}", self.pt(wp)));
            }
            d.push_str(&format!(" L{}", self.pt(&end)));
            d
        };

        let dash = match style.line_style {
            LineStyle::Dashed => "8,4",
            LineStyle::Dotted => "2,4",
            _ => "",
        };

        let mut result = if dash.is_empty() {
            format!(
                r##"<path d="{}" fill="none" stroke="{}" stroke-width="{}"/>"##,
                path,
                style.stroke_color,
                self.fmt(style.stroke_width)
            )
        } else {
            format!(
                r##"<path d="{}" fill="none" stroke="{}" stroke-width="{}" stroke-dasharray="{}"/>"##,
                path,
                style.stroke_color,
                self.fmt(style.stroke_width),
                dash
            )
        };

        if style.end_arrow != ArrowHead::None {
            result.push_str(&self.arrow_head(
                &end,
                &start,
                &style.end_arrow,
                &style.stroke_color,
                style.stroke_width,
            ));
        }

        if let Some(label_text) = &edge.label {
            let mid = if edge.waypoints.is_empty() {
                start.midpoint(&end)
            } else {
                edge.waypoints[edge.waypoints.len() / 2].clone()
            };
            result.push_str(&format!(
                r##"<rect x="{}" y="{}" width="80" height="20" rx="4" fill="#0d1117" stroke="#21262d"/>"##,
                self.fmt(mid.x - 40.0), self.fmt(mid.y - 10.0)
            ));
            result.push_str(&format!(
                r##"<text x="{}" y="{}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="11" fill="#c9d1d9">{}</text>"##,
                self.fmt(mid.x), self.fmt(mid.y), escape_xml(label_text)
            ));
        }

        result
    }

    fn connection_point(&self, from: &Bounds, to: &Bounds, is_source: bool) -> Point {
        let fc = from.x + from.width / 2.0;
        let fc_y = from.y + from.height / 2.0;
        let tc = to.x + to.width / 2.0;
        let tc_y = to.y + to.height / 2.0;

        let angle = (tc_y - fc_y).atan2(tc - fc);

        if angle.abs() < std::f64::consts::FRAC_PI_4 {
            if is_source {
                Point::new(from.x + from.width, fc_y)
            } else {
                Point::new(from.x, fc_y)
            }
        } else if angle.abs() > std::f64::consts::FRAC_PI_4 * 3.0 {
            if is_source {
                Point::new(from.x, fc_y)
            } else {
                Point::new(from.x + from.width, fc_y)
            }
        } else if tc_y > fc_y {
            if is_source {
                Point::new(fc, from.y + from.height)
            } else {
                Point::new(fc, from.y)
            }
        } else {
            if is_source {
                Point::new(fc, from.y)
            } else {
                Point::new(fc, from.y + from.height)
            }
        }
    }

    fn arrow_head(
        &self,
        tip: &Point,
        from: &Point,
        arrow: &ArrowHead,
        color: &str,
        sw: f64,
    ) -> String {
        let angle = (from.y - tip.y).atan2(from.x - tip.x);
        let size = 10.0;

        match arrow {
            ArrowHead::Triangle | ArrowHead::TriangleFilled => {
                let p1 = Point::new(
                    tip.x - size * angle.cos() + size * 0.5 * angle.sin(),
                    tip.y - size * angle.sin() - size * 0.5 * angle.cos(),
                );
                let p2 = Point::new(
                    tip.x - size * angle.cos() - size * 0.5 * angle.sin(),
                    tip.y - size * angle.sin() + size * 0.5 * angle.cos(),
                );
                let fill = if matches!(arrow, ArrowHead::TriangleFilled) {
                    color
                } else {
                    "none"
                };
                format!(
                    r##"<polygon points="{} {} {}" fill="{}" stroke="{}" stroke-width="{}"/>"##,
                    self.pt(tip),
                    self.pt(&p1),
                    self.pt(&p2),
                    fill,
                    color,
                    self.fmt(sw)
                )
            }
            ArrowHead::Circle => {
                format!(
                    r##"<circle cx="{}" cy="{}" r="{}" fill="none" stroke="{}" stroke-width="{}"/>"##,
                    self.pt(tip),
                    self.fmt(size * 0.4),
                    color,
                    color,
                    self.fmt(sw)
                )
            }
            ArrowHead::Diamond | ArrowHead::DiamondFilled => {
                let p1 = Point::new(
                    tip.x - size * 0.5 * angle.cos(),
                    tip.y - size * 0.5 * angle.sin(),
                );
                let p2 = Point::new(
                    tip.x - size * 0.5 * angle.cos() + size * 0.3 * angle.sin(),
                    tip.y - size * 0.5 * angle.sin() - size * 0.3 * angle.cos(),
                );
                let p3 = Point::new(tip.x - size * angle.cos(), tip.y - size * angle.sin());
                let p4 = Point::new(
                    tip.x - size * 0.5 * angle.cos() - size * 0.3 * angle.sin(),
                    tip.y - size * 0.5 * angle.sin() + size * 0.3 * angle.cos(),
                );
                let fill = if matches!(arrow, ArrowHead::DiamondFilled) {
                    color
                } else {
                    "none"
                };
                format!(
                    r##"<polygon points="{} {} {} {} {}" fill="{}" stroke="{}" stroke-width="{}"/>"##,
                    self.pt(tip),
                    self.pt(&p1),
                    self.pt(&p2),
                    self.pt(&p3),
                    self.pt(&p4),
                    fill,
                    color,
                    self.fmt(sw)
                )
            }
            ArrowHead::None => String::new(),
        }
    }
}

impl Default for SvgRenderer {
    fn default() -> Self {
        Self::new()
    }
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

pub fn sanitize_id(s: &str) -> String {
    s.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '_' || c == '-' {
                c
            } else {
                '_'
            }
        })
        .collect()
}
