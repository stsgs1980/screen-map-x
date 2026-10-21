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

/** Store commands the palette exposes, already wired to user feedback. */
interface PaletteCommands {
  centerMap: () => void;
  toggleInspector: () => void;
  runElk: () => void;
  resetMap: () => void;
  undo: () => void;
  redo: () => void;
  downloadJSON: () => void;
  copyJSON: () => void;
  showJSON: () => void;
  showHelp: () => void;
}

/**
 * Collect the store commands the palette needs, with the async ones already
 * reporting their outcome to the user.
 * @returns the wired commands
 */
function usePaletteCommands(): PaletteCommands {
  const centerMap = useMapStore((s) => s.centerMap);
  const toggleInspector = useMapStore((s) => s.toggleInspector);
  const runElk = useMapStore((s) => s.runElk);
  const resetMap = useMapStore((s) => s.resetMap);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const setJsonDialogOpen = useMapStore((s) => s.setJsonDialogOpen);
  const setHelpOpen = useMapStore((s) => s.setHelpOpen);
  const { downloadJSON, copyJSON } = useExport();

  return {
    centerMap,
    toggleInspector,
    runElk: () => {
      void runElk().then((result) => {
        if (!result.ok) notify(result.reason);
      });
    },
    resetMap,
    undo,
    redo,
    downloadJSON,
    copyJSON: () => {
      void copyJSON().then((copied) =>
        notify(copied ? "JSON скопирован в буфер обмена" : "Не удалось скопировать JSON"),
      );
    },
    showJSON: () => setJsonDialogOpen(true),
    showHelp: () => setHelpOpen(true),
  };
}

/**
 * View and layout commands of the palette.
 * @param commands - wired store commands
 * @param inspectorVisible - whether the right panel is currently shown
 * @returns palette actions in display order
 */
function mapCommands(commands: PaletteCommands, inspectorVisible: boolean): PaletteAction[] {
  return [
    {
      value: "центр центрировать вписать карту fit view center",
      label: "Центрировать карту",
      icon: Crosshair,
      run: commands.centerMap,
    },
    {
      value: "инспектор правая панель скрыть показать inspector panel",
      label: inspectorVisible ? "Скрыть правую панель" : "Показать правую панель",
      icon: inspectorVisible ? PanelRightClose : PanelRightOpen,
      run: commands.toggleInspector,
    },
    {
      value: "elk раскладка layered layout",
      label: "ELK · layered-раскладка",
      icon: Network,
      run: commands.runElk,
    },
    { value: "сброс хаб исходная схема reset", label: "Сброс · хаб в центре", icon: RotateCcw, run: commands.resetMap },
    { value: "отменить undo", label: "Отменить", icon: Undo2, run: commands.undo },
    { value: "повторить redo", label: "Повторить", icon: Redo2, run: commands.redo },
  ];
}

/**
 * Export and help commands of the palette.
 * @param commands - wired store commands
 * @returns palette actions in display order
 */
function exportCommands(commands: PaletteCommands): PaletteAction[] {
  return [
    { value: "скачать экспорт json скачать", label: "Скачать JSON", icon: Download, run: commands.downloadJSON },
    { value: "копировать json буфер copy", label: "Копировать JSON", icon: Copy, run: commands.copyJSON },
    { value: "посмотреть json просмотр view", label: "Посмотреть JSON…", icon: FileBraces, run: commands.showJSON },
    {
      value: "клавиши справка помощь help shortcuts",
      label: "Клавиши и жесты",
      icon: Keyboard,
      run: commands.showHelp,
    },
  ];
}

/**
 * Build the command palette's action group from current store state.
 * @returns palette actions in display order
 */
export function usePaletteActions(): PaletteAction[] {
  const commands = usePaletteCommands();
  const inspectorVisible = useMapStore((s) => s.inspectorVisible);

  return [...mapCommands(commands, inspectorVisible), ...exportCommands(commands)];
}
