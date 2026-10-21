import { createContext } from "react";
import type { StatusKey } from "./data/schema";

export interface MapCtxValue {
  /** entity whose whole route is lit (hover ?? pinned) */
  activeEntity: string | null;
  setHoverEntity: (e: string | null) => void;
  pinnedEntity: string | null;
  togglePin: (e: string) => void;
  statusFilter: StatusKey | null;
  setStatusFilter: (s: StatusKey | null) => void;
}

export const MapContext = createContext<MapCtxValue>({
  activeEntity: null,
  setHoverEntity: () => {},
  pinnedEntity: null,
  togglePin: () => {},
  statusFilter: null,
  setStatusFilter: () => {},
});
