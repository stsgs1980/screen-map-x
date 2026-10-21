import type { EdgeDef } from "./types";

const d = (entity: string, from: string, to: string, note: string): EdgeDef => ({
  id: `e-${entity}-${from}-${to}`,
  entity,
  from: { screen: from, entity },
  to: { screen: to, entity },
  note,
});

/** Field-to-field entity hand-offs between screens (data-flow, not buttons). */
export const EDGE_DEFS: EdgeDef[] = [
  d("invoice", "invoices", "hub", "выбранный счёт закрепляется в обзоре"),
  d("invoice", "hub", "details", "переход в карточку по invoice_id"),
  d("invoice", "invoices", "create", "счёт-основание для нового платежа"),
  d("invoice", "details", "receipts", "документы по счёту платежа"),
  d("payer", "create", "hub", "плательщик после создания платежа"),
  d("payer", "hub", "confirm", "сверка плательщика перед подтверждением"),
  d("payer", "hub", "invoices", "фильтр списка счетов по плательщику"),
  d("amount", "create", "confirm", "сумма к подтверждению"),
  d("amount", "confirm", "hub", "подтверждённая сумма в обзоре"),
  d("amount", "hub", "details", "сумма в карточке платежа"),
  d("payment", "confirm", "hub", "созданный платёж возвращается в хаб"),
  d("payment", "hub", "details", "открыть карточку платежа"),
  d("payment", "hub", "receipts", "чек по платежу из обзора"),
  d("payment", "hub", "refunds", "возврат по платежу из обзора"),
  d("receipt", "details", "receipts", "чек из карточки платежа"),
  d("receipt", "hub", "receipts", "все чеки раздела из хаба"),
  d("refund", "hub", "refunds", "статус возврата из обзора"),
  d("method", "create", "confirm", "способ оплаты на шаге подтверждения"),
];

/**
 * Unique id for a manual edge: the semantic base id, plus a counter when the
 * base is already taken. Parallel spokes therefore coexist instead of the
 * second one being silently dropped.
 * @param defs - existing semantic edges
 * @param entity - entity key
 * @param from - source screen id
 * @param to - target screen id
 * @returns an id that no existing edge uses
 */
export const nextEdgeId = (defs: EdgeDef[], entity: string, from: string, to: string): string => {
  const base = `e-${entity}-${from}-${to}`;
  let id = base;
  let attempt = 0;
  while (defs.some((edge) => edge.id === id)) {
    attempt += 1;
    id = `${base}-${attempt}`;
  }
  return id;
};
