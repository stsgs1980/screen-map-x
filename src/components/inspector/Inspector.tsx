import type { ReactElement } from "react";
import { SCREEN_BY_ID } from "../../data/screens";
import { useMapStore } from "../../store/mapStore";
import { InspectorOverview } from "./InspectorOverview";
import { InspectorScreen } from "./InspectorScreen";

/**
 * Right-hand inspector panel: screen spec when a screen is selected,
 * section overview otherwise.
 * @returns the inspector aside
 */
export function Inspector(): ReactElement {
  const selectedId = useMapStore((s) => s.selectedId);
  const screen = selectedId ? SCREEN_BY_ID[selectedId] : null;
  return <aside className="inspector">{screen ? <InspectorScreen screen={screen} /> : <InspectorOverview />}</aside>;
}
