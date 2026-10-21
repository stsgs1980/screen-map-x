import { CHROME_H, HEAD_H, ROW_H, SKEL_H } from "./constants";
import type { FieldDef, ScreenDef } from "./types";

/**
 * Card height from the locked parts: header + rows + optional skeleton + chrome.
 * @param s - screen definition
 * @returns height in pixels
 */
export const screenHeight = (s: ScreenDef): number =>
  HEAD_H + s.fields.length * ROW_H + (s.skeleton ? SKEL_H : 0) + CHROME_H;

/** The seven screens of section X: hub in the centre, satellites on the edges. */
export const SCREENS: ScreenDef[] = [
  {
    id: "hub",
    code: "// 02 / A",
    title: "Обзор · хаб раздела",
    route: "/x",
    description:
      "Центральный экран раздела: агрегирует платежи, счета и возвраты. Все переходы сателлитов проходят через сущности хаба.",
    api: [
      { method: "GET", path: "/api/x/overview" },
      { method: "GET", path: "/api/x/overview/counters" },
    ],
    states: ["loading · skeleton", "ready", "partial", "error"],
    hub: true,
    position: { x: 484, y: 352 },
    fields: [
      { entity: "payment", label: "Платёж", name: "payment_id", type: "uuid", status: "pending" },
      { entity: "invoice", label: "Счёт", name: "invoice_id", type: "uuid", status: "sent" },
      { entity: "payer", label: "Плательщик", name: "payer_id", type: "uuid", status: "sent" },
      { entity: "amount", label: "Сумма", name: "amount", type: "money", status: "none" },
      { entity: "receipt", label: "Чек", name: "receipt_id", type: "uuid", status: "sent" },
      { entity: "refund", label: "Возврат", name: "refund_id", type: "uuid", status: "failed" },
    ],
  },
  {
    id: "invoices",
    code: "// 01 / A",
    title: "Список счетов",
    route: "/x/invoices",
    description: "Реестр выставленных счетов. Выбор счёта — точка входа в новый платёж и в хаб.",
    api: [
      { method: "GET", path: "/api/x/invoices?status=&payer_id=" },
      { method: "GET", path: "/api/x/invoices/:id" },
    ],
    states: ["loading · skeleton", "empty", "error", "ready"],
    skeleton: true,
    position: { x: 24, y: 24 },
    fields: [
      { entity: "invoice", label: "Счёт", name: "invoice_id", type: "uuid", status: "sent" },
      { entity: "payer", label: "Плательщик", name: "payer_name", type: "string", status: "new" },
      { entity: "amount", label: "Сумма", name: "amount_total", type: "money", status: "none" },
      { entity: "due_date", label: "Срок", name: "due_date", type: "date", status: "pending" },
    ],
  },
  {
    id: "create",
    code: "// 03 / B",
    title: "Новый платёж",
    route: "/x/payments/new",
    description:
      "Форма создания платежа: плательщик, сумма и счёт-основание уходят на подтверждение как единый черновик.",
    api: [
      { method: "POST", path: "/api/x/payments" },
      { method: "GET", path: "/api/x/payers?query=" },
    ],
    states: ["editing", "validating", "submitting", "error"],
    position: { x: 944, y: 24 },
    fields: [
      { entity: "payer", label: "Плательщик", name: "payer_id", type: "uuid", status: "new" },
      { entity: "amount", label: "Сумма", name: "amount", type: "money", status: "new" },
      { entity: "invoice", label: "Счёт-основание", name: "invoice_id", type: "uuid", status: "pending" },
      { entity: "method", label: "Способ", name: "method", type: "enum", status: "none" },
    ],
  },
  {
    id: "details",
    code: "// 04 / C",
    title: "Карточка платежа",
    route: "/x/payments/:paymentId",
    description: "Детальный просмотр платежа: сумма, счёт-основание и связанный чек. Отсюда открываются документы.",
    api: [
      { method: "GET", path: "/api/x/payments/:id" },
      { method: "GET", path: "/api/x/payments/:id/receipt" },
    ],
    states: ["loading · skeleton", "ready", "not-found", "error"],
    skeleton: true,
    position: { x: 24, y: 360 },
    fields: [
      { entity: "payment", label: "Платёж", name: "payment_id", type: "uuid", status: "sent" },
      { entity: "invoice", label: "Счёт", name: "invoice_id", type: "uuid", status: "sent" },
      { entity: "amount", label: "Сумма", name: "amount", type: "money", status: "sent" },
      { entity: "receipt", label: "Чек", name: "receipt_id", type: "uuid", status: "pending" },
    ],
  },
  {
    id: "confirm",
    code: "// 05 / C",
    title: "Подтверждение",
    route: "/x/payments/:paymentId/confirm",
    description: "Сверка суммы и плательщика перед отправкой. Подтверждённый платёж возвращается в хаб.",
    api: [
      { method: "POST", path: "/api/x/payments/:id/confirm" },
      { method: "POST", path: "/api/x/payments/:id/code/resend" },
    ],
    states: ["awaiting-code", "checking", "expired", "error"],
    position: { x: 944, y: 360 },
    fields: [
      { entity: "payment", label: "Платёж", name: "payment_id", type: "uuid", status: "pending" },
      { entity: "amount", label: "Сумма", name: "amount", type: "money", status: "pending" },
      { entity: "payer", label: "Плательщик", name: "payer_id", type: "uuid", status: "pending" },
      { entity: "method", label: "Способ", name: "method", type: "enum", status: "none" },
      { entity: "code", label: "Код из SMS", name: "confirm_code", type: "string", status: "new" },
    ],
  },
  {
    id: "receipts",
    code: "// 06 / D",
    title: "Чеки и документы",
    route: "/x/receipts",
    description: "Архив чеков по платежам и счетам: просмотр, PDF, повторная отправка плательщику.",
    api: [
      { method: "GET", path: "/api/x/receipts?payment_id=&invoice_id=" },
      { method: "GET", path: "/api/x/receipts/:id/pdf" },
    ],
    states: ["loading · skeleton", "empty", "ready", "error"],
    position: { x: 24, y: 676 },
    fields: [
      { entity: "receipt", label: "Чек", name: "receipt_id", type: "uuid", status: "sent" },
      { entity: "invoice", label: "Счёт", name: "invoice_id", type: "uuid", status: "sent" },
      { entity: "payment", label: "Платёж", name: "payment_id", type: "uuid", status: "none" },
    ],
  },
  {
    id: "refunds",
    code: "// 07 / D",
    title: "Возвраты",
    route: "/x/refunds",
    description:
      "Возвраты по платежам: полный или частичный (сумма возврата редактируется локально), с обязательной причиной.",
    api: [
      { method: "GET", path: "/api/x/refunds" },
      { method: "POST", path: "/api/x/payments/:id/refund" },
    ],
    states: ["draft", "processing", "failed", "done"],
    position: { x: 944, y: 676 },
    fields: [
      { entity: "refund", label: "Возврат", name: "refund_id", type: "uuid", status: "failed" },
      { entity: "payment", label: "Платёж", name: "payment_id", type: "uuid", status: "failed" },
      { entity: "amount", label: "Сумма", name: "refund_amount", type: "money", status: "pending" },
      { entity: "reason", label: "Причина", name: "reason", type: "text", status: "new" },
    ],
  },
];

/** Screens indexed by id. */
export const SCREEN_BY_ID: Record<string, ScreenDef> = Object.fromEntries(SCREENS.map((s) => [s.id, s]));

/**
 * Field of a screen by entity key.
 * @param screen - screen id
 * @param entity - entity key
 * @returns the field, if the screen carries the entity
 */
export const FIELD_OF = (screen: string, entity: string): FieldDef | undefined =>
  SCREEN_BY_ID[screen]?.fields.find((f) => f.entity === entity);

/**
 * Initial hub-and-satellites positions by screen id.
 * @returns position map
 */
export const initialPositions = (): Record<string, { x: number; y: number }> =>
  Object.fromEntries(SCREENS.map((s) => [s.id, { ...s.position }]));
