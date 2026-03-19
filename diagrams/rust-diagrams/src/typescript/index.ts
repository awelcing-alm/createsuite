export interface Diagram {
  id: string;
  title: string;
  description?: string;
  kind: DiagramKind;
  style: DiagramStyle;
  nodes: Record<string, Node>;
  edges: Record<string, Edge>;
  groups: NodeGroup[];
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export type DiagramKind = 'Architecture' | 'Sequence' | 'Flowchart' | 'Component' | 'DataFlow' | 'Network';

export interface DiagramStyle {
  preset: StylePreset;
  show_grid: boolean;
  show_legend: boolean;
  padding: number;
  node_spacing: number;
}

export interface StylePreset {
  name: string;
  background: string;
  grid_color: string;
  font_family: string;
}

export interface Node {
  id: string;
  label: string;
  description?: string;
  bounds: Bounds;
  style: NodeStyle;
  metadata: Record<string, string>;
  ports: Port[];
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeStyle {
  shape: NodeShape;
  fill_color: string;
  stroke_color: string;
  stroke_width: number;
  corner_radius: number;
  opacity: number;
}

export type NodeShape = 'Rectangle' | 'RoundedRect' | 'Circle' | 'Diamond' | 'Parallelogram' | 'Hexagon' | 'Cylinder' | 'Person' | 'Document' | 'Database' | 'Queue' | 'Cloud' | 'Arrow';

export interface Port {
  id: string;
  position: PortPosition;
  direction: PortDirection;
}

export type PortPosition = 'Top' | 'Bottom' | 'Left' | 'Right';
export type PortDirection = 'Input' | 'Output' | 'Bidirectional';

export interface Edge {
  id: string;
  source_id: string;
  target_id: string;
  label?: string;
  waypoints: Point[];
  style: EdgeStyle;
  metadata: Record<string, string>;
}

export interface Point {
  x: number;
  y: number;
}

export interface EdgeStyle {
  stroke_color: string;
  stroke_width: number;
  line_style: LineStyle;
  start_arrow: ArrowHead;
  end_arrow: ArrowHead;
  label_position: number;
  dash_pattern?: number[];
}

export type LineStyle = 'Solid' | 'Dashed' | 'Dotted' | 'Double';
export type ArrowHead = 'None' | 'Triangle' | 'Diamond' | 'Circle' | 'TriangleFilled' | 'DiamondFilled';

export interface NodeGroup {
  id: string;
  name: string;
  node_ids: string[];
  style: GroupStyle;
  bounds?: Bounds;
}

export interface GroupStyle {
  fill_color: string;
  stroke_color: string;
  stroke_width: number;
  corner_radius: number;
  label_position: Point;
}

export interface DisconnectIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  location: IssueLocation;
  recommendation: string;
}

export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface IssueLocation {
  component: string;
  connection?: string;
  protocol?: string;
}

export interface ComponentIssue {
  component_id: string;
  issues: string[];
}

export interface DisconnectAnalysis {
  title: string;
  description: string;
  issues: DisconnectIssue[];
  components: ComponentIssue[];
}

export interface DisconnectReport {
  summary: string;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  diagrams: DisconnectDiagrams;
  analysis: DisconnectAnalysis;
}

export interface DisconnectDiagrams {
  architecture: Diagram;
  sequence: SequenceDiagram;
  state_sync: Diagram;
}

export interface SequenceDiagram {
  title: string;
  actors: SequenceActor[];
  messages: SequenceMessage[];
  style: DiagramStyle;
}

export interface SequenceActor {
  id: string;
  name: string;
  actor_type: ActorType;
}

export type ActorType = 'User' | 'Agent' | 'Service' | 'System' | 'External';

export interface SequenceMessage {
  id: string;
  from: string;
  to: string;
  label: string;
  message_type: MessageType;
  step: number;
}

export type MessageType = 'Sync' | 'Async' | 'Response' | 'Error';

export type ComponentType = 'Service' | 'Database' | 'Queue' | 'Cache' | 'Gateway' | 'Client' | 'External' | 'Storage' | 'Compute' | 'Network';

export interface SystemComponent {
  id: string;
  name: string;
  component_type: ComponentType;
  description?: string;
  tech_stack?: string;
  ports: PortDef[];
}

export interface PortDef {
  name: string;
  protocol: string;
  direction: PortDirection;
}

export interface FlowchartNode {
  id: string;
  label: string;
  node_type: FlowchartNodeType;
}

export type FlowchartNodeType = 'Start' | 'End' | 'Process' | 'Decision' | 'Input' | 'Output';

export interface DataFlowElement {
  id: string;
  name: string;
  flow_type: DataFlowType;
  format?: string;
}

export type DataFlowType = 'HttpRequest' | 'HttpResponse' | 'WebSocket' | 'GraphQL' | 'RPC' | 'Event' | 'Message' | 'File';

export class DiagramRenderer {
  private wasm: any;

  constructor(wasmModule: any) {
    this.wasm = wasmModule;
  }

  static async load(): Promise<DiagramRenderer> {
    const wasm = await import('../pkg/rust_diagrams');
    await wasm.default();
    return new DiagramRenderer(wasm);
  }

  renderSvg(diagramJson: string): string {
    return this.wasm.DiagramRenderer.render_svg(diagramJson);
  }

  renderHtml(diagramJson: string): string {
    return this.wasm.DiagramRenderer.render_html(diagramJson);
  }

  generateDisconnectDiagram(): string {
    return this.wasm.DiagramRenderer.generate_disconnect_diagram();
  }

  generateDisconnectSvg(): string {
    return this.wasm.DiagramRenderer.generate_disconnect_svg();
  }

  generateDisconnectAnalysis(): string {
    return this.wasm.DiagramRenderer.generate_disconnect_analysis();
  }

  generateDisconnectHtml(): string {
    return this.wasm.DiagramRenderer.generate_disconnect_html();
  }
}

export class ArchitectureDiagramBuilder {
  private wasm: any;

  constructor(title: string) {
    this.wasm = new (window as any).DiagramRendererWasm.ArchitectureDiagramBuilder(title);
  }

  addService(id: string, name: string, description: string): this {
    this.wasm = this.wasm.add_service(id, name, description);
    return this;
  }

  addDatabase(id: string, name: string, description: string): this {
    this.wasm = this.wasm.add_database(id, name, description);
    return this;
  }

  addClient(id: string, name: string, description: string): this {
    this.wasm = this.wasm.add_client(id, name, description);
    return this;
  }

  addQueue(id: string, name: string, description: string): this {
    this.wasm = this.wasm.add_queue(id, name, description);
    return this;
  }

  addConnection(sourceId: string, targetId: string, protocol: string): this {
    this.wasm = this.wasm.add_connection(sourceId, targetId, protocol);
    return this;
  }

  build(): Diagram {
    const json = this.wasm.build();
    return JSON.parse(json);
  }
}

export class SequenceDiagramBuilder {
  private wasm: any;

  constructor(title: string) {
    this.wasm = new (window as any).DiagramRendererWasm.SequenceDiagramBuilder(title);
  }

  addActor(id: string, name: string, actorType: ActorType): this {
    this.wasm = this.wasm.add_actor(id, name, actorType);
    return this;
  }

  addMessage(fromId: string, toId: string, label: string, msgType: MessageType): this {
    this.wasm = this.wasm.add_message(fromId, toId, label, msgType);
    return this;
  }

  renderSvg(): string {
    return this.wasm.render_svg();
  }

  toJson(): SequenceDiagram {
    return JSON.parse(this.wasm.to_json());
  }
}
