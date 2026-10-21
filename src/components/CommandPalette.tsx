import { Dialog } from "@base-ui/react/dialog";
import { Command } from "cmdk";
import type { ReactElement } from "react";
import { ENTITY_META } from "../data/entities";
import { SCREENS } from "../data/screens";
import { STATUS } from "../data/status";
import { useExport } from "../hooks/useExport";
import { useMapStore } from "../store/mapStore";
import {
  Copy,
  Crosshair,
  Download,
  FileBraces,
  Keyboard,
  Network,
  Redo2,
  RotateCcw,
  Search,
  Star,
  Undo2,
  Waypoints,
  type LucideIcon,
} from "./icons";
import { notify } from "./Toasts";

const ENTITY_KEYS = Object.keys(ENTITY_META);

interface PaletteAction {
  value: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
}

/**
 * Ctrl+K command palette (cmdk inside a Base UI dialog): screens, fields,
 * entity routes and map actions, all dispatched to the store.
 * @returns the palette dialog
 */
export function CommandPalette(): ReactElement {
  const open = useMapStore((s) => s.paletteOpen);
  const setOpen = useMapStore((s) => s.setPaletteOpen);
  const focusScreen = useMapStore((s) => s.focusScreen);
  const togglePin = useMapStore((s) => s.togglePin);
  const setPinnedEntity = useMapStore((s) => s.setPinnedEntity);
  const runElk = useMapStore((s) => s.runElk);
  const resetMap = useMapStore((s) => s.resetMap);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const setJsonDialogOpen = useMapStore((s) => s.setJsonDialogOpen);
  const setHelpOpen = useMapStore((s) => s.setHelpOpen);
  const { downloadJSON, copyJSON } = useExport();
  const close = (): void => setOpen(false);
  const actions: PaletteAction[] = [
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
      run: () => void copyJSON().then(() => notify("JSON скопирован в буфер обмена")),
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

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dlg-backdrop" />
        <Dialog.Popup className="pal-popup" aria-label="Командная палитра">
          <Command className="cmdk" label="Команды карты экранов" loop>
            <div className="cmdk-input-wrap">
              <Search size={14} aria-hidden />
              <Command.Input className="cmdk-input" placeholder="Экран, поле, сущность или действие…" autoFocus />
              <kbd>esc</kbd>
            </div>
            <Command.List className="cmdk-list">
              <Command.Empty className="cmdk-empty">Ничего не найдено</Command.Empty>

              <Command.Group heading="Экраны" className="cmdk-group">
                {SCREENS.map((s) => (
                  <Command.Item
                    key={s.id}
                    className="cmdk-item"
                    value={`экран screen ${s.title} ${s.route} ${s.code}`}
                    onSelect={() => {
                      focusScreen(s.id);
                      close();
                    }}
                  >
                    <Crosshair size={13} aria-hidden />
                    <span className="mono cmdk-dim">{s.code}</span>
                    {s.title}
                    {s.hub ? <Star size={10} fill="currentColor" aria-hidden /> : null}
                    <span className="cmdk-note mono">{s.route}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Поля" className="cmdk-group">
                {SCREENS.flatMap((s) =>
                  s.fields.map((f) => (
                    <Command.Item
                      key={`${s.id}:${f.entity}`}
                      className="cmdk-item"
                      value={`поле field ${f.name} ${f.label} ${f.entity} ${s.title}`}
                      onSelect={() => {
                        setPinnedEntity(f.entity);
                        focusScreen(s.id);
                        close();
                      }}
                    >
                      <span className="dot" style={{ background: STATUS[f.status].color }} />
                      {f.label}
                      <span className="mono cmdk-dim">
                        {f.name}: {f.type}
                      </span>
                      <span className="cmdk-note">{s.title}</span>
                    </Command.Item>
                  )),
                )}
              </Command.Group>

              <Command.Group heading="Сущности · маршруты" className="cmdk-group">
                {ENTITY_KEYS.map((key) => (
                  <Command.Item
                    key={key}
                    className="cmdk-item"
                    value={`сущность маршрут entity route ${key} ${ENTITY_META[key].label}`}
                    onSelect={() => {
                      togglePin(key);
                      close();
                    }}
                  >
                    <Waypoints size={13} aria-hidden />
                    <span className="mono">{key}</span>
                    {ENTITY_META[key].label}
                    <span className="cmdk-note">закрепить маршрут</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Действия" className="cmdk-group">
                {actions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Command.Item
                      key={action.label}
                      className="cmdk-item"
                      value={action.value}
                      onSelect={() => {
                        action.run();
                        close();
                      }}
                    >
                      <ActionIcon size={13} aria-hidden /> {action.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
