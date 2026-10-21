import { Dialog } from "@base-ui/react/dialog";
import type { ReactElement } from "react";
import { X } from "../../../shared/icons";
import { useMapStore } from "../model/mapStore";

const ROWS: [string, string][] = [
  ["Ctrl+K", "командная палитра: экраны, поля, сущности, действия"],
  ["Ctrl+Z / Ctrl+Shift+Z", "отмена / повтор (перетаскивание, связи, раскладки)"],
  ["Hover по полю", "подсветить весь маршрут сущности, остальное затемняется"],
  ["Клик по сущности", "закрепить (pin) подсветку маршрута"],
  ["Клик по экрану", "спецификация: роут, API, состояния, связи"],
  ["Правый клик", "контекстное меню экрана или связи"],
  ["Drag от порта", "новая связь поле -> поле"],
  ["Delete", "удалить выбранную связь"],
  ["Drag карточки", "перестановка по сетке 10 px, линии следуют за полями"],
  ["Клик по холсту", "снять выбор и закрепление"],
  ["Центр", "вписать всю карту и центрировать холст"],
  ["Инспектор", "скрыть или показать правую панель"],
];

/**
 * Keyboard and interaction reference dialog.
 * @returns the dialog (portalled), open state driven by the store
 */
export function HelpDialog(): ReactElement {
  const open = useMapStore((s) => s.helpOpen);
  const setOpen = useMapStore((s) => s.setHelpOpen);
  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dlg-backdrop" />
        <Dialog.Popup className="dlg-popup help-dlg">
          <div className="dlg-head">
            <div>
              <div className="mono-label">// HELP</div>
              <Dialog.Title className="dlg-title">Клавиши и жесты</Dialog.Title>
            </div>
            <Dialog.Close className="btn btn-ghost dlg-x" aria-label="Закрыть">
              <X size={14} aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="dlg-desc">
            Карта редактируема: связи тянутся от портов полей, всё остальное — ниже.
          </Dialog.Description>
          <dl className="help-list">
            {ROWS.map(([key, text]) => (
              <div className="help-row" key={key}>
                <dt>
                  <kbd>{key}</kbd>
                </dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
