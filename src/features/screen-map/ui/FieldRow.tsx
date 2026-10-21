import { Tooltip } from "@base-ui/react/tooltip";
import { Handle, Position } from "@xyflow/react";
import { useMemo, type CSSProperties, type ReactElement } from "react";
import { ENTITY_META } from "../data/entities";
import { fieldId, portId } from "../data/fields";
import { STATUS } from "../data/status";
import type { FieldDef, Side } from "../data/types";
import { selectActiveEntity, useMapStore } from "../model/mapStore";
import { Icon } from "./Icon";

/**
 * `card/field`: icon 12px + label + entity key + 5px port dots on both edges.
 * Ports are separate child elements (React Flow Handles): each side carries
 * an overlapping target+source pair so a connector can enter or leave the
 * field from whichever side faces its counterpart. A Base UI tooltip shows
 * the API name/type, status and hand-off counts for this field.
 * @param props - owning screen id and the field definition
 * @returns one 23px field row
 */
export function FieldRow({ screenId, field }: { screenId: string; field: FieldDef }): ReactElement {
  const activeEntity = useMapStore(selectActiveEntity);
  const statusFilter = useMapStore((s) => s.statusFilter);
  const setHoverEntity = useMapStore((s) => s.setHoverEntity);
  const edges = useMapStore((s) => s.edges);
  const fId = fieldId(screenId, field.entity);
  const on = activeEntity === field.entity;
  const dim = (!!activeEntity && !on) || (!!statusFilter && field.status !== statusFilter);
  const color = STATUS[field.status].color;

  const links = useMemo(() => {
    let incoming = 0;
    let outgoing = 0;
    for (const e of edges) {
      if (e.source === screenId && e.data?.from.entity === field.entity) outgoing += 1;
      if (e.target === screenId && e.data?.to.entity === field.entity) incoming += 1;
    }
    return { incoming, outgoing };
  }, [edges, screenId, field.entity]);

  const portStyle = (side: Side, z: number): CSSProperties => ({
    left: side === "L" ? 0 : "100%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    background: on ? color : "#141414",
    borderColor: on ? color : "#6E6E6E",
    boxShadow: on ? `0 0 6px ${color}` : "none",
    zIndex: z,
  });

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <div
            className={on ? "fld on" : "fld"}
            style={{ opacity: dim ? 0.2 : 1 }}
            onMouseEnter={() => setHoverEntity(field.entity)}
            onMouseLeave={() => setHoverEntity(null)}
          />
        }
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
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner className="pop-pos" side="top" sideOffset={8}>
          <Tooltip.Popup className="tip">
            <div className="tip-head mono">
              <span className="dot" style={{ background: color }} /> {field.name}: {field.type}
            </div>
            <div className="tip-row">
              entity <b>{field.entity}</b> · {STATUS[field.status].label}
            </div>
            <div className="tip-row">
              переходов: {links.incoming} вход. · {links.outgoing} исход.
            </div>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
