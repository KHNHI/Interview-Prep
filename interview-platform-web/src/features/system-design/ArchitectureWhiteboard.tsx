import { useId, useState } from "react";
import type { ArchitectureBoard } from "./architectureBoards";
import "./whiteboard.css";

export function ArchitectureWhiteboard({ board }: { board: ArchitectureBoard }) {
  const prefix = useId().replace(/:/g, "");
  const [flowIndex, setFlowIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const flow = flowIndex === null ? null : board.flows[flowIndex];
  const selected = board.nodes.find(node => node.id === selectedId);
  const activeEdges = new Set(flow?.edges ?? board.edges.map(edge => edge.id));
  const activeNodes = new Set(board.edges.filter(edge => activeEdges.has(edge.id)).flatMap(edge => [edge.from, edge.to]));

  return <section className="whiteboard" aria-label="Interactive architecture diagram">
    <header className="whiteboard-heading">
      <div><p className="whiteboard-eyebrow">The architecture, at a glance</p><h2>{board.title}</h2></div>
      <span className="whiteboard-edition">Whiteboard notes</span>
    </header>
    <div className="whiteboard-tools">
      <div className="whiteboard-flows" role="group" aria-label="Highlight a request flow">
        <button aria-pressed={flowIndex === null} onClick={() => setFlowIndex(null)}>All flows</button>
        {board.flows.map((item, index) => <button key={item.label} aria-pressed={flowIndex === index}
          onClick={() => setFlowIndex(index)}>{item.label}</button>)}
      </div>
      <div className="whiteboard-zoom" role="group" aria-label="Diagram zoom">
        <button aria-label="Zoom out diagram" disabled={zoom <= 0.8} onClick={() => setZoom(value => Math.max(0.8, +(value - 0.2).toFixed(1)))}>−</button>
        <button aria-label="Reset diagram zoom" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button aria-label="Zoom in diagram" disabled={zoom >= 1.6} onClick={() => setZoom(value => Math.min(1.6, +(value + 0.2).toFixed(1)))}>+</button>
      </div>
    </div>
    <p id={`${prefix}-help`} className="whiteboard-help">Select a flow to trace it. Select a component for notes. <span>On small screens, scroll the board sideways.</span></p>
    <div className="whiteboard-canvas" tabIndex={0} role="region" aria-label="Scrollable architecture board" aria-describedby={`${prefix}-help`}>
      <svg viewBox="0 0 1000 570" style={{ width: `${zoom * 100}%`, minWidth: `${zoom * 780}px` }}
        aria-labelledby={`${prefix}-title ${prefix}-description`}>
        <title id={`${prefix}-title`}>{board.title}</title>
        <desc id={`${prefix}-description`}>{board.note} Solid arrows are synchronous calls. Dashed arrows are asynchronous work. Response arrows are omitted for clarity. A text walkthrough follows the diagram.</desc>
        <defs>
          <pattern id={`${prefix}-dots`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.8" fill="#d8dfd0" /></pattern>
          <marker id={`${prefix}-arrow`} markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 1 1 L 8 4 L 1 7" fill="none" stroke="#496653" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <rect width="1000" height="570" fill={`url(#${prefix}-dots)`} />
        <text x="30" y="35" className="whiteboard-annotation">{flow?.note ?? "Start with the big picture. Then follow one request."}</text>
        {board.edges.map(edge => <g key={edge.id} className={activeEdges.has(edge.id) ? "board-edge" : "board-edge is-muted"}>
          <path d={edge.path} fill="none" stroke="#496653" strokeWidth={flow ? 2.5 : 1.8}
            strokeDasharray={edge.async ? "7 6" : undefined} strokeLinecap="round" strokeLinejoin="round" markerEnd={`url(#${prefix}-arrow)`} />
          <text x={edge.labelX} y={edge.labelY} textAnchor="middle" className="board-edge-label">{edge.label}</text>
        </g>)}
        {board.nodes.map((node, index) => <g key={node.id} transform={`translate(${node.x} ${node.y})`}
          role="button" tabIndex={0} aria-label={`${node.label}: ${node.subtitle}`} aria-pressed={selectedId === node.id}
          onClick={() => setSelectedId(node.id)} onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(node.id); }
          }} className={`board-node ${flow && !activeNodes.has(node.id) ? "is-muted" : ""} ${selectedId === node.id ? "is-selected" : ""}`}>
          <title>{node.detail}</title>
          <path className="board-node-outline" d={index % 2 === 0
            ? "M 3 2 Q 88 -2 178 2 L 180 77 Q 90 82 1 78 Z"
            : "M 2 1 Q 91 4 179 0 L 178 79 Q 90 76 0 80 Z"}
            fill={node.kind === "store" ? "#e9eedf" : node.kind === "queue" ? "#f5eddc" : "#fffefa"} stroke="#496653" strokeWidth="1.7" />
          {node.kind === "store" && <path d="M 2 12 Q 90 22 178 12" fill="none" stroke="#8c9e80" strokeWidth="1" />}
          <text x="90" y={node.kind === "store" ? 40 : 34} textAnchor="middle" className="board-node-title">{node.label}</text>
          <text x="90" y={node.kind === "store" ? 61 : 56} textAnchor="middle" className="board-node-subtitle">{node.subtitle}</text>
        </g>)}
        <text x="30" y="550" className="whiteboard-annotation">{board.note}</text>
      </svg>
    </div>
    <div className="whiteboard-legend"><span>Solid line · request / lookup</span><span>Dashed line · asynchronous work</span><span>Responses omitted for clarity</span></div>
    {selected && <aside className="whiteboard-component" aria-live="polite">
      <div><p className="whiteboard-eyebrow">Component notes</p><h3>{selected.label}</h3><p>{selected.detail}</p></div>
      <button aria-label="Close component notes" onClick={() => setSelectedId(null)}>Close</button>
    </aside>}
    <div className="whiteboard-walkthrough">
      <h3>{flow ? flow.label : "Walk through the design"}</h3>
      <div className="whiteboard-flow-notes">
        {(flow ? [flow] : board.flows).map(item => <div key={item.label}>
          {!flow && <h4>{item.label}</h4>}
          <ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol>
        </div>)}
      </div>
    </div>
  </section>;
}
