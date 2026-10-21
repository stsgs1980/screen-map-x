import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import { useMemo, type ReactElement } from "react";
import { CanvasOverlays } from "./components/CanvasOverlays";
import { Inspector } from "./components/inspector/Inspector";
import { OrthEdge } from "./components/OrthEdge";
import { ScreenNode } from "./components/ScreenNode";
import { Toolbar } from "./components/Toolbar";
import { CANVAS } from "./data/constants";
import type { OrthEdge as OrthEdgeType, ScreenFlowNode } from "./flow";
import { useUndoShortcuts } from "./hooks/useUndoShortcuts";
import { setFlowInstance } from "./store/flowRef";
import { selectActiveEntity, useMapStore } from "./store/mapStore";

const nodeTypes = { screen: ScreenNode } as unknown as NodeTypes;
const edgeTypes = { orth: OrthEdge } as unknown as EdgeTypes;

/**
 * Section X screen map application: 1200x900 React Flow canvas with
 * field-to-field entity routes plus the inspector panel.
 * @returns the whole app layout
 */
export default function App(): ReactElement {
  const nodes = useMapStore((s) => s.nodes);
  const edges = useMapStore((s) => s.edges);
  const activeEntity = useMapStore(selectActiveEntity);
  const onNodesChange = useMapStore((s) => s.onNodesChange);
  const onEdgesChange = useMapStore((s) => s.onEdgesChange);
  const onConnect = useMapStore((s) => s.onConnect);
  const setHoverEntity = useMapStore((s) => s.setHoverEntity);
  const setSelected = useMapStore((s) => s.setSelected);
  const clearSelectionAndPin = useMapStore((s) => s.clearSelectionAndPin);
  useUndoShortcuts();

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
    <div className="app">
      <Toolbar />
      <main className="main">
        <section className="canvas-scroll">
          <div className="canvas-frame" style={{ width: CANVAS.width, height: CANVAS.height }}>
            <ReactFlow<ScreenFlowNode, OrthEdgeType>
              nodes={nodes}
              edges={displayEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={setFlowInstance}
              onNodeClick={(_, n) => setSelected(n.id)}
              onPaneClick={clearSelectionAndPin}
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
              <Background variant={BackgroundVariant.Lines} gap={CANVAS.grid} size={1} color="#1D1D1D" />
              <Controls position="top-right" showInteractive={false} />
              <MiniMap
                position="bottom-right"
                style={{ width: 128, height: 84 }}
                pannable
                zoomable
                bgColor="rgba(20,20,20,.92)"
                maskColor="rgba(0,0,0,.55)"
                nodeColor={(n) => (n.id === "hub" ? "#5A5A5A" : "#2E2E2E")}
                nodeStrokeColor="#3D3D3D"
              />
              <CanvasOverlays />
            </ReactFlow>
          </div>
        </section>
        <Inspector />
      </main>
    </div>
  );
}
