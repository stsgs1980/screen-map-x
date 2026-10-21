import type { IconName } from "./types";

/** Entities that travel between screens as field hand-offs. */
export const ENTITY_META: Record<string, { label: string; icon: IconName }> = {
  invoice: { label: "Счёт", icon: "doc" },
  payer: { label: "Плательщик", icon: "user" },
  amount: { label: "Сумма", icon: "money" },
  due_date: { label: "Срок оплаты", icon: "calendar" },
  method: { label: "Способ оплаты", icon: "card" },
  payment: { label: "Платёж", icon: "swap" },
  receipt: { label: "Чек", icon: "receipt" },
  refund: { label: "Возврат", icon: "refund" },
  code: { label: "Код подтверждения", icon: "code" },
  reason: { label: "Причина возврата", icon: "text" },
};
