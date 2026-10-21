# WebStorm setup

В репозиторий включены проектные настройки WebStorm из эталона. Они не заменяют
CLI-гейты: при расхождении источником истины остаются npm-скрипты и CI.

## Что уже лежит в `.idea/`

- `.idea/codeStyles/Project.xml` - code style: 2 пробела, ширина 120, LF.
- `.idea/inspectionProfiles/Project_Default.xml` - пороги anti-monolith и качества.
- `.idea/jsLinters/eslint.xml` и `.idea/prettier.xml` - точки интеграции линтеров.
- `.idea/fileTemplates/` - шаблоны React-компонента, Vitest-теста и Astro-страницы.
- `.idea/liveTemplates/` - сниппеты React, TypeScript, тестов и утилит.
- `.idea/scopes/generated_changelog.xml` - отдельный scope для сгенерированного журнала.
- `.idea/dictionaries/project.xml` - проектный словарь.

Локальные файлы IDE, не входящие в allowlist `.gitignore`, не коммитятся.

## Базовая настройка

1. Откройте корень репозитория как проект.
2. Убедитесь, что Node interpreter соответствует `.nvmrc` (24.15.0).
3. Включите EditorConfig support: проектный `.editorconfig` задает UTF-8, LF,
   final newline, trim trailing whitespace и отступ 2.
4. Для TypeScript выберите language service из локального `node_modules`.
5. Проверьте, что схема code style называется Project и берется из `.idea/codeStyles/`.

## Prettier, ESLint и Stylelint

- Prettier должен использовать локальный пакет и `.prettierrc`.
- ESLint работает с flat config `eslint.config.js`; кастомные правила лежат в
  `tools/eslint/rules/`, процессоры - в `tools/eslint/processors/`, парсеры - в `tools/eslint/parsers/`.
- Stylelint использует `.stylelintrc.json`; сгенерированный `dist` исключен через
  `.stylelintignore`.
- On-save форматирование можно включить вручную, но перед коммитом все равно
  работают Husky и lint-staged.

Полезные проверки из терминала IDE:

```bash
npm run lint
npm run lint:css
npm run lint:md
npm run typecheck
```

## Inspections и anti-monolith

Профиль проекта включает ограничения, которые не все дублируются ESLint:

- длина TS/JS-файла - 250 строк;
- длина компонента - ориентир 200 строк;
- длина функции - 50 строк;
- cyclomatic complexity - 15;
- глубина вложенных функций - 4;
- параметров у функции - не более 5;
- statements per function - 30.

Машинный гейт длины файла запускается как `npm run check:file-length`. Тесты
исключены, чтобы один сценарий не приходилось искусственно разрезать.

## Запуск тестов из IDE

- Vitest: конфигурация по `vitest.config.ts`, тесты только в `src/`.
- Playwright: запускайте `npm run test:e2e` из терминала или создайте локальную
  конфигурацию запуска npm. Браузер сначала ставится командой
  `npx playwright install --only-shell chromium`.

## Анализ при коммите

Рекомендуется включить анализ измененных файлов в диалоге Commit. Он дополняет,
но не заменяет:

- `.husky/pre-commit` - lint-staged и проверка длины;
- `.husky/commit-msg` - commitlint;
- `.husky/pre-push` - typecheck и unit-тесты.

## Согласованность IDE и CI

Если IDE и CLI расходятся, сначала выполните npm-команду из CI в терминале.
Частые причины: выбран глобальный Prettier вместо локального, Node ниже
`engines.node`, не выполнена команда `npm run prepare`, либо WebStorm кэширует
старую схему code style после обновления `.idea/`.
