import { useCallback } from "react";
import { buildExport, type SchemaExport } from "../data/export";
import { defOf } from "../flow";
import { useMapStore } from "../store/mapStore";

interface ExportActions {
  payload: () => SchemaExport;
  payloadText: () => string;
  downloadJSON: () => void;
  copyJSON: () => Promise<boolean>;
}

function copyWithTextarea(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
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

  const copyJSON = useCallback(async (): Promise<boolean> => {
    const text = payloadText();
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return copyWithTextarea(text);
      }
    }
    return copyWithTextarea(text);
  }, [payloadText]);

  return { payload, payloadText, downloadJSON, copyJSON };
}
