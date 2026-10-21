# Testing

Проект использует два автоматических уровня: Vitest для чистой логики и store,
Playwright для браузерных сценариев. Скриншоты дополняют их ручной визуальной
проверкой, но не заменяют assertions.

## Unit tests

Файлы:

- `src/features/screen-map/flow/adapter.test.ts` - выбор сторон портов и построение React Flow edges.
- `src/features/screen-map/data/data.test.ts` - целостность экранов, полей, сущностей и экспорта.
- `src/features/screen-map/data/export.test.ts` - формат сгенерированной JSON-схемы.
- `src/features/screen-map/layout/elk.test.ts` - снап раскладки ELK на сетку 10 px.
- `src/features/screen-map/model/mapStore.test.ts` - начальный граф, connect, undo/redo, границы истории
  и переключение правого инспектора.
- `src/features/screen-map/model/layoutHistory.test.ts` - чистота истории при раскладках.
- `src/features/screen-map/model/elkRun.test.ts` - обработка ошибки раскладки ELK.
- `scripts/docs-checks.test.ts` - контракт проверки документации.
- `vite.config.test.ts` - конфигурация dev-сервера и закрепление CI-экшенов.

Команды:

```bash
npm test
npm run test:watch
npm run test:coverage
```

Vitest собирает `src/**/*.{test,spec}.{ts,tsx}`, `scripts/**/*.{test,spec}.{ts,tsx}`
и корневые `*.{test,spec}.{ts,tsx}`. Файлы Playwright в `tests/e2e/` намеренно не
попадают в Node-окружение Vitest: они запускаются другим runner.

## Browser e2e

Сценарии лежат в `tests/e2e/screen-map.spec.ts`:

1. Рендер семи экранов и восемнадцати связей.
2. Hover поля: tooltip, пять активных полей invoice, затемнение чужих экранов.
3. Ctrl+K: поиск «возврат», фокус и спецификация экрана «Возвраты».
4. Меню экспорта: копирование JSON и Toast.
5. ToggleGroup легенды: фильтр `failed` и opacity полей.
6. Контекстное меню ребра: удаление связи и восстановление через Ctrl+Z.
7. Правый инспектор: скрытие, восстановление и центровка рамки холста в доступной области.

Перед первым запуском:

```bash
npx playwright install --only-shell chromium
npm run test:e2e
```

`playwright.config.ts` поднимает Vite dev server на `127.0.0.1:4173`, использует
один worker и viewport 1600 x 1000. Production bundle отдельно проверяется
командой `npm run build` в CI. При падении Playwright сохраняет screenshot и trace
в `test-results/`; каталог игнорируется Git.

## Regression notes

E2E hover-сценарий специально проверяет реальные классы `fld on`, `scr dim`,
`scr sel` и `ent-row on` через видимый результат. Это защита от дефекта сборки
классов фрагментами `" on"`: Tailwind-плагин Prettier может обрезать начальный
пробел внутри строкового фрагмента. Для динамических классов используйте полные
строки или массив с `.join(" ")`.

## Writing new tests

- Чистую функцию без DOM покрывайте unit-тестом рядом с модулем в `src/`.
- Поведение store проверяйте через публичные actions, а не через внутренние детали zundo.
- Пользовательский сценарий с pointer, keyboard, portals или React Flow - в Playwright.
- Для bugfix сначала добавьте падающий тест, затем исправление.
- Не используйте фиксированные абсолютные пути в тестах и конфигурации.
- Не опирайтесь на pixel-perfect скриншоты для логики: проверяйте роли, текст,
  счетчики узлов/ребер, классы состояния и вычисленные стили.

## Manual visual check

После заметных UI-изменений откройте карту при 1600 x 1000 и проверьте:

- хаб в центре, карточки не перекрывают друг друга;
- строки полей не «размазаны», entity keys выровнены вправо;
- tooltip не перехватывает pointer events;
- preview card не уводит фокус и закрывается после ухода курсора;
- палитра, меню и диалоги закрываются по Escape и клику снаружи;
- после ELK линии остаются привязаны к полям, undo возвращает предыдущий граф;
- кнопка сворачивания в инспекторе или кнопка «Инспектор» в верхней панели
  скрывает/возвращает правое окно, а холст остается по центру доступной области.

Референсные кадры лежат в `docs/assets/screenshots/`, кадры новых примитивов - в
`docs/assets/screenshots/ui/`.
