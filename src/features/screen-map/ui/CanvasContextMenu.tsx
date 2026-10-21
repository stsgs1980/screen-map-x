import { Menu } from "@base-ui/react/menu";
import { useMemo, type ReactElement } from "react";
import { Crosshair, Eye, Trash, Waypoints } from "../../../shared/icons";
import { SCREEN_BY_ID } from "../data/screens";
import { STATUS } from "../data/status";
import { defOf } from "../flow/adapter";
import { useMapStore } from "../model/mapStore";

/**
 * Right-click menu for screens and links, anchored at the pointer via a
 * virtual element. Rendered from the store's `contextTarget`.
 * @returns the menu, or an empty fragment when closed
 */
export function CanvasContextMenu(): ReactElement {
  const target = useMapStore((s) => s.contextTarget);
  const edges = useMapStore((s) => s.edges);
  const setTarget = useMapStore((s) => s.setContextTarget);
  const setSelected = useMapStore((s) => s.setSelected);
  const focusScreen = useMapStore((s) => s.focusScreen);
  const togglePin = useMapStore((s) => s.togglePin);
  const deleteEdge = useMapStore((s) => s.deleteEdge);

  const anchor = useMemo(
    () => (target ? { getBoundingClientRect: (): DOMRect => new DOMRect(target.x, target.y, 0, 0) } : null),
    [target],
  );
  if (!target || !anchor) return <></>;

  const screen = target.kind === "node" ? SCREEN_BY_ID[target.id] : null;
  const edge = target.kind === "edge" ? edges.find((e) => e.id === target.id) : undefined;
  const def = edge ? defOf(edge) : null;

  return (
    <Menu.Root
      open
      onOpenChange={(next) => {
        if (!next) setTarget(null);
      }}
    >
      <Menu.Portal>
        <Menu.Positioner className="pop-pos" anchor={anchor} side="bottom" align="start" sideOffset={2}>
          <Menu.Popup className="menu-popup ctx-popup">
            {screen && (
              <>
                <div className="menu-head mono">
                  {screen.code} · {screen.route}
                </div>
                <Menu.Item className="menu-item" onClick={() => focusScreen(screen.id)}>
                  <Crosshair size={13} aria-hidden /> Центрировать и открыть
                </Menu.Item>
                <Menu.Item className="menu-item" onClick={() => setSelected(screen.id)}>
                  <Eye size={13} aria-hidden /> Только спецификация
                </Menu.Item>
                <Menu.Separator className="menu-sep" />
                <div className="menu-head mono">Маршруты сущностей</div>
                {screen.fields.map((f) => (
                  <Menu.Item key={f.entity} className="menu-item" onClick={() => togglePin(f.entity)}>
                    <span className="dot" style={{ background: STATUS[f.status].color }} />
                    {f.entity}
                    <span className="menu-item-note">{f.label}</span>
                  </Menu.Item>
                ))}
              </>
            )}
            {def && (
              <>
                <div className="menu-head mono">
                  {def.entity} · {def.from.screen} -&gt; {def.to.screen}
                </div>
                <Menu.Item className="menu-item" onClick={() => togglePin(def.entity)}>
                  <Waypoints size={13} aria-hidden /> Закрепить маршрут сущности
                </Menu.Item>
                <Menu.Item className="menu-item danger" onClick={() => deleteEdge(def.id)}>
                  <Trash size={13} aria-hidden /> Удалить связь
                </Menu.Item>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
