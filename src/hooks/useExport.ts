import { useCallback } from "react";
import { buildExport, type SchemaExport } from "../data/export";
import { defOf } from "../flow";
import { useMapStore } from "../store/mapStore";

interface ExportActions {
  payload: () => SchemaExport;
  payloadText: () => string;
  downloadJSON: () => void;
  copyJSON: () => Promise<void>;
}

/**
 * JSON export actions bound to the live store state (positions + edges).
 * @returns payload builders plus download/copy handlers
 */
export function useExport(): ExportActions {
  const payload = useCallback((): SchemaExport => {
    const { nodes, edges } = useMapStore.getState();
    const positions = Object.fromEntries(nodes.map((n) => [n.id, n.position]));
    return buildExport(positions, edges.map(defOf));
  }, []);

  const payloadText = useCallback((): string => JSON.stringify(payload(), null, 2), [payload]);

  const downloadJSON = useCallback((): void => {
    const blob = new Blob([payloadText()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "section-x-screen-map.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [payloadText]);

  const copyJSON = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(payloadText());
  }, [payloadText]);

  return { payload, payloadText, downloadJSON, copyJSON };
}
