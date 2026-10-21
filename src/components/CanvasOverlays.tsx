import { Panel } from "@xyflow/react";
import type { ReactElement } from "react";
import { STATUS, STATUS_KEYS } from "../data/status";
import { useMapStore } from "../store/mapStore";

/**
 * Canvas overlay panels: map caption (top-left), interaction hints
 * (top-center) and the status legend with filter toggles (bottom-left).
 * @returns the three React Flow panels
 */
export function CanvasOverlays(): ReactElement {
  const statusFilter = useMapStore((s) => s.statusFilter);
  const setStatusFilter = useMapStore((s) => s.setStatusFilter);
  return (
    <>
      <Panel position="top-left" className="panel-card canvas-head">
        <div className="mono-label">// SECTION X — SCREEN MAP</div>
        <div className="canvas-sub mono">1200 × 900 · grid 10 · orth · dashed 3/4 · r8</div>
      </Panel>

      <Panel position="top-center" className="hints mono">
        hover поле — маршрут · клик экран — спецификация · Ctrl+Z — отмена · drag от порта — связь · Del — удалить
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
    </>
  );
}
