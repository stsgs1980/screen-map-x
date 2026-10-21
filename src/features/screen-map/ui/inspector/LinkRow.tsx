import type { ReactElement } from "react";
import { ArrowLeft, ArrowRight } from "../../../../shared/icons";
import { FIELD_OF, SCREEN_BY_ID } from "../../data/screens";
import { STATUS } from "../../data/status";
import type { EdgeDef } from "../../data/types";
import { useMapStore } from "../../model/mapStore";

/**
 * One incoming/outgoing link in the screen spec. Hovering lights the
 * entity route on the canvas; clicking jumps to the linked screen.
 * @param props - edge definition and direction relative to the open screen
 * @returns the link row button
 */
export function LinkRow({ def, dir }: { def: EdgeDef; dir: "in" | "out" }): ReactElement {
  const setHoverEntity = useMapStore((s) => s.setHoverEntity);
  const focusScreen = useMapStore((s) => s.focusScreen);
  const other = dir === "in" ? def.from : def.to;
  const otherScreen = SCREEN_BY_ID[other.screen];
  const otherField = FIELD_OF(other.screen, other.entity);
  return (
    <button
      className="link-row"
      onClick={() => focusScreen(other.screen)}
      onMouseEnter={() => setHoverEntity(def.entity)}
      onMouseLeave={() => setHoverEntity(null)}
      title={def.note}
    >
      <span className="dot" style={{ background: otherField ? STATUS[otherField.status].color : "var(--fg-subtle)" }} />
      <span className="link-ent">{def.entity}</span>
      <span className="link-arrow">
        {dir === "in" ? <ArrowLeft size={11} aria-hidden /> : <ArrowRight size={11} aria-hidden />}
      </span>
      <span className="link-target">
        {otherScreen?.title} · {otherField?.label}
      </span>
    </button>
  );
}
