import { Dialog } from "@base-ui/react/dialog";
import { useMemo, type ReactElement } from "react";
import { Copy, Download, X } from "../../../shared/icons";
import { useExport } from "../hooks/useExport";
import { useMapStore } from "../model/mapStore";
import { notify } from "./Toasts";

/**
 * Read-only viewer for the exported JSON schema with copy/download actions.
 * @returns the dialog (portalled), open state driven by the store
 */
export function JsonDialog(): ReactElement {
  const open = useMapStore((s) => s.jsonDialogOpen);
  const setOpen = useMapStore((s) => s.setJsonDialogOpen);
  const edges = useMapStore((s) => s.edges);
  const { payloadText, downloadJSON, copyJSON } = useExport();
  const text = useMemo(() => {
    void edges; // refresh trigger: rebuild when the graph changes while open
    return open ? payloadText() : "";
  }, [open, payloadText, edges]);

  const onCopy = async (): Promise<void> => {
    const copied = await copyJSON();
    notify(copied ? "JSON скопирован в буфер обмена" : "Не удалось скопировать JSON");
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dlg-backdrop" />
        <Dialog.Popup className="dlg-popup json-dlg">
          <div className="dlg-head">
            <div>
              <div className="mono-label">// EXPORT</div>
              <Dialog.Title className="dlg-title">Схема раздела X · JSON</Dialog.Title>
            </div>
            <div className="dlg-actions">
              <button className="btn" onClick={() => void onCopy()}>
                <Copy size={13} aria-hidden /> Копировать
              </button>
              <button className="btn btn-primary" onClick={downloadJSON}>
                <Download size={13} aria-hidden /> Скачать
              </button>
              <Dialog.Close className="btn btn-ghost dlg-x" aria-label="Закрыть">
                <X size={14} aria-hidden />
              </Dialog.Close>
            </div>
          </div>
          <Dialog.Description className="dlg-desc">
            Актуальное состояние карты: экраны, поля с портами, маршруты сущностей и связи поле → поле с текущими
            позициями узлов.
          </Dialog.Description>
          <pre className="json-pre" tabIndex={0}>
            {text}
          </pre>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
