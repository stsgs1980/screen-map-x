import { useRef, useState, type ReactElement } from "react";
import { SECTION_PATH } from "../data/constants";
import { SCREENS } from "../data/screens";
import { useExport } from "../hooks/useExport";
import { useMapStore, useTemporalStore } from "../store/mapStore";

const FIELDS_TOTAL = SCREENS.reduce((n, s) => n + s.fields.length, 0);

/**
 * Top application bar: section title, counters, pinned-route chip and
 * map actions (undo/redo, hub reset, ELK layout, JSON export).
 * @returns the header bar
 */
export function Toolbar(): ReactElement {
  const links = useMapStore((s) => s.edges.length);
  const pinnedEntity = useMapStore((s) => s.pinnedEntity);
  const elkBusy = useMapStore((s) => s.elkBusy);
  const setPinnedEntity = useMapStore((s) => s.setPinnedEntity);
  const resetMap = useMapStore((s) => s.resetMap);
  const runElk = useMapStore((s) => s.runElk);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const canUndo = useTemporalStore((s) => s.pastStates.length > 0);
  const canRedo = useTemporalStore((s) => s.futureStates.length > 0);
  const { downloadJSON, copyJSON } = useExport();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = async (): Promise<void> => {
    await copyJSON();
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <header className="topbar">
      <div className="topbar-l">
        <div>
          <div className="mono-label">{SECTION_PATH}</div>
          <h1 className="app-title">
            Карта экранов <span className="title-dim">· field → field</span>
          </h1>
        </div>
        <span className="counter mono">
          {SCREENS.length} screens · {FIELDS_TOTAL} fields · {links} links
        </span>
        {pinnedEntity && (
          <button className="pin-chip" onClick={() => setPinnedEntity(null)} title="Снять закрепление">
            маршрут: {pinnedEntity} ✕
          </button>
        )}
      </div>
      <div className="toolbar">
        <button className="btn" onClick={undo} disabled={!canUndo} title="Отменить (Ctrl+Z)">
          Отменить
        </button>
        <button className="btn" onClick={redo} disabled={!canRedo} title="Повторить (Ctrl+Shift+Z)">
          Повторить
        </button>
        <button className="btn" onClick={resetMap} title="Исходная схема: хаб в центре, сателлиты по краям">
          Сброс · хаб ★
        </button>
        <button
          className="btn"
          onClick={() => void runElk()}
          disabled={elkBusy}
          title="elkjs: layered, direction DOWN, orthogonal routing"
        >
          {elkBusy ? "ELK…" : "ELK · layered ↓"}
        </button>
        <button className="btn" onClick={() => void onCopy()}>
          {copied ? "Скопировано ✓" : "Копировать JSON"}
        </button>
        <button className="btn btn-primary" onClick={downloadJSON}>
          ⇩ Экспорт JSON
        </button>
      </div>
    </header>
  );
}
