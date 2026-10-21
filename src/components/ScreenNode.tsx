import type { NodeProps } from "@xyflow/react";
import { memo, type ReactElement } from "react";
import { NODE_W } from "../data/constants";
import { screenHeight } from "../data/screens";
import { STATUS } from "../data/status";
import type { ScreenFlowNode } from "../flow";
import { selectActiveEntity, useMapStore } from "../store/mapStore";
import { FieldRow } from "./FieldRow";
import { Star } from "./icons";

/**
 * `card/screen`: header 40px + field rows 23px + optional skeleton block
 * + chrome strip 13px. Dims as a whole when another entity route is lit.
 * @param props - React Flow node props
 * @returns the screen card
 */
export const ScreenNode = memo(function ScreenNode({ data, selected }: NodeProps<ScreenFlowNode>): ReactElement {
  const activeEntity = useMapStore(selectActiveEntity);
  const s = data.screen;
  const inRoute = !activeEntity || s.fields.some((f) => f.entity === activeEntity);
  const statusDots = [...new Set(s.fields.map((f) => f.status))];

  return (
    <div
      className={["scr", selected ? "sel" : "", inRoute ? "" : "dim"].filter(Boolean).join(" ")}
      style={{ width: NODE_W, height: screenHeight(s) }}
    >
      <div className="scr-head">
        <div className="scr-head-l">
          <div className="mono-label">{s.code}</div>
          <div className="scr-title">{s.title}</div>
        </div>
        <div className="scr-head-r">
          {s.hub && (
            <span className="hub-badge">
              hub <Star size={8} fill="currentColor" aria-hidden />
            </span>
          )}
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
