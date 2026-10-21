import { ScrollArea } from "@base-ui/react/scroll-area";
import type { ReactElement } from "react";
import { SCREEN_BY_ID } from "../../data/screens";
import { useMapStore } from "../../store/mapStore";
import { InspectorOverview } from "./InspectorOverview";
import { InspectorScreen } from "./InspectorScreen";

/**
 * Right-hand inspector panel in a custom Base UI scroll viewport: screen
 * spec when a screen is selected, section overview otherwise.
 * @returns the inspector region
 */
export function Inspector(): ReactElement {
  const selectedId = useMapStore((s) => s.selectedId);
  const screen = selectedId ? SCREEN_BY_ID[selectedId] : null;
  return (
    <ScrollArea.Root className="inspector" render={<aside />}>
      <ScrollArea.Viewport className="inspector-viewport">
        <ScrollArea.Content className="inspector-content">
          {screen ? <InspectorScreen screen={screen} /> : <InspectorOverview />}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="sa-scrollbar" orientation="vertical">
        <ScrollArea.Thumb className="sa-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
