# Дизайн-система экрана карты (направление B) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ввести слой CSS-токенов и перерисовать весь слой оформления экрана карты в
направлении B (слоёный продуктовый UI, slate-палитра, акцент indigo), не меняя
библиотеки, DOM-контракт и значения, зафиксированные спецификацией.

**Architecture:** Один новый файл `styles/tokens.css` с семантическими токенами и новый
юнит-тест `styles/tokens.test.ts`, который сверяет токены с TS-константами и с
экспортируемым JSON и запрещает сырые цвета вне `tokens.css`. Остальные 11 CSS-файлов
переписываются на токены без изменения имён классов. Инлайновые цвета в TSX уезжают
в CSS. React Flow темизуется штатными переменными `--xy-*`.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Base UI, React Flow (`@xyflow/react` 12),
cmdk, lucide-react, Vitest 5, Playwright 1.64, stylelint 17, prettier 3.

**Spec:** `docs/design/design-system.md`

**Commits:** по решению владельца коммиты не делаются. Вместо шага «Commit» каждый
задача заканчивается чекпоинтом из гейтов репозитория.

## Global Constraints

Каждое требование ниже действует для всех задач без исключений.

- Значения спецификации не меняются. Геометрия карточки: ширина 232, шапка 40,
  строка поля 23, скелетон 30, chrome-полоса 13, точка порта 5, иконка поля 12.
  Холст 1200×900, сетка 10, фон `#111`. Связь: orthogonal, dash `3 4`, цвет `#7C7C7C`,
  скругление 8. Подпись: mono 10px, tracking `.11em`, цвет `#5A5A5A`. Цвета статусов:
  `#A78BFA`, `#66D97A`, `#E6D24F`, `#F0788A`, `#3D3D3D`.
- Приглушение поля при фильтре равно ровно `opacity: 0.2`. Это проверяется e2e
  (`tests/e2e/screen-map.spec.ts`, строка 60), значение менять нельзя.
- `box-sizing: border-box` обязателен. Внутри `.scr` нельзя добавлять `gap`, лишние
  рамки или padding: высота карточки обязана остаться `40 + строки×23 + (скелетон? 30 : 0) + 13`.
- Никаких новых зависимостей. Base UI, React Flow, cmdk, lucide-react, Geist
  используются как есть.
- Токены — единственный источник визуальных значений. Сырых hex и `rgb(`/`rgba(`
  вне `styles/tokens.css` не остаётся.
- Имена классов и DOM-контракт не меняются. Добавляются только состояния и псевдоклассы.
- Тема только тёмная. Акцент — indigo `#6366f1`. Шкала шрифта: 11 / 12 / 13.5 / 16 px.
- Гейты, которые должны быть зелёными после каждой задачи: `npm run lint:css`,
  `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run lint:md`,
  `npm run check:docs`, `npm run check:file-length`, `npm run test`.

## Review Focus

Входы и режимы, которые спецификация подразумевает, но ни один тест задач не покрывает.
Для каждой строки тест добавлен в задачу, которой принадлежит код.

1. **Длинное название экрана в карточке шириной 232 px.** Разумный человек ожидает
   ellipsis, а не обрезку по краю и не рост карточки. → Task 3, e2e.
2. **Статус `none` (`#3D3D3D`) на поверхности карточки.** Контраст 1.6:1, точка
   практически не видна. Ожидание: точка различима. → Task 1, юнит-тест контраста.
3. **Клавиатурный фокус.** Сейчас не виден ни на одном интерактивном элементе.
   Ожидание: сфокусированный элемент показывает кольцо. → Task 2, e2e.
4. **Экспортный JSON разъезжается с тем, что нарисовано.** Ожидание: экспорт
   совпадает с закоммиченным образцом во всём, кроме `meta.exportedAt`.
   → Task 1, юнит-тест.
5. **React Flow рисует сетку и мини-карту дефолтами библиотеки, а не токенами.**
   Ожидание: stroke сетки равен `--grid-line`. → Task 4, e2e.

---

## Структура файлов

**Создаётся:**

- `src/features/screen-map/styles/tokens.css` — единственный источник визуальных значений.
- `src/features/screen-map/styles/tokens.test.ts` — сверка токенов с TS-константами и
  экспортом, запрет сырых цветов.

**Изменяется:**

- `src/features/screen-map/styles/index.css` — импорт `tokens.css` первым.
- `src/features/screen-map/styles/base.css` — reset, типографика, каркас, кнопки.
- `src/features/screen-map/styles/canvas.css` — панели, легенда, карточка экрана.
- `src/features/screen-map/styles/field.css` — строка поля, порты, скелетон, chrome.
- `src/features/screen-map/styles/react-flow.css` — `--xy-*`, контролы, мини-карта.
- `src/features/screen-map/styles/inspector.css` — панель инспектора.
- `src/features/screen-map/styles/inspector-rows.css` — строки инспектора.
- `src/features/screen-map/styles/primitives/popovers.css` — меню, тултип, preview-card, kbd.
- `src/features/screen-map/styles/primitives/dialogs.css` — диалоги.
- `src/features/screen-map/styles/primitives/palette.css` — командная палитра.
- `src/features/screen-map/styles/primitives/feedback.css` — тосты, скроллбар.
- `src/features/screen-map/ui/FieldRow.tsx` — порт и приглушение.
- `src/features/screen-map/ui/OrthEdge.tsx` — подсветка связи.
- `src/features/screen-map/ui/inspector/InspectorScreen.tsx` — запасной цвет статуса.
- `src/features/screen-map/ui/inspector/LinkRow.tsx` — запасной цвет.
- `src/features/screen-map/ScreenMapPage.tsx` — сетка и мини-карта.
- `tests/e2e/screen-map.spec.ts` — новые проверки фокуса, геометрии и сетки.

**Удаляется в финале:** `design.html`, `design/` — временный прототип направлений.

---

### Task 1: Слой токенов и тест согласованности

**Files:**

- Create: `src/features/screen-map/styles/tokens.css`
- Create: `src/features/screen-map/styles/tokens.test.ts`
- Modify: `src/features/screen-map/styles/index.css`

**Interfaces:**

- Consumes: `HEAD_H`, `ROW_H`, `SKEL_H`, `CHROME_H`, `PORT_SIZE`, `EDGE_STYLE` из
  `src/features/screen-map/data/constants.ts`; `STATUS` из `data/status.ts`;
  `buildExport`, `initialPositions`, `EDGE_DEFS`.
- Produces: набор CSS custom properties в `:root`; тест `tokens.test.ts`, который
  используют все последующие задачи как чекпоинт. Список файлов без сырых цветов
  живёт в тесте в массиве `TOKENIZED` и растёт от задачи к задаче.

- [ ] **Step 1: Написать падающий тест**

Создать `src/features/screen-map/styles/tokens.test.ts` с хелпером
`readTokens(file: string): Map<string, string>`, который читает CSS-файл через
`readFileSync(new URL(file, import.meta.url))` и разбирает строки вида `--name: value;`
регуляркой `/--([a-z0-9-]+)\s*:\s*([^;]+);/g`.

Тесты в этом файле:

- `readTokens` берёт файл из репозитория, а не из `node_modules`.
- «токены геометрии совпадают с константами»: `--head-h` = `40px` = `HEAD_H`,
  `--row-h` = `23px` = `ROW_H`, `--skel-h` = `30px` = `SKEL_H`,
  `--chrome-h` = `13px` = `CHROME_H`, `--port-size` = `5px` = `PORT_SIZE`.
- «токен размера иконки совпадает с экспортом»: `--icon-size` = `12px` =
  `buildExport(initialPositions(), EDGE_DEFS).meta.components["card/field"].icon`.
- «токены подписи совпадают с экспортом»: `--caption-size` = `10px` и
  `--caption-tracking` = `0.11em` против `meta.caption` (`font: "mono 10px"`,
  `letterSpacing: ".11em"`). Нормализация: у `em` отбрасывается ведущий ноль, дальше
  сравниваются числа.
- «токены связи совпадают с EDGE_STYLE»: `--edge-dash` = `3 4` = `EDGE_STYLE.dash`,
  `--r-edge` = `8px` и лежит в диапазоне 7–9.
- «цвета статусов в токенах совпадают с STATUS»: пять токенов `--status-new`,
  `--status-sent`, `--status-pending`, `--status-failed`, `--status-none` равны
  значениям `STATUS` из `data/status.ts` (регистр не важен, пробелы обрезаются).
- «экспорт совпадает с закоммиченным образцом»: читается
  `artifacts/section-x-screen-map.schema.json`, из обеих сторон удаляется
  `meta.exportedAt`, результаты сравниваются через `toEqual`.
- «контраст читаемых пар»: функция `contrast(hex1, hex2)` по формуле WCAG; проверяется
  `--fg` на `--bg-surface` ≥ 7, `--fg-muted` на `--bg-surface` ≥ 4.5,
  `--fg-subtle` на `--bg-surface` ≥ 3.
- «кольцо точки статуса различимо на всех поверхностях»: `--fg-subtle` (это цвет
  кольца точки) на `--bg-surface` ≥ 3 и на `--bg-sunken` ≥ 3. Именно кольцо делает
  статус `none` (`#3D3D3D`, 1.5:1) читаемым, поэтому проверка отдельная.
- «вне tokens.css нет сырых цветов»: для каждого файла из массива
  `const TOKENIZED = ["tokens.css"]` в содержимом не должно быть совпадений
  `/#[0-9a-f]{3,8}\b/i` и `/rgba?\(/i`.

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL — файл `styles/tokens.css` не существует, парсер бросает ошибку чтения.

- [ ] **Step 3: Создать `styles/tokens.css`**

Один блок `:root` с комментариями-секциями. Значения — из спецификации, раздел 5.2:

- Поверхности: `--bg-canvas` `#0b0d12`, `--bg-surface` `#151922`, `--bg-raised` `#1b202b`,
  `--bg-sunken` `#10131a`, `--bg-hover` `#1f2532`, `--bg-active` `#262d3c`,
  `--bg-accent` `#6366f1`, `--bg-accent-hover` `#5457e5`,
  `--bg-accent-soft` `rgb(99 102 241 / 12%)`, `--bg-glass` `rgb(27 32 43 / 88%)`.
- Текст: `--fg` `#e7ebf3`, `--fg-muted` `#97a0b3`, `--fg-subtle` `#6a7387`,
  `--fg-on-accent` `#fff`, `--fg-accent` `#818cf8`.
- Границы: `--border-subtle` `#1e2430`, `--border` `#2a3140`, `--border-strong` `#3a4256`,
  `--border-accent` `#6366f1`.
- Высота: `--shadow-card` `0 1px 2px rgb(0 0 0 / 30%), 0 8px 24px rgb(0 0 0 / 35%)`,
  `--shadow-popup` `0 2px 6px rgb(0 0 0 / 30%), 0 12px 32px rgb(0 0 0 / 45%)`,
  `--ring-inset` `inset 0 1px 0 rgb(255 255 255 / 5%)`.
- Радиусы: `--r-sm` `4px`, `--r-md` `8px`, `--r-lg` `12px`, `--r-xl` `16px`,
  `--r-pill` `999px`, `--r-edge` `8px`. `--r-edge` — зеркало `EDGE_STYLE.cornerRadius`:
  в CSS потребителя нет (радиус применяется в TS через `getSmoothStepPath`),
  значение проверяется тестом.
- Типографика: `--t-xs` `11px`, `--t-sm` `12px`, `--t-md` `13.5px`, `--t-lg` `16px`,
  `--t-xl` `20px`, `--caption-size` `10px`, `--caption-tracking` `0.11em`,
  `--caption-color` `#5A5A5A`.
- Геометрия: `--head-h` `40px`, `--row-h` `23px`, `--skel-h` `30px`, `--chrome-h` `13px`,
  `--port-size` `5px`, `--icon-size` `12px`.
- Отступы: `--sp-1` `4px`, `--sp-2` `8px`, `--sp-3` `12px`, `--sp-4` `16px`,
  `--sp-5` `20px`, `--sp-6` `24px`.
- Движение: `--dur-fast` `100ms`, `--dur-base` `160ms`, `--ease` `cubic-bezier(0.2, 0, 0, 1)`.
- Фокус и прозрачность: `--accent-focus` `#6366f1`,
  `--focus-ring` `0 0 0 2px var(--bg-canvas), 0 0 0 4px var(--accent-focus)`,
  `--opacity-dim` `0.2`, `--opacity-disabled` `0.5`.
- Наложения: `--overlay-scrim` `rgb(0 0 0 / 62%)`, `--overlay-soft` `rgb(255 255 255 / 6%)`,
  `--scrollbar-thumb` `#2a3140`, `--scrollbar-thumb-hover` `#3a4256`.
- React Flow: `--grid-line` `#141821`, `--connection-stroke` `#ededed`,
  `--edge-color` `#7C7C7C`, `--edge-dash` `3 4`, `--edge-hl` `#f2f2f2`,
  `--minimap-bg` `#141414`, `--minimap-mask` `rgb(60 60 60 / 60%)`,
  `--minimap-node` `#2e2e2e`, `--minimap-node-hub` `#5a5a5a`,
  `--control-bg` `#151922`, `--control-bg-hover` `#1f2532`, `--control-fg` `#97a0b3`,
  `--port-bg` `#10131a`, `--port-border` `#3a4256`.
- Статусы: `--status-new` `#a78bfa`, `--status-sent` `#66d97a`, `--status-pending` `#e6d24f`,
  `--status-failed` `#f0788a`, `--status-none` `#3d3d3d`.

Шрифты `--font-sans` и `--font-mono` переезжают из `base.css` сюда же, значения
прежние: `"Geist Sans", -apple-system, "Segoe UI", roboto, "Helvetica Neue", arial, sans-serif`
и `"Geist Mono", ui-monospace, "SF Mono", menlo, consolas, monospace`.

- [ ] **Step 4: Подключить токены**

В `styles/index.css` первой строкой добавить `@import "./tokens.css";`.

- [ ] **Step 5: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS, 10 тестов.

- [ ] **Step 6: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run test`
Expected: stylelint без замечаний, prettier «All matched files use Prettier code style!»,
vitest 37 существующих + 10 новых тестов.

---

### Task 2: `base.css` — каркас, типографика, кнопки

**Files:**

- Modify: `src/features/screen-map/styles/base.css`
- Modify: `src/features/screen-map/styles/tokens.test.ts` (список `TOKENIZED`)
- Modify: `tests/e2e/screen-map.spec.ts` (проверка фокуса)

**Interfaces:**

- Consumes: токены из Task 1.
- Produces: классы `.btn`, `.btn-primary`, `.btn-ghost`, `.pin-chip`, `.mono-label`,
  `.dot`, `.topbar`, `.canvas-frame` на токенах. Тест `tokens.test.ts` начинает
  проверять `base.css` на отсутствие сырых цветов.

- [ ] **Step 1: Добавить `base.css` в список `TOKENIZED`**

В `tokens.test.ts` массив становится `const TOKENIZED = ["tokens.css", "base.css"];`.
Тест «вне tokens.css нет сырых цветов» теперь проверяет и `base.css`.

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL на проверке `base.css` — в файле десятки hex-значений.

- [ ] **Step 3: Переписать `base.css` на токены**

Правила и их новые значения:

- `body` — фон `var(--bg-canvas)`, цвет `var(--fg)`, `font: var(--t-md)/1.45 var(--font-sans)`.
- `.mono-label` — размер `var(--caption-size)`, трекинг `var(--caption-tracking)`,
  цвет `var(--caption-color)`.
- `.dot` — 8×8 px вместо 6×6, `border: 1px solid var(--fg-subtle)`,
  `background` остаётся инлайном из цвета статуса. Обводка нужна, чтобы статус
  `none` (`#3D3D3D`, контраст 1.5:1) был различим на поверхности карточки.
  Цвет кольца `--fg-subtle` даёт 3.69:1 на `--bg-surface` и 3.89:1 на `--bg-sunken`
  (проверено тестом контраста).
- `.app-title` — `font-size: var(--t-lg)`.
- `.title-dim` — цвет `var(--fg-muted)`.
- `.counter` — размер `var(--t-sm)`, цвет `var(--fg-subtle)`.
- `.pin-chip` — фон `var(--bg-accent)`, цвет `var(--fg-on-accent)`, радиус `var(--r-pill)`,
  padding `var(--sp-1) var(--sp-2)`, размер `var(--t-sm)`.
- `.btn` — фон `var(--bg-surface)`, граница `var(--border)`, радиус `var(--r-md)`,
  цвет `var(--fg)`, размер `var(--t-sm)`, тень `var(--ring-inset)`,
  `transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease),
transform var(--dur-fast) var(--ease)`.
- `.btn:hover` — фон `var(--bg-hover)`, граница `var(--border-strong)`.
- `.btn:active` — `transform: translateY(1px)`.
- `.btn:focus-visible` — `outline: none`, `box-shadow: var(--focus-ring)`.
- `.btn-primary` — фон `var(--bg-accent)`, граница прозрачная, цвет `var(--fg-on-accent)`.
- `.btn-primary:hover` — фон `var(--bg-accent-hover)`.
- `.btn-ghost` — фон и граница прозрачные, цвет `var(--fg-muted)`.
- `.btn-ghost:hover` — фон `var(--bg-hover)`, цвет `var(--fg)`.
- `.btn:disabled` — `opacity: var(--opacity-disabled)`, `cursor: wait`.
- Блок уважения к настройке движения, добавляется в конец `base.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .scr,
  .fld,
  .btn,
  .leg-chip,
  .cmdk-item,
  .menu-item,
  .toast,
  .dlg-popup,
  .dlg-backdrop,
  .pal-popup,
  .react-flow__edge.edge-hl path.react-flow__edge-path,
  .skel span {
    animation: none !important;
    transition: none !important;
  }
}
```

- `.topbar` — фон `var(--bg-raised)`, нижняя граница `var(--border-subtle)`,
  padding `var(--sp-2) var(--sp-4)`, тень `var(--ring-inset)`.
- `.topbar-l` — `gap: var(--sp-4)`.
- `.canvas-scroll` — padding `var(--sp-4)`.
- `.canvas-frame` — граница `var(--border)`, радиус `var(--r-xl)`, тень `var(--shadow-card)`.
- Глобальный `* { box-sizing: border-box; }` и `html, body, #root { height: 100%; }`
  сохраняются.
- Блок `:root` с `--font-sans` и `--font-mono` удаляется — он теперь в `tokens.css`.

- [ ] **Step 4: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Добавить e2e-проверку видимости фокуса**

В `tests/e2e/screen-map.spec.ts` добавить тест «кнопка тулбара показывает кольцо фокуса».
Фокус ставится клавиатурой, потому что `:focus-visible` не срабатывает при
программной установке фокуса:

```ts
const toolbarBtn = page.locator(".toolbar .btn").first();
for (let i = 0; i < 12; i += 1) {
  if (await toolbarBtn.evaluate((el) => el === el.ownerDocument.activeElement)) break;
  await page.keyboard.press("Tab");
}
await expect(toolbarBtn).toBeFocused();
await expect(toolbarBtn).toHaveCSS("box-shadow", /rgb/);
```

`box-shadow` содержит `rgb(...)`, потому что кольцо фокуса — это
`var(--focus-ring)`, а не `outline`.

- [ ] **Step 6: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run lint && npm run test && npm run test:e2e`
Expected: все гейты зелёные, e2e 8 тестов (7 прежних + 1 новый).

---

### Task 3: `canvas.css` и `field.css` — карточка экрана

**Files:**

- Modify: `src/features/screen-map/styles/canvas.css`
- Modify: `src/features/screen-map/styles/field.css`
- Modify: `src/features/screen-map/styles/tokens.test.ts` (список `TOKENIZED`)
- Modify: `tests/e2e/screen-map.spec.ts` (проверка геометрии)

**Interfaces:**

- Consumes: токены из Task 1.
- Produces: классы `.scr`, `.scr-head`, `.scr-title`, `.fld`, `.port`, `.skel`, `.chrome`
  на токенах; высота карточки, совпадающая с экспортом.

- [ ] **Step 1: Добавить `canvas.css` и `field.css` в `TOKENIZED`**

`const TOKENIZED = ["tokens.css", "base.css", "canvas.css", "field.css"];`

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL на `canvas.css` и `field.css`.

- [ ] **Step 3: Переписать `canvas.css` на токены**

- `.panel-card` — фон `var(--bg-glass)`, граница `var(--border)`, радиус `var(--r-lg)`,
  padding `var(--sp-2) var(--sp-3)`, `backdrop-filter: blur(6px)`,
  тень `var(--shadow-popup), var(--ring-inset)`.
- `.canvas-sub` — размер `var(--t-xs)`, цвет `var(--fg-muted)`.
- `.legend` — `gap: var(--sp-2)`.
- `.leg-chip` — граница `var(--border)`, радиус `var(--r-pill)`, цвет `var(--fg-muted)`,
  padding `var(--sp-1) var(--sp-2)`, размер `var(--t-sm)`, переход на цвет и границу
  за `var(--dur-fast)`.
- `.leg-chip:hover` — граница `var(--border-strong)`, цвет `var(--fg)`.
- `.leg-chip[data-pressed]` — граница `var(--fg)`, цвет `var(--fg)`, фон `var(--bg-active)`.
- `.hints` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`, фон `var(--bg-glass)`,
  граница `var(--border-subtle)`, радиус `var(--r-pill)`.
- `.edge-chip` — фон `var(--bg-accent)`, цвет `var(--fg-on-accent)`, радиус `var(--r-pill)`,
  размер `var(--t-xs)`.
- `.scr` — фон `var(--bg-surface)`, граница `var(--border)`, радиус `var(--r-lg)`,
  тень `var(--shadow-card), var(--ring-inset)`, переход за `var(--dur-base)`.
- `.scr.dim` — `opacity: 0.2`, `filter: saturate(0.35)` сохраняются.
- `.scr.sel` — граница `var(--border-strong)`, тень `0 0 0 1px var(--fg), var(--shadow-card), var(--ring-inset)`.
- `.scr-head` — высота `var(--head-h)`, фон `var(--bg-raised)`, нижняя граница
  `var(--border-subtle)`, верхние радиусы `calc(var(--r-lg) - 1px)`.
- `.scr-head-l` — добавить `min-width: 0`, чтобы заголовок мог сжиматься.
- `.scr-title` — размер `var(--t-md)`, цвет `var(--fg)`, добавить
  `min-width: 0; overflow: hidden; text-overflow: ellipsis` — ширина карточки
  зафиксирована на 232 px, длинные названия должны уходить в ellipsis.
- `.hub-badge` — фон `var(--bg-accent)`, цвет `var(--fg-on-accent)`, радиус `var(--r-sm)`.
- `.scr-dots i` — 7×7 px вместо 5×5, `border: 1px solid var(--fg-subtle)`.
- `.legend-group` — `display: contents` без изменений.

- [ ] **Step 4: Переписать `field.css` на токены**

- `.fld` — высота `var(--row-h)`, `gap: var(--sp-2)`, padding `0 var(--sp-3)`,
  верхняя граница `var(--border-subtle)`, переход `background var(--dur-fast) var(--ease)`.
- `.fld svg` — `width: var(--icon-size); height: var(--icon-size)`, цвет `var(--fg-subtle)`.
- `.fld.on` — фон `var(--overlay-soft)`.
- `.fld.on svg` — цвет `var(--fg)`.
- `.fld-bar` — ширина 2 px, `background` остаётся инлайном из цвета статуса.
- `.fld-label` — размер `var(--t-sm)`, цвет `var(--fg)`.
- `.fld-ent` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.fld.on .fld-ent` — цвет `var(--fg-muted)`.
- `.react-flow__handle.port` — размер `var(--port-size)`, граница `var(--port-border)`,
  фон `var(--port-bg)`, переход за `var(--dur-fast)`.
- `.react-flow__handle.port:hover` — фон `var(--fg)`, граница `var(--fg)`.
- `.skel` — высота `var(--skel-h)`, верхняя граница `var(--border-subtle)`, `gap: 4px`.
- `.skel span` — фон `var(--bg-active)`, радиус 2 px, анимация `skel` сохраняется.
- `.chrome` — высота `var(--chrome-h)`, фон `var(--bg-sunken)`, верхняя граница
  `var(--border-subtle)`, нижние радиусы `calc(var(--r-lg) - 1px)`.
- `.chrome i` — фон `var(--border-strong)`.
- `.chrome-route` — размер 9 px, цвет `var(--fg-subtle)`.

- [ ] **Step 5: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 6: Добавить e2e-проверку геометрии карточки**

В `tests/e2e/screen-map.spec.ts` добавить тест «сумма высот частей карточки совпадает
с высотой из спецификации». Высота карточки приходит инлайном из `screenHeight(screen)`,
поэтому проверяется не сама высота, а согласие CSS с TS: внутри `page.evaluate` для
каждой `.scr` считается сумма `offsetHeight` шапки + всех `.fld` + `.skel` (если есть) +
`.chrome` и сравнивается с `offsetHeight` самой `.scr`. Расхождение больше 1 px —
падение теста. Так ловится появление лишнего `gap`, padding или рамки внутри карточки
(Review Focus 1).

- [ ] **Step 7: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run test && npm run test:e2e`
Expected: зелёные, e2e 9 тестов.

---

### Task 4: `react-flow.css` — тема библиотеки

**Files:**

- Modify: `src/features/screen-map/styles/react-flow.css`
- Modify: `src/features/screen-map/ScreenMapPage.tsx` (проп цвета сетки)
- Modify: `src/features/screen-map/styles/tokens.test.ts` (список `TOKENIZED`)
- Modify: `tests/e2e/screen-map.spec.ts` (проверка сетки)

**Interfaces:**

- Consumes: токены из Task 1.
- Produces: переменные `--xy-*` на `.react-flow`, из которых React Flow берёт цвета
  сетки, рёбер, мини-карты, контролов, атрибуции и портов.

- [ ] **Step 1: Добавить `react-flow.css` в `TOKENIZED`**

`const TOKENIZED = ["tokens.css", "base.css", "canvas.css", "field.css", "react-flow.css"];`

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL на `react-flow.css`.

- [ ] **Step 3: Переписать `react-flow.css`**

В блоке `.react-flow` задать штатные переменные темы React Flow:

- `--xy-background-pattern-color: var(--grid-line);`
- `--xy-edge-stroke: var(--edge-color);`
- `--xy-edge-stroke-selected: var(--edge-hl);`
- `--xy-connectionline-stroke: var(--connection-stroke);`
- `--xy-attribution-background-color: transparent;`
- `--xy-minimap-background-color: var(--minimap-bg);`
- `--xy-minimap-mask-background-color: var(--minimap-mask);`
- `--xy-minimap-node-background-color: var(--minimap-node);`
- `--xy-minimap-node-stroke-color: var(--border);`
- `--xy-handle-background-color: var(--port-bg);`
- `--xy-controls-button-background-color: var(--control-bg);`
- `--xy-controls-button-background-color-hover: var(--control-bg-hover);`
- `--xy-controls-button-color: var(--control-fg);`
- `--xy-controls-button-color-hover: var(--fg);`
- `--xy-controls-button-border-color: var(--border-subtle);`
- `--xy-controls-box-shadow: var(--shadow-popup);`

Остальные правила:

- `.react-flow__controls` — граница `var(--border)`, радиус `var(--r-md)`,
  `overflow: hidden`, `box-shadow: var(--shadow-popup)`.
- `.react-flow__controls-button` — фон `var(--control-bg)`, нижняя граница
  `var(--border-subtle)`. Правило `fill` удаляется: иконки контролов рисуются
  `fill: currentColor`, и мёртвое значение `fill: #bdbdbd` только мешает.
- `.react-flow__controls-button:hover` — фон `var(--control-bg-hover)`.
- `.react-flow__minimap` — граница `var(--border)`, радиус `var(--r-md)`.
- `.react-flow__attribution` — фон прозрачный, цвет `var(--fg-subtle)`.
- `.react-flow__attribution a` — цвет `var(--fg-subtle)`.
- `.react-flow__connection-path` — `stroke: var(--connection-stroke)`,
  `stroke-dasharray: var(--edge-dash)`.
- `.react-flow__edge` — `cursor: pointer` без изменений.
- `.react-flow__edge.edge-hl path.react-flow__edge-path` — анимация `march` без изменений.
- `.react-flow__node:focus` — `outline: none` без изменений.

- [ ] **Step 4: Убрать проп цвета сетки**

В `ScreenMapPage.tsx` у `<Background>` убирается проп `color="#1D1D1D"`. Проп задаёт
`--xy-background-pattern-color-props`, а библиотека читает
`var(--xy-background-pattern-color-props, var(--xy-background-pattern-color, default))` —
то есть переданное значение перебивает нашу переменную. Без удаления пропа токен
`--grid-line` не применится.

- [ ] **Step 5: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 6: Добавить e2e-проверку сетки**

В `tests/e2e/screen-map.spec.ts` добавить тест «сетка холста использует токен»:

```ts
await expect(page.locator(".react-flow__background-pattern").first()).toHaveCSS("stroke", "rgb(20, 24, 33)");
```

Значение `rgb(20, 24, 33)` — это `--grid-line` (`#141821`) в sRGB-нотации
(Review Focus 5).

- [ ] **Step 6: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run test && npm run test:e2e`
Expected: зелёные, e2e 10 тестов.

---

### Task 5: `inspector.css` и `inspector-rows.css`

**Files:**

- Modify: `src/features/screen-map/styles/inspector.css`
- Modify: `src/features/screen-map/styles/inspector-rows.css`
- Modify: `src/features/screen-map/styles/tokens.test.ts` (список `TOKENIZED`)

**Interfaces:**

- Consumes: токены из Task 1.
- Produces: инспектор на токенах. Классы `.inspector`, `.insp-h`, `.stat-grid`,
  `.api-row`, `.state-chip`, `.spec-field`, `.link-row`, `.ent-row`, `.scr-row`.

- [ ] **Step 1: Добавить оба файла в `TOKENIZED`**

`const TOKENIZED = ["tokens.css", "base.css", "canvas.css", "field.css", "react-flow.css", "inspector.css", "inspector-rows.css"];`

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL на инспекторских файлах.

- [ ] **Step 3: Переписать `inspector.css` на токены**

- `.inspector` — ширина 348 px сохраняется, фон `var(--bg-raised)`,
  левая граница `var(--border-subtle)`.
- `.insp-top` — без изменений по геометрии.
- `.insp-actions` — `gap: var(--sp-2)`.
- `.insp-close` — 30×30 px сохраняются.
- `.insp-h` — размер `var(--t-xl)`.
- `.insp-p` — размер `var(--t-md)`, цвет `var(--fg-muted)`.
- `.insp-note` — размер `var(--t-sm)`, цвет `var(--fg-subtle)`.
- `.insp-empty` — размер `var(--t-sm)`, цвет `var(--fg-subtle)`.
- `.route-chip` — фон `var(--bg-surface)`, граница `var(--border)`, радиус `var(--r-md)`,
  цвет `var(--fg)`, размер `var(--t-sm)`, padding `var(--sp-1) var(--sp-2)`.
- `.sec-h` — без изменений по геометрии.
- `.stat-grid` — `gap: var(--sp-2)`.
- `.stat-grid > div` — фон `var(--bg-surface)`, граница `var(--border)`,
  радиус `var(--r-lg)`, padding `var(--sp-3)`, тень `var(--ring-inset)`.
- `.stat-grid b` — размер `var(--t-xl)`.
- `.stat-grid span` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.api-row` — верхняя граница `var(--border-subtle)`, размер `var(--t-sm)`.
- `.api-m` — цвет `var(--fg-muted)`.
- `.api-p` — цвет `var(--fg)`.
- `.chip-row` — `gap: var(--sp-2)`.
- `.state-chip` — граница `var(--border)`, радиус `var(--r-pill)`,
  размер `var(--t-xs)`, цвет `var(--fg-muted)`.
- `.chip-skel` — `border-style: dashed`, цвет `var(--fg-subtle)`.
- `.spec-field` — верхняя граница `var(--border-subtle)`, радиус `var(--r-md)`,
  `gap: var(--sp-2)`.
- `.spec-field.on` — фон `var(--overlay-soft)`.
- `.spec-label` — размер `var(--t-sm)`, цвет `var(--fg)`.
- `.spec-name` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.spec-st` — размер `var(--t-xs)`, ширина 62 px сохраняется.

- [ ] **Step 4: Переписать `inspector-rows.css` на токены**

- `.link-row`, `.ent-row`, `.scr-row` — верхняя граница `var(--border-subtle)`,
  радиус `var(--r-md)`, цвет `var(--fg)`, padding `var(--sp-2)`.
- `:hover` у этих трёх — фон `var(--bg-hover)`.
- `.link-ent`, `.ent-key` — размер `var(--t-sm)`, цвет `var(--fg)`.
- `.link-arrow` — цвет `var(--fg-subtle)`.
- `.link-target` — размер `var(--t-sm)`, цвет `var(--fg-muted)`, ellipsis сохраняется.
- `.ent-row.on` — фон `var(--overlay-soft)`.
- `.ent-label` — размер `var(--t-sm)`, цвет `var(--fg-muted)`.
- `.ent-meta` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.scr-row-t` — размер `var(--t-md)`, ellipsis сохраняется.
- `.scr-row-r` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`, `max-width: 150px` сохраняется.
- `.inspector-content` — padding `var(--sp-4)`.
- Медиазапрос `@media (width <= 980px)` — `border-top` инспектора становится
  `var(--border-subtle)`, остальное без изменений.

- [ ] **Step 5: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 6: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run test && npm run test:e2e`
Expected: зелёные.

---

### Task 6: `primitives/popovers.css`

**Files:**

- Modify: `src/features/screen-map/styles/primitives/popovers.css`
- Modify: `src/features/screen-map/styles/tokens.test.ts` (список `TOKENIZED`)

**Interfaces:**

- Consumes: токены из Task 1.
- Produces: меню, тултип, preview-card и kbd на токенах.

- [ ] **Step 1: Добавить `primitives/popovers.css` в `TOKENIZED`**

Список растёт на этот путь вместо имени файла: `"primitives/popovers.css"`.

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL на `primitives/popovers.css`.

- [ ] **Step 3: Переписать файл на токены**

- `.menu-popup` — фон `var(--bg-raised)`, граница `var(--border)`, радиус `var(--r-lg)`,
  padding `var(--sp-1)`, тень `var(--shadow-popup), var(--ring-inset)`.
- `.menu-item` — padding `var(--sp-2) var(--sp-2)`, радиус `var(--r-md)`,
  цвет `var(--fg)`, размер `var(--t-sm)`.
- `.menu-item[data-highlighted]` — фон `var(--bg-active)`, цвет `var(--fg)`.
- `.menu-item.danger` — цвет `var(--status-failed)`.
- `.menu-item-note` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.menu-head` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.menu-sep` — фон `var(--border-subtle)`.
- `.tip` — фон `var(--bg-raised)`, граница `var(--border)`, радиус `var(--r-lg)`,
  padding `var(--sp-2) var(--sp-3)`, размер `var(--t-sm)`,
  тень `var(--shadow-popup), var(--ring-inset)`.
- `.tip-head` — размер `var(--t-sm)`, цвет `var(--fg)`.
- `.tip-row` — цвет `var(--fg-muted)`; `b` — цвет `var(--fg)`.
- `.preview-card` — фон `var(--bg-raised)`, граница `var(--border)`,
  радиус `var(--r-lg)`, padding `var(--sp-3)`, тень `var(--shadow-popup), var(--ring-inset)`.
- `.pv-head` — размер `var(--t-sm)`, цвет `var(--fg)`.
- `.pv-fields li`, `.pv-hops li` — размер `var(--t-sm)`, цвет `var(--fg-muted)`.
- `.pv-screen` — цвет `var(--fg)`.
- `.pv-api` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `kbd` — фон `var(--bg-sunken)`, граница `var(--border)`, радиус `var(--r-sm)`,
  цвет `var(--fg-muted)`, размер `var(--t-xs)`.
- `.pop-pos` — только `z-index: 320`, без цветов.

- [ ] **Step 4: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run test && npm run test:e2e`
Expected: зелёные.

---

### Task 7: `primitives/dialogs.css`, `palette.css`, `feedback.css`

**Files:**

- Modify: `src/features/screen-map/styles/primitives/dialogs.css`
- Modify: `src/features/screen-map/styles/primitives/palette.css`
- Modify: `src/features/screen-map/styles/primitives/feedback.css`
- Modify: `src/features/screen-map/styles/tokens.test.ts` (список `TOKENIZED`)

**Interfaces:**

- Consumes: токены из Task 1.
- Produces: диалоги, командная палитра, тосты и скроллбар на токенах.

- [ ] **Step 1: Добавить три файла в `TOKENIZED`**

`"primitives/dialogs.css"`, `"primitives/palette.css"`, `"primitives/feedback.css"`.

- [ ] **Step 2: Убедиться, что тест падает**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: FAIL на трёх файлах.

- [ ] **Step 3: Переписать `dialogs.css` на токены**

- `.dlg-backdrop` — фон `var(--overlay-scrim)`, `backdrop-filter: blur(2px)`,
  переход `opacity var(--dur-base) var(--ease)`.
- `.dlg-popup` — фон `var(--bg-raised)`, граница `var(--border)`, радиус `var(--r-xl)`,
  padding `var(--sp-5)`, тень `var(--shadow-popup), var(--ring-inset)`.
- `.dlg-title` — размер `var(--t-lg)`.
- `.dlg-desc` — размер `var(--t-md)`, цвет `var(--fg-muted)`.
- `.dlg-actions` — `gap: var(--sp-2)`.
- `.json-pre` — фон `var(--bg-sunken)`, граница `var(--border-subtle)`,
  радиус `var(--r-md)`, padding `var(--sp-3)`, цвет `var(--fg-muted)`,
  размер `var(--t-sm)`.
- `.help-row` — верхняя граница `var(--border-subtle)`.
- `.help-row dd` — цвет `var(--fg-muted)`.
- Ширины `.json-dlg` и `.help-dlg` сохраняются.

- [ ] **Step 4: Переписать `palette.css` на токены**

- `.pal-popup` — фон `var(--bg-raised)`, граница `var(--border)`, радиус `var(--r-xl)`,
  тень `var(--shadow-popup), var(--ring-inset)`.
- `.cmdk-input-wrap` — нижняя граница `var(--border-subtle)`, цвет `var(--fg-subtle)`.
- `.cmdk-input` — цвет `var(--fg)`, размер `var(--t-md)`.
- `.cmdk-input::placeholder` — цвет `var(--fg-subtle)`.
- `.cmdk-empty` — размер `var(--t-sm)`, цвет `var(--fg-subtle)`.
- `.cmdk-group [cmdk-group-heading]` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.cmdk-item` — радиус `var(--r-md)`, цвет `var(--fg)`, размер `var(--t-sm)`.
- `.cmdk-item[data-selected="true"]` — фон `var(--bg-accent-soft)`, цвет `var(--fg)`.
- `.cmdk-dim` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.
- `.cmdk-note` — размер `var(--t-xs)`, цвет `var(--fg-subtle)`.

- [ ] **Step 5: Переписать `feedback.css` на токены**

- `.toast-viewport` — `gap: var(--sp-2)`.
- `.toast` — фон `var(--bg-raised)`, граница `var(--border)`, радиус `var(--r-lg)`,
  тень `var(--shadow-popup), var(--ring-inset)`.
- `.toast-content` — padding `var(--sp-3)`.
- `.toast-title` — размер `var(--t-md)`, цвет `var(--fg)`.
- `.toast-desc` — размер `var(--t-sm)`, цвет `var(--fg-muted)`.
- `.toast-close` — цвет `var(--fg-subtle)`; `:hover` — цвет `var(--fg)`.
- `.sa-thumb` — фон `var(--scrollbar-thumb)`, радиус `var(--r-pill)`;
  `:hover` — фон `var(--scrollbar-thumb-hover)`.

- [ ] **Step 6: Убедиться, что тест проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 7: Чекпоинт**

Run: `npm run lint:css && npm run format:check && npm run test && npm run test:e2e`
Expected: зелёные.

---

### Task 8: Инлайновые стили в TSX

**Files:**

- Modify: `src/features/screen-map/ui/FieldRow.tsx`
- Modify: `src/features/screen-map/ui/OrthEdge.tsx`
- Modify: `src/features/screen-map/ui/inspector/InspectorScreen.tsx`
- Modify: `src/features/screen-map/ui/inspector/LinkRow.tsx`
- Modify: `src/features/screen-map/ScreenMapPage.tsx`

**Interfaces:**

- Consumes: токены из Task 1 как CSS custom properties в инлайновых стилях.
- Produces: в TSX не остаётся ни одного литерального цвета вне `STATUS`.

- [ ] **Step 1: Перенести цвета порта в CSS**

В `ui/FieldRow.tsx` функция `portStyle` сейчас задаёт `background: on ? color : "#141414"`
и `borderColor: on ? color : "#6E6E6E"`. Значения для неактивного порта убираются:
остаются только `background: on ? color : undefined` и `borderColor: on ? color : undefined`.
Базовые цвета берёт правило `.react-flow__handle.port` в `field.css`.

- [ ] **Step 2: Перенести приглушение в токен**

В `ui/FieldRow.tsx` `style={{ opacity: dim ? 0.2 : 1 }}` становится
`style={{ opacity: dim ? "var(--opacity-dim)" : 1 }}`. Вычисленное значение остаётся
`0.2`, поэтому существующая e2e-проверка `toHaveCSS("opacity", "0.2")` остаётся
зелёной.

- [ ] **Step 3: Перевести цвета мини-карты на токены**

В `ScreenMapPage.tsx` `nodeColor` становится
`(n) => (n.id === "hub" ? "var(--minimap-node-hub)" : "var(--minimap-node)")`,
а `nodeStrokeColor` — `"var(--border)"`. Значения попадают в инлайновый `style`
элемента мини-карты, где `var()` разрешается.

- [ ] **Step 5: Проверить, что мини-карта действительно перекрасилась**

Открыть приложение, посмотреть на мини-карту: узлы должны быть цвета
`--minimap-node`, узел `hub` — `--minimap-node-hub`. Если `var()` в инлайновом
`style` мини-карты не разрешается, оставить литералы `#2e2e2e` и `#5a5a5a` и
добавить их в список исключений теста «вне tokens.css нет сырых цветов».

- [ ] **Step 6: Перенести подсветку связи и убрать дублирование спецификации**

В `ui/OrthEdge.tsx` сейчас три литерала, дублирующих `EDGE_STYLE`: `borderRadius: 8`
(строка 24), `strokeDasharray: "3 4"` (строка 41) и базовый `stroke: "#7C7C7C"` (строка 39).
Все три заменяются на `EDGE_STYLE.cornerRadius`, `EDGE_STYLE.dash` и `EDGE_STYLE.color`
с импортом `EDGE_STYLE` из `data/constants.ts`. Подсветка остаётся в CSS:
`stroke: hl || selected ? "var(--edge-hl)" : EDGE_STYLE.color`. Смысл: экспортируемый
`meta.edgeStyle` и нарисованная связь берут одно и то же значение, а не две копии.

- [ ] **Step 7: Убрать магические литералы в инспекторе**

В `ui/inspector/InspectorScreen.tsx` сравнение `STATUS[f.status].color === "#3D3D3D"`
заменяется на сравнение по ключу: `f.status === "none" ? "var(--fg-muted)" :
STATUS[f.status].color`. В `ui/inspector/LinkRow.tsx` запасной `"#666"` заменяется
на `"var(--fg-subtle)"`.

- [ ] **Step 8: Проверить, что в TSX не осталось литеральных цветов**

Run: `rg -n '#[0-9a-fA-F]{6}' src/features/screen-map --glob '*.tsx'`
Expected: совпадений нет. Допустимы только значения из `STATUS` (они приходят из
константы, а не из литерала в компоненте).

- [ ] **Step 9: Чекпоинт**

Run: `npm run lint && npm run typecheck && npm run test && npm run test:e2e`
Expected: зелёные. Проверить вручную на `$ npm run dev`: тултип поля, контекстное
меню связи, мини-карта и легенда выглядят как в направлении B.

---

### Task 9: Финал — полный скан, визуальная сверка, удаление прототипа

**Files:**

- Modify: `src/features/screen-map/styles/tokens.test.ts` (полный список `TOKENIZED`)
- Delete: `design.html`, `design/tokens.css`, `design/preview.css`

**Interfaces:**

- Consumes: всё, что сделано в Task 1–8.
- Produces: закрытый контракт токенов, чистое дерево без временных файлов.

- [ ] **Step 1: Расширить список `TOKENIZED` на все файлы**

`const TOKENIZED = ["tokens.css", "base.css", "canvas.css", "field.css",
"react-flow.css", "inspector.css", "inspector-rows.css", "primitives/popovers.css",
"primitives/dialogs.css", "primitives/palette.css", "primitives/feedback.css"];`

- [ ] **Step 2: Убедиться, что полный скан проходит**

Run: `npx vitest run src/features/screen-map/styles/tokens.test.ts`
Expected: PASS. Если падает — в оставшемся файле есть сырой цвет; он переезжает
в токен, и токен добавляется в `tokens.css`.

- [ ] **Step 3: Сверить результат с прототипом**

Открыть `http://127.0.0.1:5173/design.html` (прототип ещё лежит) и рядом
`http://127.0.0.1:5173/`. Проверить: палитру, радиусы, тени, кольцо фокуса, легенду,
панели, инспектор, тултип, меню, тост, диалог, командную палитру. Расхождения,
кроме ожидаемых (в прототипе карточка шире и строки выше — в приложении геометрия
зафиксирована спецификацией), исправляются в токенах.

- [ ] **Step 4: Удалить прототип**

Удалить с диска `design.html` и папку `design/` целиком. После удаления
`npm run dev` продолжает работать, а `npm run build` собирает только `index.html`:
корневые HTML-файлы, кроме `index.html`, в бандл не попадают.

- [ ] **Step 5: Прогнать все гейты целиком**

Run: `npm run format:check && npm run lint && npm run lint:css && npm run lint:md &&
npm run typecheck && npm run check:docs && npm run check:file-length && npm run test &&
npm run build && npm run test:e2e`
Expected: все зелёные.

- [ ] **Step 6: Проверить, что экспорт не поехал**

Run: `npm run export:schema && git diff --stat -- artifacts/section-x-screen-map.schema.json`
Expected: единственное изменение — строка `meta.exportedAt`. Если изменились
геометрия, палитра или подпись — значит, токены разошлись со спецификацией;
вернуться к Task 1 и 3.

- [ ] **Step 7: Зафиксировать отклонения в спецификации**

Если по ходу работ появились решения, расходящиеся со спецификацией (например,
обводка точки статуса `none`), дописать их в
`docs/design/design-system.md` в раздел 5.2 или 6.
