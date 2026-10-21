import { useMemo, type ReactElement } from "react";
import { PanelRightClose, X } from "../../../../shared/icons";
import { STATUS } from "../../data/status";
import type { ScreenDef } from "../../data/types";
import { defOf } from "../../flow/adapter";
import { selectActiveEntity, useMapStore } from "../../model/mapStore";
import { LinkRow } from "./LinkRow";

/**
 * Inspector in screen mode: route, API, states, fields with statuses and
 * incoming/outgoing field-to-field links of the selected screen.
 * @param props - the selected screen definition
 * @returns spec content for the inspector panel
 */
export function InspectorScreen({ screen }: { screen: ScreenDef }): ReactElement {
  const edges = useMapStore((s) => s.edges);
  const activeEntity = useMapStore(selectActiveEntity);
  const setHoverEntity = useMapStore((s) => s.setHoverEntity);
  const setSelected = useMapStore((s) => s.setSelected);
  const toggleInspector = useMapStore((s) => s.toggleInspector);
  const defs = useMemo(() => edges.map(defOf), [edges]);
  const incoming = defs.filter((e) => e.to.screen === screen.id);
  const outgoing = defs.filter((e) => e.from.screen === screen.id);

  return (
    <>
      <div className="insp-top">
        <div>
          <div className="mono-label">
            {screen.code}
            {screen.hub ? " · HUB" : ""}
          </div>
          <h2 className="insp-h">{screen.title}</h2>
        </div>
        <div className="insp-actions">
          <button
            className="btn btn-ghost insp-close inspector-collapse"
            onClick={toggleInspector}
            aria-label="Скрыть правую панель"
            title="Скрыть правую панель"
          >
            <PanelRightClose size={14} aria-hidden />
          </button>
          <button
            className="btn btn-ghost insp-close"
            onClick={() => setSelected(null)}
            title="Закрыть (клик по холсту)"
          >
            <X size={13} aria-hidden />
          </button>
        </div>
      </div>

      <div className="route-chip">{screen.route}</div>
      <p className="insp-p">{screen.description}</p>

      <div className="sec-h mono-label">API</div>
      {screen.api.map((a) => (
        <div className="api-row" key={a.path}>
          <span className="api-m">{a.method}</span>
          <span className="api-p">{a.path}</span>
        </div>
      ))}

      <div className="sec-h mono-label">Состояния</div>
      <div className="chip-row">
        {screen.states.map((st) => (
          <span className="state-chip" key={st}>
            {st}
          </span>
        ))}
        {screen.skeleton && <span className="state-chip chip-skel">skeleton block · 30px</span>}
      </div>

      <div className="sec-h mono-label">Поля · статусы</div>
      {screen.fields.map((f) => (
        <div
          className={activeEntity === f.entity ? "spec-field on" : "spec-field"}
          key={f.entity}
          onMouseEnter={() => setHoverEntity(f.entity)}
          onMouseLeave={() => setHoverEntity(null)}
        >
          <span className="dot" style={{ background: STATUS[f.status].color }} />
          <span className="spec-label">{f.label}</span>
          <span className="spec-name">
            {f.name}: {f.type}
          </span>
          <span
            className="spec-st"
            style={{
              color: STATUS[f.status].color === "#3D3D3D" ? "#8A8A8A" : STATUS[f.status].color,
            }}
          >
            {STATUS[f.status].label}
          </span>
        </div>
      ))}

      <div className="sec-h mono-label">Входящие связи · {incoming.length}</div>
      {incoming.length === 0 && <p className="insp-empty">— нет входящих переходов</p>}
      {incoming.map((e) => (
        <LinkRow key={e.id} def={e} dir="in" />
      ))}

      <div className="sec-h mono-label">Исходящие связи · {outgoing.length}</div>
      {outgoing.length === 0 && <p className="insp-empty">— нет исходящих переходов</p>}
      {outgoing.map((e) => (
        <LinkRow key={e.id} def={e} dir="out" />
      ))}
    </>
  );
}
