/**
 * Source of truth for the Section X screen map.
 *
 * Nodes  = screens (`card/screen`)
 * Rows   = fields  (`card/field`) — every field carries ONE entity
 * Edges  = entity hand-offs field -> field (never card -> card),
 *          so connectors stay glued to fields when cards are rearranged.
 *
 * This module is intentionally free of runtime React Flow imports
 * (type-only) so `npm run export:schema` can run it in Node/tsx.
 */
import type { Node } from "@xyflow/react";

/* ------------------------------------------------------------------ spec */
export const CANVAS = { width: 1200, height: 900, bg: "#111", grid: 10 } as const;
export const SECTION_PATH = "РАЗДЕЛ X / ПЛАТЕЖИ";

/** card/screen geometry — locked to the spec */
export const NODE_W = 232;
export const HEAD_H = 40; // header
export const ROW_H = 23; // each field row
export const SKEL_H = 30; // optional skeleton block
export const CHROME_H = 13; // chrome strip
export const PORT_SIZE = 5; // port dots
export const EDGE_STYLE = {
  routing: "orthogonal",
  dash: "3 4",
  color: "#7C7C7C",
  cornerRadius: 8, // 7–9 px
} as const;
export const ELK_OPTIONS = { algorithm: "layered", direction: "DOWN", edgeRouting: "ORTHOGONAL" } as const;

/* --------------------------------------------------------------- statuses */
export type StatusKey = "new" | "sent" | "pending" | "failed" | "none";
export const STATUS: Record<StatusKey, { label: string; ru: string; color: string }> = {
  new: { label: "new", ru: "новый", color: "#A78BFA" },
  sent: { label: "sent", ru: "отправлен", color: "#66D97A" },
  pending: { label: "pending", ru: "ожидает", color: "#E6D24F" },
  failed: { label: "failed", ru: "ошибка", color: "#F0788A" },
  none: { label: "no status", ru: "без статуса", color: "#3D3D3D" },
};
export const STATUS_KEYS = Object.keys(STATUS) as StatusKey[];

/* --------------------------------------------------------------- entities */
export type IconName = "doc" | "user" | "money" | "calendar" | "card" | "swap" | "receipt" | "refund" | "code" | "text";

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

/* ----------------------------------------------------------------- fields */
export interface FieldDef {
  /** entity key — unique within a screen, so it doubles as the field key */
  entity: string;
  label: string;
  /** API/DB field name + type, shown in the inspector spec */
  name: string;
  type: string;
  status: StatusKey;
}

export interface ScreenDef {
  id: string;
  /** signature like `// 02 / A` */
  code: string;
  title: string;
  route: string;
  description: string;
  api: { method: string; path: string }[];
  states: string[];
  skeleton?: boolean;
  hub?: boolean;
  /** initial position — hub in the centre, satellites on the edges */
  position: { x: number; y: number };
  fields: FieldDef[];
}

export const screenHeight = (s: ScreenDef) => HEAD_H + s.fields.length * ROW_H + (s.skeleton ? SKEL_H : 0) + CHROME_H;

/** global field id, e.g. `hub.invoice` */
export const fieldId = (screen: string, entity: string) => `${screen}.${entity}`;

/** port (Handle) id — ports are separate child elements of a field row */
export type Side = "L" | "R";
export const portId = (fId: string, side: Side, kind: "in" | "out") => `${fId}|${side}|${kind}`;

/* ----------------------------------------------------------------- screens */
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

export const SCREEN_BY_ID: Record<string, ScreenDef> = Object.fromEntries(SCREENS.map((s) => [s.id, s]));
export const FIELD_OF = (screen: string, entity: string): FieldDef | undefined =>
  SCREEN_BY_ID[screen]?.fields.find((f) => f.entity === entity);
export const initialPositions = (): Record<string, { x: number; y: number }> =>
  Object.fromEntries(SCREENS.map((s) => [s.id, { ...s.position }]));

/* ------------------------------------------------------------------- edges */
/** A field -> field hand-off of one entity. Directions are data-flow, not buttons. */
export interface EdgeDef {
  id: string;
  entity: string;
  from: { screen: string; entity: string };
  to: { screen: string; entity: string };
  note: string;
}

const d = (entity: string, from: string, to: string, note: string): EdgeDef => ({
  id: `e-${entity}-${from}-${to}`,
  entity,
  from: { screen: from, entity },
  to: { screen: to, entity },
  note,
});

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

/* ------------------------------------------------- React Flow data shapes */
export interface ScreenNodeData {
  screen: ScreenDef;
  [key: string]: unknown;
}
export type ScreenFlowNode = Node<ScreenNodeData, "screen">;

export interface OrthData {
  entity: string;
  note: string;
  offset: number;
  from: { screen: string; entity: string };
  to: { screen: string; entity: string };
  highlight?: boolean;
  dimmed?: boolean;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ export */
export function buildExport(
  positions: Record<string, { x: number; y: number }>,
  defs: EdgeDef[],
  screens: ScreenDef[] = SCREENS,
) {
  const entities = Object.entries(ENTITY_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    icon: meta.icon,
    fields: screens.flatMap((s) =>
      s.fields
        .filter((f) => f.entity === key)
        .map((f) => ({ ref: fieldId(s.id, key), screen: s.id, name: f.name, type: f.type, status: f.status })),
    ),
    route: defs.filter((e) => e.entity === key).map((e) => e.id),
  }));

  return {
    meta: {
      section: "X",
      path: SECTION_PATH,
      title: "Section X — screen map",
      exportedAt: new Date().toISOString(),
      stack: { graph: "React Flow (@xyflow/react)", layout: { engine: "elkjs", ...ELK_OPTIONS } },
      canvas: { ...CANVAS },
      components: {
        "card/screen": { width: NODE_W, header: HEAD_H, row: ROW_H, skeleton: SKEL_H, chrome: CHROME_H },
        "card/field": { icon: 12, port: PORT_SIZE },
      },
      edgeStyle: { ...EDGE_STYLE, binding: "field->field" },
      statusPalette: Object.fromEntries(STATUS_KEYS.map((k) => [STATUS[k].label, STATUS[k].color])),
      caption: { font: "mono 10px", letterSpacing: ".11em", color: "#5A5A5A" },
      counts: {
        screens: screens.length,
        fields: screens.reduce((n, s) => n + s.fields.length, 0),
        edges: defs.length,
        entities: entities.length,
      },
    },
    screens: screens.map((s) => ({
      id: s.id,
      code: s.code,
      title: s.title,
      route: s.route,
      hub: !!s.hub,
      skeleton: !!s.skeleton,
      position: positions[s.id] ?? s.position,
      size: { width: NODE_W, height: screenHeight(s) },
      description: s.description,
      api: s.api,
      states: s.states,
      fields: s.fields.map((f) => ({
        id: fieldId(s.id, f.entity),
        entity: f.entity,
        label: f.label,
        name: f.name,
        type: f.type,
        status: f.status,
        statusColor: STATUS[f.status].color,
        icon: ENTITY_META[f.entity]?.icon,
        ports: ["L", "R"].flatMap((side) =>
          (["in", "out"] as const).map((kind) => ({
            id: portId(fieldId(s.id, f.entity), side as Side, kind),
            side,
            kind,
          })),
        ),
      })),
    })),
    entities,
    edges: defs.map((e) => ({
      id: e.id,
      entity: e.entity,
      note: e.note,
      from: { screen: e.from.screen, field: fieldId(e.from.screen, e.from.entity) },
      to: { screen: e.to.screen, field: fieldId(e.to.screen, e.to.entity) },
    })),
  };
}
