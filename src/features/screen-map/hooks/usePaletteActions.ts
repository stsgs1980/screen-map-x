import {
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
  Undo2,
  type LucideIcon,
} from "../../../shared/icons";
import { useMapStore } from "../model/mapStore";
import { notify } from "../ui/Toasts";
import { useExport } from "./useExport";

/** One executable command-palette action. */
export interface PaletteAction {
  value: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
}

/**
 * Build the command palette's action group from current store state.
 * @returns palette actions in display order
 */
export function usePaletteActions(): PaletteAction[] {
  const runElk = useMapStore((s) => s.runElk);
  const resetMap = useMapStore((s) => s.resetMap);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const setJsonDialogOpen = useMapStore((s) => s.setJsonDialogOpen);
  const setHelpOpen = useMapStore((s) => s.setHelpOpen);
  const inspectorVisible = useMapStore((s) => s.inspectorVisible);
  const toggleInspector = useMapStore((s) => s.toggleInspector);
  const centerMap = useMapStore((s) => s.centerMap);
  const { downloadJSON, copyJSON } = useExport();

  return [
    {
      value: "центр центрировать вписать карту fit view center",
      label: "Центрировать карту",
      icon: Crosshair,
      run: centerMap,
    },
    {
      value: "инспектор правая панель скрыть показать inspector panel",
      label: inspectorVisible ? "Скрыть правую панель" : "Показать правую панель",
      icon: inspectorVisible ? PanelRightClose : PanelRightOpen,
      run: toggleInspector,
    },
    {
      value: "elk раскладка layered layout",
      label: "ELK · layered-раскладка",
      icon: Network,
      run: () => void runElk(),
    },
    { value: "сброс хаб исходная схема reset", label: "Сброс · хаб в центре", icon: RotateCcw, run: resetMap },
    { value: "отменить undo", label: "Отменить", icon: Undo2, run: undo },
    { value: "повторить redo", label: "Повторить", icon: Redo2, run: redo },
    { value: "скачать экспорт json скачать", label: "Скачать JSON", icon: Download, run: downloadJSON },
    {
      value: "копировать json буфер copy",
      label: "Копировать JSON",
      icon: Copy,
      run: () =>
        void copyJSON().then((copied) =>
          notify(copied ? "JSON скопирован в буфер обмена" : "Не удалось скопировать JSON"),
        ),
    },
    {
      value: "посмотреть json просмотр view",
      label: "Посмотреть JSON…",
      icon: FileBraces,
      run: () => setJsonDialogOpen(true),
    },
    {
      value: "клавиши справка помощь help shortcuts",
      label: "Клавиши и жесты",
      icon: Keyboard,
      run: () => setHelpOpen(true),
    },
  ];
}
