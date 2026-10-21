import type { ReactElement } from "react";
import { ScreenMapPage } from "../features/screen-map/ScreenMapPage";

/**
 * Application composition root. The product UI lives in the
 * screen-map feature; this shell stays intentionally thin.
 * @returns the application page
 */
export default function App(): ReactElement {
  return <ScreenMapPage />;
}
