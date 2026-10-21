import type { StatusKey } from "./types";

/** Status palette of field states, exactly as specced. */
export const STATUS: Record<StatusKey, { label: string; ru: string; color: string }> = {
  new: { label: "new", ru: "новый", color: "#A78BFA" },
  sent: { label: "sent", ru: "отправлен", color: "#66D97A" },
  pending: { label: "pending", ru: "ожидает", color: "#E6D24F" },
  failed: { label: "failed", ru: "ошибка", color: "#F0788A" },
  none: { label: "no status", ru: "без статуса", color: "#3D3D3D" },
};
export const STATUS_KEYS = Object.keys(STATUS) as StatusKey[];
