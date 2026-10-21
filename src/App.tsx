import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  applyEdgeChanges,
  useNodesState,
  type Connection,
  type EdgeChange,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Inspector } from "./components/Inspector";
import { OrthEdge } from "./components/OrthEdge";
import { ScreenNode } from "./components/ScreenNode";
import { MapContext, type MapCtxValue } from "./context";
import {
  CANVAS,
  EDGE_DEFS,
  FIELD_OF,
  NODE_W,
  SCREENS,
  SCREEN_BY_ID,
  SECTION_PATH,
  STATUS,
  STATUS_KEYS,
  buildExport,
  initialPositions,
  screenHeight,
  type EdgeDef,
  type ScreenFlowNode,
  type StatusKey,
} from "./data/schema";
import { defOf, toFlowEdges, type OrthEdge as OrthEdgeType, type PosMap } from "./flow";
import { elkLayout } from "./layout/elk";

const nodeTypes = { screen: ScreenNode } as unknown as NodeTypes;
const edgeTypes = { orth: OrthEdge } as unknown as EdgeTypes;

const initialNodes: ScreenFlowNode[] = SCREENS.map((s) => ({
  id: s.id,
  type: "screen",
  position: { ...s.position },
  data: { screen: s },
  width: NODE_W,
  height: screenHeight(s),
  deletable: false,
}));

const posMapOf = (nodes: ScreenFlowNode[]): PosMap => Object.fromEntries(nodes.map((n) => [n.id, n.position]));

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ScreenFlowNode>(initialNodes);
  const [edges, setEdges] = useState<OrthEdgeType[]>(() => toFlowEdges(EDGE_DEFS, initialPositions()));
  const [hoverEntity, setHoverEntity] = useState<string | null>(null);
  const [pinnedEntity, setPinnedEntity] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusKey | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const rf = useRef<ReactFlowInstance<ScreenFlowNode, OrthEdgeType> | null>(null);

  const activeEntity = hoverEntity ?? pinnedEntity;
  const currentDefs = useMemo(() => edges.map(defOf), [edges]);
  const selectedScreen = selectedId ? SCREEN_BY_ID[selectedId] : null;
  const fieldsTotal = useMemo(() => SCREENS.reduce((n, s) => n + s.fields.length, 0), []);

  const ctx = useMemo<MapCtxValue>(
    () => ({
      activeEntity,
      setHoverEntity,
      pinnedEntity,
      togglePin: (e: string) => setPinnedEntity((p) => (p === e ? null : e)),
      statusFilter,
      setStatusFilter,
    }),
    [activeEntity, pinnedEntity, statusFilter],
  );

  /* highlight route / dim the rest — derived flags for the edge renderer */
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

  const onEdgesChange = useCallback(
    (changes: EdgeChange<OrthEdgeType>[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );

  /* field -> field: user can draw a new entity hand-off from any port */
  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target || !conn.sourceHandle || !conn.targetHandle) return;
      const fromEntity = conn.sourceHandle.split("|")[0].split(".").pop()!;
      const toEntity = conn.targetHandle.split("|")[0].split(".").pop()!;
      if (conn.source === conn.target && fromEntity === toEntity) return;
      const entity = FIELD_OF(conn.source, fromEntity)?.entity ?? fromEntity;
      const def: EdgeDef = {
        id: `e-${entity}-${conn.source}-${conn.target}-${edges.length}`,
        entity,
        from: { screen: conn.source, entity: fromEntity },
        to: { screen: conn.target, entity: toEntity },
        note: "связь добавлена вручную",
      };
      if (currentDefs.some((d) => d.id === def.id)) return;
      setEdges(toFlowEdges([...currentDefs, def], posMapOf(nodes)));
    },
    [currentDefs, edges.length, nodes],
  );

  const applyPositions = useCallback(
    (pos: PosMap, defs: EdgeDef[]) => {
      setNodes((ns) => ns.map((n) => ({ ...n, position: pos[n.id] ?? n.position })));
      setEdges(toFlowEdges(defs, pos));
      requestAnimationFrame(() => rf.current?.fitView({ padding: 0.12, maxZoom: 1, duration: 450 }));
    },
    [setNodes],
  );

  const runElk = useCallback(async () => {
    setBusy(true);
    try {
      const pos = await elkLayout(SCREENS, currentDefs);
      applyPositions(pos, currentDefs);
    } finally {
      setBusy(false);
    }
  }, [currentDefs, applyPositions]);

  const reset = useCallback(() => applyPositions(initialPositions(), EDGE_DEFS), [applyPositions]);

  const focusScreen = useCallback(
    (id: string) => {
      setSelectedId(id);
      setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })));
      rf.current?.fitView({ nodes: [{ id }], padding: 0.5, maxZoom: 1.1, duration: 450 });
    },
    [setNodes],
  );

  const exportPayload = useCallback(() => buildExport(posMapOf(nodes), currentDefs), [nodes, currentDefs]);

  const downloadJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(exportPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "section-x-screen-map.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [exportPayload]);

  const copyJSON = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [exportPayload]);

  return (
    <MapContext.Provider value={ctx}>
      <div className="app">
        <header className="topbar">
          <div className="topbar-l">
            <div>
              <div className="mono-label">{SECTION_PATH}</div>
              <h1 className="app-title">
                Карта экранов <span className="title-dim">· field → field</span>
              </h1>
            </div>
            <span className="counter mono">
              {SCREENS.length} screens · {fieldsTotal} fields · {edges.length} links
            </span>
            {pinnedEntity && (
              <button className="pin-chip" onClick={() => setPinnedEntity(null)} title="Снять закрепление">
                маршрут: {pinnedEntity} ✕
              </button>
            )}
          </div>
          <div className="toolbar">
            <button className="btn" onClick={reset} title="Исходная схема: хаб в центре, сателлиты по краям">
              Сброс · хаб ★
            </button>
            <button
              className="btn"
              onClick={runElk}
              disabled={busy}
              title="elkjs: layered, direction DOWN, orthogonal routing"
            >
              {busy ? "ELK…" : "ELK · layered ↓"}
            </button>
            <button className="btn" onClick={copyJSON}>
              {copied ? "Скопировано ✓" : "Копировать JSON"}
            </button>
            <button className="btn btn-primary" onClick={downloadJSON}>
              ⇩ Экспорт JSON
            </button>
          </div>
        </header>

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
                onInit={(i) => (rf.current = i)}
                onNodeClick={(_, n) => setSelectedId(n.id)}
                onPaneClick={() => {
                  setSelectedId(null);
                  setPinnedEntity(null);
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

                <Panel position="top-left" className="panel-card canvas-head">
                  <div className="mono-label">// SECTION X — SCREEN MAP</div>
                  <div className="canvas-sub mono">1200 × 900 · grid 10 · orth · dashed 3/4 · r8</div>
                </Panel>

                <Panel position="bottom-left" className="panel-card legend">
                  <span className="mono-label">STATUS</span>
                  {STATUS_KEYS.map((k) => (
                    <button
                      key={k}
                      className={`leg-chip${statusFilter === k ? "on" : ""}`}
                      onClick={() => setStatusFilter(statusFilter === k ? null : k)}
                      title={`${STATUS[k].ru} — клик фильтрует поля по статусу`}
                    >
                      <span className="dot" style={{ background: STATUS[k].color }} />
                      {STATUS[k].label}
                    </button>
                  ))}
                </Panel>

                <Panel position="top-center" className="hints mono">
                  hover поле — маршрут · клик экран — спецификация · drag — сетка 10 · drag от порта — связь · Del —
                  удалить
                </Panel>
              </ReactFlow>
            </div>
          </section>

          <Inspector
            screen={selectedScreen}
            defs={currentDefs}
            onClose={() => {
              setSelectedId(null);
              setNodes((ns) => ns.map((n) => ({ ...n, selected: false })));
            }}
            onFocusScreen={focusScreen}
          />
        </main>
      </div>
    </MapContext.Provider>
  );
}
