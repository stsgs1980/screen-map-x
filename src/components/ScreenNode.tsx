import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useContext } from "react";
import { MapContext } from "../context";
import { NODE_W } from "../data/constants";
import { ENTITY_META } from "../data/entities";
import { fieldId, portId } from "../data/fields";
import { screenHeight } from "../data/screens";
import { STATUS } from "../data/status";
import { type FieldDef, type Side } from "../data/types";
import { type ScreenFlowNode } from "../flow";
import { Icon } from "./Icon";

/* --------------------------------------------------------- card/field
 * icon 12px + label + entity key + 5px port dots on both edges.
 * Ports are separate child elements (React Flow Handles): each side
 * carries an overlapping target+source pair so a connector can enter
 * or leave the field from whichever side faces its counterpart. */
function FieldRow({ screenId, field }: { screenId: string; field: FieldDef }) {
  const { activeEntity, setHoverEntity, statusFilter } = useContext(MapContext);
  const fId = fieldId(screenId, field.entity);
  const on = activeEntity === field.entity;
  const dim = (!!activeEntity && !on) || (!!statusFilter && field.status !== statusFilter);
  const color = STATUS[field.status].color;

  const portStyle = (side: Side, z: number): React.CSSProperties => ({
    left: side === "L" ? 0 : "100%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    background: on ? color : "#141414",
    borderColor: on ? color : "#6E6E6E",
    boxShadow: on ? `0 0 6px ${color}` : "none",
    zIndex: z,
  });

  return (
    <div
      className={`fld${on ? "on" : ""}`}
      style={{ opacity: dim ? 0.2 : 1 }}
      title={`${field.name}: ${field.type} · ${STATUS[field.status].label} · entity ${field.entity}`}
      onMouseEnter={() => setHoverEntity(field.entity)}
      onMouseLeave={() => setHoverEntity(null)}
    >
      <span className="fld-bar" style={{ background: color }} />
      <Icon name={ENTITY_META[field.entity]?.icon ?? "doc"} />
      <span className="fld-label">{field.label}</span>
      <span className="fld-ent">{field.entity}</span>
      {(["L", "R"] as const).flatMap((side) => [
        <Handle
          key={`${side}-in`}
          id={portId(fId, side, "in")}
          type="target"
          position={side === "L" ? Position.Left : Position.Right}
          className="port"
          style={portStyle(side, 1)}
          isConnectable
        />,
        <Handle
          key={`${side}-out`}
          id={portId(fId, side, "out")}
          type="source"
          position={side === "L" ? Position.Left : Position.Right}
          className="port"
          style={portStyle(side, 2)}
          isConnectable
        />,
      ])}
    </div>
  );
}

/* --------------------------------------------------------- card/screen
 * header 40px + field rows 23px + optional skeleton block + chrome 13px */
export const ScreenNode = memo(function ScreenNode({ data, selected }: NodeProps<ScreenFlowNode>) {
  const { activeEntity } = useContext(MapContext);
  const s = data.screen;
  const inRoute = !activeEntity || s.fields.some((f) => f.entity === activeEntity);
  const statusDots = [...new Set(s.fields.map((f) => f.status))];

  return (
    <div
      className={`scr${selected ? "sel" : ""}${inRoute ? "" : "dim"}`}
      style={{ width: NODE_W, height: screenHeight(s) }}
    >
      <div className="scr-head">
        <div className="scr-head-l">
          <div className="mono-label">{s.code}</div>
          <div className="scr-title">{s.title}</div>
        </div>
        <div className="scr-head-r">
          {s.hub && <span className="hub-badge">hub ★</span>}
          <span className="scr-dots">
            {statusDots.map((st) => (
              <i key={st} style={{ background: STATUS[st].color }} />
            ))}
          </span>
        </div>
      </div>

      {s.fields.map((f) => (
        <FieldRow key={f.entity} screenId={s.id} field={f} />
      ))}

      {s.skeleton && (
        <div className="skel" aria-hidden>
          <span style={{ width: "72%", animationDelay: "0s" }} />
          <span style={{ width: "46%", animationDelay: ".25s" }} />
          <span style={{ width: "60%", animationDelay: ".5s" }} />
        </div>
      )}

      <div className="chrome">
        <i />
        <i />
        <i />
        <span className="chrome-route">{s.route}</span>
      </div>
    </div>
  );
});
