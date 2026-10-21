import { Toast } from "@base-ui/react/toast";
import type { ReactElement, ReactNode } from "react";
import { X } from "../../../shared/icons";

/** Global toast manager: `notify()` works from anywhere, outside React too. */
export const toastManager = Toast.createToastManager();

/**
 * Queue a toast notification.
 * @param title - short headline
 * @param description - optional details line
 */
export function notify(title: string, description?: string): void {
  toastManager.add({ title, description });
}

function ToastList(): ReactElement {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast} className="toast">
          <Toast.Content className="toast-content">
            <div className="toast-text">
              <Toast.Title className="toast-title" />
              <Toast.Description className="toast-desc" />
            </div>
            <Toast.Close className="toast-close" aria-label="Закрыть">
              <X size={12} aria-hidden />
            </Toast.Close>
          </Toast.Content>
        </Toast.Root>
      ))}
    </>
  );
}

/**
 * Toast provider + viewport wrapping the app.
 * @param props - app content
 * @returns provider tree with the toast viewport portal
 */
export function ToastHost({ children }: { children: ReactNode }): ReactElement {
  return (
    <Toast.Provider toastManager={toastManager} timeout={3200} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="toast-viewport">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
