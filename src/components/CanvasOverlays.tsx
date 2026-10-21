import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Panel } from "@xyflow/react";
import type { ReactElement } from "react";
import { STATUS, STATUS_KEYS } from "../data/status";
import type { StatusKey } from "../data/types";
import { useMapStore } from "../store/mapStore";

/**
 * Canvas overlay panels: map caption (top-left), interaction hints
 * (top-center) and the status legend (bottom-left) built on a Base UI
 * ToggleGroup, so filtering is keyboard-accessible with proper semantics.
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
        Ctrl+K — поиск · hover поле — маршрут · Ctrl+Z — отмена · drag от порта — связь · Del — удалить
      </Panel>

      <Panel position="bottom-left" className="panel-card legend">
        <span className="mono-label">STATUS</span>
        <ToggleGroup
          className="legend-group"
          aria-label="Фильтр полей по статусу"
          value={statusFilter ? [statusFilter] : []}
          onValueChange={(value) => setStatusFilter((value[0] as StatusKey | undefined) ?? null)}
        >
          {STATUS_KEYS.map((k) => (
            <Toggle key={k} value={k} className="leg-chip" title={`${STATUS[k].ru} — фильтр полей по статусу`}>
              <span className="dot" style={{ background: STATUS[k].color }} />
              {STATUS[k].label}
            </Toggle>
          ))}
        </ToggleGroup>
      </Panel>
    </>
  );
}
