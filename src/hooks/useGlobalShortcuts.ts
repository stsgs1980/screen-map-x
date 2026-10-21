import { useEffect } from "react";
import { useMapStore } from "../store/mapStore";

/**
 * Global keyboard shortcuts: undo/redo (Ctrl/Cmd+Z, Ctrl+Shift+Z, Ctrl+Y),
 * command palette toggle (Ctrl/Cmd+K) and the help dialog ("?"). Letter
 * shortcuts match physical key codes as well as Latin key values, so they
 * keep working in non-Latin keyboard layouts. Undo/redo/help are ignored
 * while typing in inputs; Ctrl+K always works so it can close the palette.
 */
export function useGlobalShortcuts(): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const state = useMapStore.getState();
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const isKey = (code: string, latinKey: string): boolean => event.code === code || key === latinKey;
      if (mod && isKey("KeyK", "k")) {
        event.preventDefault();
        state.setPaletteOpen(!state.paletteOpen);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing =
        !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;
      if (event.key === "?") {
        state.setHelpOpen(true);
        return;
      }
      if (!mod) return;
      if (isKey("KeyZ", "z") && event.shiftKey) {
        event.preventDefault();
        state.redo();
      } else if (isKey("KeyZ", "z")) {
        event.preventDefault();
        state.undo();
      } else if (isKey("KeyY", "y")) {
        event.preventDefault();
        state.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
