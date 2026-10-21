import { Tooltip } from "@base-ui/react/tooltip";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import { useMemo, useRef, type ReactElement } from "react";
import { CANVAS } from "./data/constants";
import type { OrthEdge as OrthEdgeType, ScreenFlowNode } from "./flow/adapter";
import { useAutoCenter } from "./hooks/useAutoCenter";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { setFlowInstance } from "./model/flowRef";
import { selectActiveEntity, useMapStore } from "./model/mapStore";
import { CanvasContextMenu } from "./ui/CanvasContextMenu";
import { CanvasOverlays } from "./ui/CanvasOverlays";
import { CommandPalette } from "./ui/CommandPalette";
import { HelpDialog } from "./ui/HelpDialog";
import { Inspector } from "./ui/inspector/Inspector";
import { JsonDialog } from "./ui/JsonDialog";
import { OrthEdge } from "./ui/OrthEdge";
import { ScreenNode } from "./ui/ScreenNode";
import { notify, ToastHost } from "./ui/Toasts";
import { Toolbar } from "./ui/Toolbar";

const nodeTypes = { screen: ScreenNode } as unknown as NodeTypes;
const edgeTypes = { orth: OrthEdge } as unknown as EdgeTypes;

/**
 * Section X screen-map feature page: 1200x900 React Flow canvas with
 * field-to-field entity routes plus the inspector panel.
 * @returns the screen-map feature layout
 */
export function ScreenMapPage(): ReactElement {
  const nodes = useMapStore((s) => s.nodes);
  const edges = useMapStore((s) => s.edges);
  const activeEntity = useMapStore(selectActiveEntity);
  const onNodesChange = useMapStore((s) => s.onNodesChange);
  const onEdgesChange = useMapStore((s) => s.onEdgesChange);
  const onConnect = useMapStore((s) => s.onConnect);
  const setHoverEntity = useMapStore((s) => s.setHoverEntity);
  const setSelected = useMapStore((s) => s.setSelected);
  const clearSelectionAndPin = useMapStore((s) => s.clearSelectionAndPin);
  const setContextTarget = useMapStore((s) => s.setContextTarget);
  const scrollRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  useAutoCenter(scrollRef, frameRef);
  useGlobalShortcuts();

  const handleConnect = (conn: Connection): void => {
    const result = onConnect(conn);
    if (!result.ok) notify(result.reason);
  };

  /* highlight the active entity route / dim the rest for the edge renderer */
  const displayEdges = useMemo<OrthEdgeType[]>(
    () =>
      edges.map((e) => {
        const match = !!activeEntity && e.data?.entity === activeEntity;
        return {
          ...e,
          className: match ? "edge-hl" : "",
          data: { ...e.data!, highlight: match, dimmed: !!activeEntity && !match },
        };
      }),
    [edges, activeEntity],
  );

  return (
    <ToastHost>
      <Tooltip.Provider delay={350} closeDelay={80}>
        <div className="app">
          <Toolbar />
          <main className="main">
            <section ref={scrollRef} className="canvas-scroll">
              <div ref={frameRef} className="canvas-frame" style={{ width: CANVAS.width, height: CANVAS.height }}>
                <ReactFlow<ScreenFlowNode, OrthEdgeType>
                  nodes={nodes}
                  edges={displayEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={handleConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  onInit={setFlowInstance}
                  onNodeClick={(_, n) => setSelected(n.id)}
                  onPaneClick={clearSelectionAndPin}
                  onNodeContextMenu={(event, n) => {
                    event.preventDefault();
                    setContextTarget({ kind: "node", id: n.id, x: event.clientX, y: event.clientY });
                  }}
                  onEdgeContextMenu={(event, e) => {
                    event.preventDefault();
                    setContextTarget({ kind: "edge", id: e.id, x: event.clientX, y: event.clientY });
                  }}
                  onEdgeMouseEnter={(_, e) => e.data && setHoverEntity(e.data.entity)}
                  onEdgeMouseLeave={() => setHoverEntity(null)}
                  fitView
                  fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
                  minZoom={0.3}
                  maxZoom={1.75}
                  snapToGrid
                  snapGrid={[CANVAS.grid, CANVAS.grid]}
                  colorMode="dark"
                  deleteKeyCode={["Backspace", "Delete"]}
                  connectionRadius={24}
                  defaultEdgeOptions={{ type: "orth" }}
                  style={{ background: CANVAS.bg }}
                >
                  <Background variant={BackgroundVariant.Lines} gap={CANVAS.grid} size={1} />
                  <Controls position="top-right" showInteractive={false} />
                  <MiniMap
                    position="bottom-right"
                    style={{ width: 128, height: 84 }}
                    pannable
                    zoomable
                    nodeColor={(n) => (n.id === "hub" ? "var(--minimap-node-hub)" : "var(--minimap-node)")}
                    nodeStrokeColor="var(--border)"
                  />
                  <CanvasOverlays />
                </ReactFlow>
                <CanvasContextMenu />
              </div>
            </section>
            <Inspector />
          </main>
          <JsonDialog />
          <HelpDialog />
          <CommandPalette />
        </div>
      </Tooltip.Provider>
    </ToastHost>
  );
}
