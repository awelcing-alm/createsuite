import type { Diagram, Node, Edge, NodeStyle, Bounds, SequenceDiagram, SequenceActor, SequenceMessage, ActorType, MessageType, ComponentType, SystemComponent } from './index';

export { ActorType, MessageType, ComponentType };

export class PureJsDiagramRenderer {
  renderSvg(diagram: Diagram): string {
    const bounds = this.calculateBounds(diagram);
    const width = bounds.width;
    const height = bounds.height;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="diagram-${diagram.kind.toLowerCase()}">`;

    svg += `  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#8b949e"/>
    </marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>`;

    svg += `<rect width="100%" height="100%" fill="${diagram.style.preset.background}"/>`;

    for (const group of diagram.groups || []) {
      if (group.bounds) {
        svg += `<rect x="${group.bounds.x}" y="${group.bounds.y}" width="${group.bounds.width}" height="${group.bounds.height}" rx="${group.style.corner_radius}" fill="${group.style.fill_color}" stroke="${group.style.stroke_color}" stroke-width="${group.style.stroke_width}" opacity="0.3"/>`;
        svg += `<text x="${group.bounds.x + 10}" y="${group.bounds.y + 20}" fill="${group.style.stroke_color}" font-family="system-ui" font-size="12" font-weight="bold">${this.escapeXml(group.name)}</text>`;
      }
    }

    for (const node of Object.values(diagram.nodes)) {
      svg += this.renderNode(node);
    }

    for (const edge of Object.values(diagram.edges)) {
      const sourceNode = diagram.nodes[edge.source_id];
      const targetNode = diagram.nodes[edge.target_id];
      if (sourceNode && targetNode) {
        svg += this.renderEdge(edge, sourceNode, targetNode);
      }
    }

    svg += '</svg>';
    return svg;
  }

  private calculateBounds(diagram: Diagram): { width: number; height: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const node of Object.values(diagram.nodes)) {
      minX = Math.min(minX, node.bounds.x);
      minY = Math.min(minY, node.bounds.y);
      maxX = Math.max(maxX, node.bounds.x + node.bounds.width);
      maxY = Math.max(maxY, node.bounds.y + node.bounds.height);
    }

    const padding = diagram.style.padding || 40;
    return {
      width: (maxX === -Infinity ? 800 : maxX - minX) + padding * 2,
      height: (maxY === -Infinity ? 600 : maxY - minY) + padding * 2,
    };
  }

  private renderNode(node: Node): string {
    const { bounds, style, label, description } = node;
    let shape = '';

    switch (style.shape) {
      case 'Rectangle':
        shape = `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
        break;
      case 'RoundedRect':
        shape = `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" rx="${style.corner_radius}" ry="${style.corner_radius}" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
        break;
      case 'Circle':
        const rx = bounds.width / 2;
        const ry = bounds.height / 2;
        shape = `<ellipse cx="${bounds.x + rx}" cy="${bounds.y + ry}" rx="${rx}" ry="${ry}" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
        break;
      case 'Diamond':
        const cx = bounds.x + bounds.width / 2;
        const cy = bounds.y + bounds.height / 2;
        shape = `<polygon points="${cx},${bounds.y} ${bounds.x + bounds.width},${cy} ${cx},${bounds.y + bounds.height} ${bounds.x},${cy}" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
        break;
      case 'Cylinder':
        const ellipseH = bounds.height * 0.15;
        shape = `<path d="M${bounds.x} ${bounds.y + ellipseH / 2} L${bounds.x} ${bounds.y + bounds.height - ellipseH / 2} A${bounds.width / 2} ${ellipseH / 2} 0 0 0 ${bounds.x + bounds.width} ${bounds.y + bounds.height - ellipseH / 2} L${bounds.x + bounds.width} ${bounds.y + ellipseH / 2} A${bounds.width / 2} ${ellipseH / 2} 0 0 0 ${bounds.x} ${bounds.y + ellipseH / 2} Z" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
        shape += `<ellipse cx="${bounds.x + bounds.width / 2}" cy="${bounds.y + ellipseH / 2}" rx="${bounds.width / 2}" ry="${ellipseH / 2}" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
        break;
      default:
        shape = `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="${style.fill_color}" stroke="${style.stroke_color}" stroke-width="${style.stroke_width}" opacity="${style.opacity}"/>`;
    }

    const labelX = bounds.x + bounds.width / 2;
    const labelY = bounds.y + bounds.height / 2;
    let text = `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="14" fill="#c9d1d9">${this.escapeXml(label)}</text>`;

    let descText = '';
    if (description) {
      descText = `<text x="${labelX}" y="${bounds.y + bounds.height + 16}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#8b949e">${this.escapeXml(description)}</text>`;
    }

    return `<g class="node" data-node-id="${node.id}">${shape}${text}${descText}</g>`;
  }

  private renderEdge(edge: Edge, source: Node, target: Node): string {
    const start = this.getConnectionPoint(source.bounds, target.bounds, true);
    const end = this.getConnectionPoint(target.bounds, source.bounds, false);

    let path = `M${start.x},${start.y} L${end.x},${end.y}`;

    for (const wp of edge.waypoints) {
      path += ` L${wp.x},${wp.y}`;
    }

    const dashArr = edge.style.line_style === 'Dashed' ? '8,4' : edge.style.line_style === 'Dotted' ? '2,4' : '';

    let svg = `<path d="${path}" fill="none" stroke="${edge.style.stroke_color}" stroke-width="${edge.style.stroke_width}"${dashArr ? ` stroke-dasharray="${dashArr}"` : ''}/>`;

    if (edge.style.end_arrow !== 'None') {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const size = 10;
      const p1x = end.x - size * Math.cos(angle) + size * 0.5 * Math.sin(angle);
      const p1y = end.y - size * Math.sin(angle) - size * 0.5 * Math.cos(angle);
      const p2x = end.x - size * Math.cos(angle) - size * 0.5 * Math.sin(angle);
      const p2y = end.y - size * Math.sin(angle) + size * 0.5 * Math.cos(angle);
      svg += `<polygon points="${end.x},${end.y} ${p1x},${p1y} ${p2x},${p2y}" fill="${edge.style.stroke_color}"/>`;
    }

    if (edge.label) {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      svg += `<rect x="${midX - 40}" y="${midY - 10}" width="80" height="20" rx="4" fill="#0d1117" stroke="#21262d"/>`;
      svg += `<text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="11" fill="#c9d1d9">${this.escapeXml(edge.label)}</text>`;
    }

    return `<g class="edge" data-edge-id="${edge.id}">${svg}</g>`;
  }

  private getConnectionPoint(from: Bounds, to: Bounds, isSource: boolean): { x: number; y: number } {
    const fromCx = from.x + from.width / 2;
    const fromCy = from.y + from.height / 2;
    const toCx = to.x + to.width / 2;
    const toCy = to.y + to.height / 2;

    const dx = toCx - fromCx;
    const angle = Math.atan2(toCy - fromCy, dx);

    if (Math.abs(angle) < Math.PI / 4) {
      return isSource ? { x: from.x + from.width, y: fromCy } : { x: from.x, y: fromCy };
    } else if (Math.abs(angle) > Math.PI * 3 / 4) {
      return isSource ? { x: from.x, y: fromCy } : { x: from.x + from.width, y: fromCy };
    } else if (toCy > fromCy) {
      return isSource ? { x: fromCx, y: from.y + from.height } : { x: fromCx, y: from.y };
    } else {
      return isSource ? { x: fromCx, y: from.y } : { x: fromCx, y: from.y + from.height };
    }
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  renderHtml(diagram: Diagram): string {
    const svg = this.renderSvg(diagram);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${diagram.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${diagram.style.preset.background}; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .diagram-container { max-width: 100%; overflow: auto; }
    .diagram-container svg { display: block; max-width: 100%; height: auto; }
    .node { cursor: pointer; }
    .node:hover { filter: url(#shadow); }
  </style>
</head>
<body>
  <div class="diagram-container">${svg}</div>
</body>
</html>`;
  }
}

export function createArchitectureDiagram(title: string): ArchitectureBuilder {
  return new ArchitectureBuilder(title);
}

export class ArchitectureBuilder {
  private title: string;
  private components: SystemComponent[] = [];
  private connections: Array<[string, string, string]> = [];

  constructor(title: string) {
    this.title = title;
  }

  addService(id: string, name: string, description?: string): this {
    this.components.push({ id, name, component_type: 'Service', description, ports: [] });
    return this;
  }

  addDatabase(id: string, name: string, description?: string): this {
    this.components.push({ id, name, component_type: 'Database', description, ports: [] });
    return this;
  }

  addClient(id: string, name: string, description?: string): this {
    this.components.push({ id, name, component_type: 'Client', description, ports: [] });
    return this;
  }

  addQueue(id: string, name: string, description?: string): this {
    this.components.push({ id, name, component_type: 'Queue', description, ports: [] });
    return this;
  }

  addGateway(id: string, name: string, description?: string): this {
    this.components.push({ id, name, component_type: 'Gateway', description, ports: [] });
    return this;
  }

  addConnection(sourceId: string, targetId: string, protocol: string): this {
    this.connections.push([sourceId, targetId, protocol]);
    return this;
  }

  build(): Diagram {
    const nodeSpacing = 180;
    const startX = 100;
    const startY = 100;

    const nodes: Record<string, Node> = {};
    const cols = Math.ceil(Math.sqrt(this.components.length));
    const nodeWidth = 180;
    const nodeHeight = 80;

    this.components.forEach((comp, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (nodeWidth + nodeSpacing);
      const y = startY + row * (nodeHeight + nodeSpacing);

      const style = this.getStyleForType(comp.component_type);
      nodes[comp.id] = {
        id: comp.id,
        label: comp.name,
        description: comp.description,
        bounds: { x, y, width: nodeWidth, height: nodeHeight },
        style,
        metadata: {},
        ports: [],
      };
    });

    const edges: Record<string, Edge> = {};
    this.connections.forEach(([source, target, protocol], i) => {
      edges[`conn-${i}`] = {
        id: `conn-${i}`,
        source_id: source,
        target_id: target,
        label: protocol,
        waypoints: [],
        style: {
          stroke_color: '#8b949e',
          stroke_width: 2,
          line_style: 'Solid',
          start_arrow: 'None',
          end_arrow: 'Triangle',
          label_position: 0.5,
        },
        metadata: {},
      };
    });

    return {
      id: `arch-${Date.now()}`,
      title: this.title,
      kind: 'Architecture',
      style: {
        preset: { name: 'tech-dark', background: '#0d1117', grid_color: '#21262d', font_family: 'JetBrains Mono' },
        show_grid: true,
        show_legend: true,
        padding: 50,
        node_spacing: nodeSpacing,
      },
      nodes,
      edges,
      groups: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private getStyleForType(type: ComponentType): NodeStyle {
    const styles: Record<ComponentType, NodeStyle> = {
      Service: { shape: 'RoundedRect', fill_color: '#238636', stroke_color: '#2ea043', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Database: { shape: 'Cylinder', fill_color: '#9e6a03', stroke_color: '#d29922', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Queue: { shape: 'Cylinder', fill_color: '#8957e5', stroke_color: '#a371f7', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Client: { shape: 'RoundedRect', fill_color: '#1f6feb', stroke_color: '#58a6ff', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Gateway: { shape: 'Hexagon', fill_color: '#0066cc', stroke_color: '#388bfd', stroke_width: 2, corner_radius: 8, opacity: 1 },
      External: { shape: 'Cloud', fill_color: '#6e7681', stroke_color: '#8b949e', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Cache: { shape: 'Cylinder', fill_color: '#da3633', stroke_color: '#f85149', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Storage: { shape: 'Document', fill_color: '#8b949e', stroke_color: '#c9d1d9', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Compute: { shape: 'Rectangle', fill_color: '#bf4b8a', stroke_color: '#db61a2', stroke_width: 2, corner_radius: 8, opacity: 1 },
      Network: { shape: 'Circle', fill_color: '#00cc66', stroke_color: '#39d353', stroke_width: 2, corner_radius: 8, opacity: 1 },
    };
    return styles[type] || styles.Service;
  }
}

export function createSequenceDiagram(title: string): SequenceBuilder {
  return new SequenceBuilder(title);
}

export class SequenceBuilder {
  private title: string;
  private actors: SequenceActor[] = [];
  private messages: SequenceMessage[] = [];

  constructor(title: string) {
    this.title = title;
  }

  addActor(id: string, name: string, actorType: ActorType = 'Service'): this {
    this.actors.push({ id, name, actor_type: actorType });
    return this;
  }

  addMessage(from: string, to: string, label: string, type: MessageType = 'Sync'): this {
    this.messages.push({
      id: `msg-${this.messages.length}`,
      from,
      to,
      label,
      message_type: type,
      step: this.messages.length + 1,
    });
    return this;
  }

  build(): SequenceDiagram {
    return {
      title: this.title,
      actors: this.actors,
      messages: this.messages,
      style: {
        preset: { name: 'tech-dark', background: '#0d1117', grid_color: '#21262d', font_family: 'JetBrains Mono' },
        show_grid: true,
        show_legend: true,
        padding: 40,
        node_spacing: 120,
      },
    };
  }

  renderSvg(): string {
    const diagram = this.build();
    return this.renderSequenceSvg(diagram);
  }

  private renderSequenceSvg(diagram: SequenceDiagram): string {
    const actorWidth = 100;
    const actorSpacing = 150;
    const headerHeight = 60;
    const lineHeight = 50;
    const lifelineStart = 100;

    const width = actorWidth * diagram.actors.length + actorSpacing * (diagram.actors.length - 1) + 100;
    const height = headerHeight + lineHeight * (diagram.messages.length + 2) + 50;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="100%" height="100%" fill="${diagram.style.preset.background}"/>`;

    const colorMap: Record<ActorType, string> = {
      User: '#58a6ff',
      Agent: '#a371f7',
      Service: '#3fb950',
      System: '#f0883e',
      External: '#8b949e',
    };

    diagram.actors.forEach((actor, i) => {
      const x = lifelineStart + i * (actorWidth + actorSpacing);
      const color = colorMap[actor.actor_type] || '#8b949e';

      svg += `<rect x="${x}" y="10" width="${actorWidth}" height="40" rx="8" fill="${color}" stroke="${color}" stroke-width="2"/>`;
      svg += `<text x="${x + actorWidth / 2}" y="35" text-anchor="middle" fill="white" font-family="system-ui" font-size="12" font-weight="bold">${this.escapeXml(actor.name)}</text>`;

      const lifelineTop = headerHeight;
      const lifelineBottom = height - 50;
      svg += `<line x1="${x + actorWidth / 2}" y1="${lifelineTop}" x2="${x + actorWidth / 2}" y2="${lifelineBottom}" stroke="${color}" stroke-width="2" stroke-dasharray="5,5"/>`;
    });

    diagram.messages.forEach((msg, i) => {
      const y = headerHeight + 40 + i * lineHeight;
      const fromIdx = diagram.actors.findIndex(a => a.id === msg.from);
      const toIdx = diagram.actors.findIndex(a => a.id === msg.to);

      if (fromIdx === -1 || toIdx === -1) return;

      const fromX = lifelineStart + fromIdx * (actorWidth + actorSpacing) + actorWidth / 2;
      const toX = lifelineStart + toIdx * (actorWidth + actorSpacing) + actorWidth / 2;

      const lineColor = msg.message_type === 'Error' ? '#f85149' : msg.message_type === 'Response' ? '#3fb950' : '#c9d1d9';
      const direction = toIdx > fromIdx ? 1 : -1;
      const arrowX = toX - direction * 15;

      svg += `<line x1="${fromX}" y1="${y}" x2="${arrowX}" y2="${y}" stroke="${lineColor}" stroke-width="2"/>`;
      svg += `<polygon points="${arrowX},${y} ${arrowX - direction * 10},${y - 5} ${arrowX - direction * 10},${y + 5}" fill="${lineColor}"/>`;

      const labelX = (fromX + toX) / 2;
      svg += `<rect x="${labelX - 40}" y="${y - 10}" width="80" height="20" rx="4" fill="#0d1117" stroke="#21262d"/>`;
      svg += `<text x="${labelX}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#c9d1d9" font-family="system-ui" font-size="10">${this.escapeXml(msg.label)}</text>`;
    });

    svg += '</svg>';
    return svg;
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
