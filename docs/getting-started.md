# Getting started

Этот документ описывает локальный запуск карты экранов, полный набор проверок и
типовые проблемы окружения.

## 1. Prerequisites

- Node.js >= 22.22.2. Рекомендуемая версия зафиксирована в `.nvmrc`: 24.15.0.
- npm >= 10.9.0.
- Git. Хуки работают только внутри клонированного репозитория.
- Для Playwright нужен Chromium, который устанавливается отдельно от npm-пакетов.

Если используется nvm:

```bash
nvm install
nvm use
node --version
npm --version
```

## 2. Installation

```bash
npm install
npm run prepare
```

`npm run prepare` запускает Husky и направляет `core.hooksPath` на `.husky/_`.
Сами проектные хуки лежат в `.husky/pre-commit`, `.husky/commit-msg` и
`.husky/pre-push`; каталог `.husky/_` генерируется и не коммитится.

## 3. Development server

```bash
npm run dev
```

Vite слушает только loopback: `127.0.0.1:5173`. Приложение доступно как
`http://localhost:5173`.

Если нужен доступ из локальной сети (например, с телефона), запустите сервер
явно:

```bash
npm run dev:lan
```

Тогда Vite слушает `0.0.0.0:5173`, а адрес в сети будет вида
`http://<ip-компьютера>:5173`. Доступ по IP-адресу разрешён, но произвольный
`Host`-заголовок - нет: проверка хоста остается включенной. Для production-сборки
аналогично работает `npm run preview:lan`.

## 4. Production build

```bash
npm run build
npm run preview
```

Сборка сначала выполняет `tsc --noEmit`, затем Vite build. `elkjs` вынесен в
отдельный ленивый chunk, потому что нужен только для автораскладки.

## 5. Export schema

```bash
npm run export:schema
```

Команда запускает `scripts/export-schema.ts` и обновляет файл
`artifacts/section-x-screen-map.schema.json`. Экспорт из UI строит тот же payload, но из
текущего состояния store: с фактическими позициями и вручную добавленными связями.

## 6. Browser tests

Один раз после установки зависимостей:

```bash
npx playwright install --only-shell chromium
npm run test:e2e
```

Playwright сам поднимает Vite на `127.0.0.1:4173`, если сервер на этом порту еще не
запущен. Конфигурация находится в `playwright.config.ts`, сценарии - в
`tests/e2e/screen-map.spec.ts`.

## 7. Full local gate

Перед pull request выполните ту же последовательность, что и CI:

```bash
npm run format:check
npm run lint
npm run lint:css
npm run lint:md
npm run typecheck
npm run check:file-length
npm run check:docs
npm test
npm run build
npm run test:e2e
```

Если форматирование нужно исправить автоматически, используйте `npm run format`,
а затем повторно проверьте diff. Не смешивайте массовое форматирование с
функциональными изменениями без необходимости.

## 8. Troubleshooting

### Playwright reports that the executable does not exist

Версия браузера привязана к версии `@playwright/test`. После обновления пакета
повторите:

```bash
npx playwright install --only-shell chromium
```

В CI используется вариант с системными зависимостями:
`npx playwright install --with-deps --only-shell chromium`.

### Vite build is killed on a small machine

Production build обрабатывает React Flow, Base UI, cmdk и шрифты Geist. На машине
с примерно 2 GiB RAM остановите dev/preview server и другие Node-процессы, затем
повторите `npm run build`. E2E специально использует dev server, чтобы не запускать
второй production build внутри Playwright.

### Port 5173 or 4173 is busy

Dev server по умолчанию занимает 5173, e2e - 4173. Остановите старый процесс или
передайте другой порт Vite. Для e2e также нужно синхронно поменять `baseURL` и
`webServer.url` в `playwright.config.ts`.

### Husky hooks do not run

Проверьте:

```bash
git config --get core.hooksPath
npm run prepare
```

Ожидаемый результат первой команды - `.husky/_`. В CI переменная `HUSKY=0`
отключает установку хуков, потому что там они не нужны.

### Docs check fails after editing Markdown

`scripts/check-docs.ts` проверяет ссылки на npm-скрипты, inline-code пути с
префиксами `docs/`, `.idea/`, `scripts/`, `.husky/`, `tools/eslint/rules/`,
`tools/eslint/processors/` и `tools/eslint/parsers/`, а также маркер минимальной версии Node
в README. Запустите `npm run check:docs` и исправьте конкретную строку из отчета.
