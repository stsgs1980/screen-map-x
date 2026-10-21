import type { ReactElement } from "react";
import { ENTITY_META } from "../../data/entities";
import { SCREEN_BY_ID, SCREENS } from "../../data/screens";
import { STATUS } from "../../data/status";
import { defOf } from "../../flow/adapter";
import { useMapStore } from "../../model/mapStore";

/**
 * Rich hover card for one entity: every field carrying it (screen, API name,
 * status) and the current hand-off chain from the live edge set.
 * @param props - the entity key
 * @returns preview card content
 */
export function EntityPreview({ entity }: { entity: string }): ReactElement {
  const edges = useMapStore((s) => s.edges);
  const hops = edges.map(defOf).filter((d) => d !== null && d.entity === entity);
  return (
    <>
      <div className="pv-head mono">
        {entity} · {ENTITY_META[entity].label}
      </div>
      <ul className="pv-fields">
        {SCREENS.flatMap((s) =>
          s.fields
            .filter((f) => f.entity === entity)
            .map((f) => (
              <li key={`${s.id}:${f.entity}`}>
                <span className="dot" style={{ background: STATUS[f.status].color }} />
                <span className="pv-screen">{s.title}</span>
                <span className="mono pv-api">
                  {f.name}: {f.type}
                </span>
              </li>
            )),
        )}
      </ul>
      {hops.length > 0 && (
        <>
          <div className="mono-label">Маршрут</div>
          <ul className="pv-hops">
            {hops.map((h) => (
              <li key={h.id}>
                {SCREEN_BY_ID[h.from.screen]?.title} -&gt; {SCREEN_BY_ID[h.to.screen]?.title}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
