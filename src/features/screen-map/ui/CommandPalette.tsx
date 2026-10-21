import { Dialog } from "@base-ui/react/dialog";
import { Command } from "cmdk";
import type { ReactElement } from "react";
import { Crosshair, Search, Star, Waypoints } from "../../../shared/icons";
import { ENTITY_META } from "../data/entities";
import { SCREENS } from "../data/screens";
import { STATUS } from "../data/status";
import { usePaletteActions } from "../hooks/usePaletteActions";
import { useMapStore } from "../model/mapStore";

const ENTITY_KEYS = Object.keys(ENTITY_META);

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
  const actions = usePaletteActions();
  const close = (): void => setOpen(false);
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
                        togglePin(f.entity);
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
