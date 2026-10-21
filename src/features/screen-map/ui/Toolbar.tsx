import { Menu } from "@base-ui/react/menu";
import type { ReactElement } from "react";
import {
  ChevronDown,
  Copy,
  Crosshair,
  Download,
  FileBraces,
  Keyboard,
  Network,
  PanelRightClose,
  PanelRightOpen,
  Redo2,
  RotateCcw,
  Search,
  Undo2,
  X,
} from "../../../shared/icons";
import { SECTION_PATH } from "../data/constants";
import { SCREENS } from "../data/screens";
import { useExport } from "../hooks/useExport";
import { useMapStore, useTemporalStore } from "../model/mapStore";
import { notify } from "./Toasts";

const FIELDS_TOTAL = SCREENS.reduce((n, s) => n + s.fields.length, 0);

/**
 * Top application bar: section title, counters, pinned-route chip and map
 * actions (undo/redo, hub reset, ELK layout, export menu, palette).
 * @returns the header bar
 */
export function Toolbar(): ReactElement {
  const inspectorVisible = useMapStore((s) => s.inspectorVisible);
  const toggleInspector = useMapStore((s) => s.toggleInspector);
  const centerMap = useMapStore((s) => s.centerMap);
  const links = useMapStore((s) => s.edges.length);
  const pinnedEntity = useMapStore((s) => s.pinnedEntity);
  const elkBusy = useMapStore((s) => s.elkBusy);
  const setPinnedEntity = useMapStore((s) => s.setPinnedEntity);
  const resetMap = useMapStore((s) => s.resetMap);
  const runElk = useMapStore((s) => s.runElk);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const setPaletteOpen = useMapStore((s) => s.setPaletteOpen);
  const setJsonDialogOpen = useMapStore((s) => s.setJsonDialogOpen);
  const setHelpOpen = useMapStore((s) => s.setHelpOpen);
  const canUndo = useTemporalStore((s) => s.pastStates.length > 0);
  const canRedo = useTemporalStore((s) => s.futureStates.length > 0);
  const { downloadJSON, copyJSON } = useExport();

  const onCopy = async (): Promise<void> => {
    const copied = await copyJSON();
    notify(copied ? "JSON скопирован в буфер обмена" : "Не удалось скопировать JSON");
  };

  const onRunElk = (): void => {
    void runElk().then((result) => {
      if (!result.ok) notify(result.reason);
    });
  };

  return (
    <header className="topbar">
      <div className="topbar-l">
        <div>
          <div className="mono-label">{SECTION_PATH}</div>
          <h1 className="app-title">
            Screen-map-x <span className="title-dim">· field → field</span>
          </h1>
        </div>
        <span className="counter mono">
          {SCREENS.length} screens · {FIELDS_TOTAL} fields · {links} links
        </span>
        {pinnedEntity && (
          <button className="pin-chip" onClick={() => setPinnedEntity(null)} title="Снять закрепление">
            маршрут: {pinnedEntity} <X size={11} aria-hidden />
          </button>
        )}
      </div>
      <div className="toolbar">
        <button className="btn search-btn" onClick={() => setPaletteOpen(true)} title="Поиск и команды">
          <Search size={13} aria-hidden /> Поиск
          <kbd>Ctrl K</kbd>
        </button>
        <button className="btn" onClick={undo} disabled={!canUndo} title="Отменить (Ctrl+Z)">
          <Undo2 size={13} aria-hidden /> Отменить
        </button>
        <button className="btn" onClick={redo} disabled={!canRedo} title="Повторить (Ctrl+Shift+Z)">
          <Redo2 size={13} aria-hidden /> Повторить
        </button>
        <button className="btn" onClick={centerMap} title="Центрировать и вписать карту">
          <Crosshair size={13} aria-hidden /> Центр
        </button>
        <button className="btn" onClick={resetMap} title="Исходная схема: хаб в центре, сателлиты по краям">
          <RotateCcw size={13} aria-hidden /> Сброс · хаб
        </button>
        <button
          className="btn"
          onClick={onRunElk}
          disabled={elkBusy}
          title="elkjs: layered, direction DOWN, orthogonal routing"
        >
          <Network size={13} aria-hidden /> {elkBusy ? "ELK…" : "ELK · layered"}
        </button>
        <Menu.Root>
          <Menu.Trigger className="btn btn-primary" title="Экспорт схемы в JSON">
            <Download size={13} aria-hidden /> Экспорт <ChevronDown size={12} aria-hidden />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner className="pop-pos" side="bottom" align="end" sideOffset={6}>
              <Menu.Popup className="menu-popup">
                <Menu.Item className="menu-item" onClick={downloadJSON}>
                  <Download size={13} aria-hidden /> Скачать JSON
                </Menu.Item>
                <Menu.Item className="menu-item" onClick={() => void onCopy()}>
                  <Copy size={13} aria-hidden /> Копировать JSON
                </Menu.Item>
                <Menu.Item className="menu-item" onClick={() => setJsonDialogOpen(true)}>
                  <FileBraces size={13} aria-hidden /> Посмотреть JSON…
                </Menu.Item>
                <Menu.Separator className="menu-sep" />
                <Menu.Item className="menu-item" onClick={() => setHelpOpen(true)}>
                  <Keyboard size={13} aria-hidden /> Клавиши и жесты
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        <button
          className="btn inspector-toggle"
          onClick={toggleInspector}
          aria-pressed={inspectorVisible}
          aria-label={inspectorVisible ? "Скрыть правую панель" : "Показать правую панель"}
          title={inspectorVisible ? "Скрыть правую панель" : "Показать правую панель"}
        >
          {inspectorVisible ? <PanelRightClose size={14} aria-hidden /> : <PanelRightOpen size={14} aria-hidden />}
          Инспектор
        </button>
      </div>
    </header>
  );
}
