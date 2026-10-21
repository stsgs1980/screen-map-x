# Отчёт: соответствие screen-map-x стандарту webstorm-config

- Дата: 2026-10-21
- Эталон: `stsgs1980/webstorm-config`, коммит `e78d625ef38f16a84197b92cd1f19b734e996784`
- Объект: проект `screen-map-x` (карта экранов раздела X, React Flow + elkjs)
- Метод: гейты эталона прогнаны на копии исходников (стенд `/tmp/audit`), код не менялся
- Среда стенда: Node v20.20.2, npm 10.8.2 (ниже порога эталона, см. раздел 3)

## Резюме: характер отклонений

Проект собирался не из шаблона, поэтому отклонения носят системный инфраструктурный характер,
а не характер «плохо настроенного шаблона»: отсутствуют целые слои стандарта (линтеры,
форматтер, хуки, CI, тесты, конфиги IDE, git-дисциплина). Содержательное ядро при этом в
хорошем состоянии: строгий TypeScript проходит даже с опциями эталона, а логические правила
ESLint не дали ни одного срабатывания.

По природе замечаний картина такая:

- основная масса (Prettier: 17 файлов; Stylelint: 129; markdownlint: 27) - механическое
  форматирование и нотации, исправляется автоправками за один проход;
- точечный слой типизации и документации API - 23 срабатывания ESLint по трём правилам;
- единственное содержательное ядро - anti-monolith: 2 файла длиннее 250 строк, компонент
  `App` на 251 строку функции и 8 хуков состояния в одном компоненте;
- процессный слой (git, Conventional Commits, CHANGELOG, CI, тесты) отсутствует целиком;
- найдено одно реальное мелкое дефектное место в CSS (мёртвое свойство `width`).

Критичных для корректности отклонений не выявлено: отклонения преимущественно дисциплинарные,
форматные и организационные, а не логические.

## 1. Из чего состоит эталон

`webstorm-config` - это не один конфиг, а связка взаимно дублирующих друг друга слоёв:

- правила агента и стиля: `.aiassistant/rules/AI Rules.md` (строгий TS, явные типы, JSDoc
  для публичного API, anti-monolith, Conventional Commits);
- формат: `.editorconfig` + `.prettierrc` (2 пробела, LF, финальный перевод строки, двойные
  кавычки, точки с запятой, trailing commas, ширина 120) + схема WebStorm
  `.idea/codeStyles/Project.xml` с теми же значениями;
- линтеры: ESLint 9 flat (`eslint.config.js`) с плагинами jsdoc, react, react-hooks,
  jsx-a11y и собственными правилами `unicode-policy`; Stylelint; markdownlint
  (`.markdownlint.json`, MD013 = 120, MD060 = aligned);
- пороги anti-monolith: файл 250 строк (`scripts/check-file-length.ts`), компонент 200,
  функция 50 строк, цикломатика 15, 3+ `useState` (`.idea/inspectionProfiles`);
- процесс: Husky + lint-staged + commitlint, генерация `CHANGELOG.md`, GitHub CI из пяти
  джоб, `.nvmrc` 24.15.0, `engines.node >=22.22.2`, `.npmrc` с `engine-strict=true`;
- тесты: Vitest (`vitest.config.ts`, `passWithNoTests: true`), сверка доков `check:docs`;
- IDE и документация: `.idea/*` (codeStyles, inspections, шаблоны файлов, live templates),
  `docs/getting-started.md`, `docs/webstorm.md`, `docs/testing.md`, `docs/markdown.md`,
  `docs/kickoff.md`, `README.template.md`.

## 2. Сводка гейтов эталона на исходниках проекта

| Гейт                | Итог   | Объём замечаний           |
| ------------------- | ------ | ------------------------- |
| `tsc` (опции базы)  | [OK]   | 0 ошибок                  |
| `eslint`            | [FAIL] | 23 ошибки, 3 правила      |
| `prettier --check`  | [FAIL] | 17 из 19 текстовых файлов |
| `stylelint`         | [FAIL] | 129 в одном `index.css`   |
| `markdownlint`      | [FAIL] | 27 в `README.md`          |
| `check:file-length` | [FAIL] | 2 файла из 13 TS/JS       |
| `check:docs`        | [FAIL] | 3 проверки                |
| unicode-policy      | [OK]   | 0 (часть ESLint)          |
| `npm test`          | [N/A]  | инфраструктуры нет        |
| сборка проекта      | [OK]   | `tsc -b && vite build`    |

## 3. Отсутствующие слои (главный характер отклонений)

В проекте нет ни одного файла инфраструктуры эталона. По списку миграции из
`docs/getting-started.md` (раздел «Migrating existing projects») отсутствуют:

- конфиги корня: `.editorconfig`, `.gitattributes`, `.gitignore`, `.markdownlint.json`,
  `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `.stylelintrc.json`,
  `eslint.config.js`, `eslint-parsers/`, `eslint-processors/`, `eslint-rules/`,
  `tsconfig.base.json`, `vitest.config.ts`;
- процесс: `.husky/` (pre-commit, commit-msg, pre-push), `.github/workflows/ci.yml`,
  `.github/dependabot.yml`, commitlint и lint-staged в `package.json`;
- IDE и правила агента: `.idea/` целиком, `.aiassistant/rules/`;
- документы и служебные файлы: `docs/`, `CHANGELOG.md`, `LICENSE`, `SECURITY.md`, `tests/`.

Следствия, видимые уже сейчас:

- проект не является git-репозиторием (`.git` отсутствует), поэтому дисциплины коммитов,
  changelog и все проверки на `git ls-files` к нему неприменимы; без `.gitignore`
  в репозиторий попали бы `node_modules/`, `dist/` и `tsconfig.tsbuildinfo`
  (эталон игнорирует `*.tsbuildinfo`, у нас файл лежит в корне);
- в `package.json` нет полей `engines`, `author`, `description`, `license`, `keywords`
  и скриптов-гейтов: есть только `dev`, `build`, `preview`, `export:schema` вместо
  `lint`, `lint:css`, `lint:md`, `typecheck`, `format`, `format:check`, `test`,
  `check:file-length`, `check:docs`, `changelog`, `prepare`;
- стенд работает на Node v20.20.2 и npm 10.8.2 при эталоне `engines.node >=22.22.2`,
  `.nvmrc` 24.15.0 и npm >=10.9.0; часть тулчейна эталона при установке даёт EBADENGINE,
  а его скрипты `node scripts/*.ts` требуют type stripping Node 22+ (на стенде их
  запускали через `tsx`, который в проекте как раз есть);
- версии зависимостей старше эталонных: React и `@types/*` 18.3 против 19.2/19.3,
  TypeScript `^5.6.0` против `^5.9.3`; самого линтерного стека (ESLint 9, Prettier 3.9,
  Stylelint 17, markdownlint-cli, Husky) в зависимостях нет.

## 4. Форматирование: массовое, но механическое

`prettier --check` с эталонным `.prettierrc` не проходят 17 из 19 текстовых файлов проекта
(проходят только `src/vite-env.d.ts` и `tsconfig.json`). Доминирующая причина системная:
проект написан в одинарных кавычках (например, в `src/data/schema.ts` 782 символа `'`
против 0 `"` в строках импорта и данных), эталон требует двойные (`singleQuote: false`),
плюс ширина 120 против фактических переносов на ~100, организация импортов плагином
`prettier-plugin-organize-imports` и форматирование CSS/HTML/JSON.

Что уже совпадает с эталоном и автоправками не изменится по смыслу:

- отступ 2 пробела, LF везде (CRLF: 0), финальный перевод строки во всех исходниках,
  ни одной строки с хвостовыми пробелами;
- точки с запятой расставлены повсеместно, trailing commas в многострочных конструкциях
  в основном присутствуют изначально;
- ширина строки 120 в коде почти соблюдена: превышения только в 5 строках TS/TSX
  (`src/data/schema.ts`: 115, 157, 234, 375; `src/components/Inspector.tsx`: 184)
  и 4 строках CSS; отдельная длинная строка в `index.html:6` - data URI фавиконки.

## 5. ESLint: точечный слой, 23 срабатывания

Полный прогон эталонного `eslint.config.js` (с `--max-warnings=0`) дал 23 ошибки
и 0 предупреждений только по трём правилам:

| Правило         | Число | Где сосредоточено                |
| --------------- | ----- | -------------------------------- |
| explicit return | 12    | компоненты и хелперы без `: T`   |
| `jsdoc/require` | 10    | публичное API без JSDoc          |
| `no-console`    | 1     | `console.log` в скрипте экспорта |

Распределение по файлам: `src/data/schema.ts` 9, `src/components/Inspector.tsx` 3,
`src/App.tsx`, `src/components/Icon.tsx`, `src/flow.ts`, `src/layout/elk.ts` по 2,
`src/components/OrthEdge.tsx`, `src/components/ScreenNode.tsx`,
`scripts/export-schema.ts` по 1. Типичные места: `App` (нет типа возврата и JSDoc),
`buildExport`, `elkLayout`, `toFlowEdges`, стрелки-константы `screenHeight`, `fieldId`,
`portId`, `FIELD_OF`, `initialPositions`.

Принципиально, чего не найдено (все по 0): `unicode-policy/emoji`,
`unicode-policy/unicode-graphics`, react-hooks (включая exhaustive-deps), пять правил
jsx-a11y, `no-var`, `prefer-const`, `no-irregular-whitespace`, правила
`typescript-eslint/recommended`. Явных `any` в коде нет вовсе; есть три приведения,
ослабляющих типы на границах библиотек: `as never` для графа elkjs и два
`as unknown as` для реестров типов React Flow, а также non-null assertions
(`e.data!`, `pop()!`, `getElementById("root")!`) - эталон их прямо не запрещает.

## 6. TypeScript: конфиг расходится, код строгий режим держит

| Опция                | Эталон (`tsconfig.base`) | Проект        |
| -------------------- | ------------------------ | ------------- |
| `target` / `lib`     | ES2022                   | ES2020        |
| `noUnusedLocals`     | true                     | false         |
| `noUnusedParameters` | true                     | false         |
| `types`              | `vitest/globals`         | `vite/client` |
| структура            | base + extends           | один файл     |
| `resolveJsonModule`  | true                     | не задана     |
| `esModuleInterop`    | true                     | не задана     |

Совпадают: `strict: true`, `moduleResolution: bundler`, `isolatedModules`,
`skipLibCheck`, `forceConsistentCasingInFileNames`, `jsx: react-jsx`. У проекта есть
аддитивные опции вне эталона (`allowImportingTsExtensions`, `moduleDetection: force`,
`noFallthroughCasesInSwitch`, `useDefineForClassFields`) - они не ослабляют проверки.

Ключевой факт: прогон `tsc` с опциями `tsconfig.base.json` эталона (включая
`noUnusedLocals/noUnusedParameters: true` и target ES2022) по исходникам проекта
завершился без ошибок. То есть отклонение здесь декларативное: собственные настройки
проекта мягче, но код жёсткий режим фактически выдерживает. Известный след мягкости -
`scripts/` исключены из `tsconfig` проекта после ошибки типов `node:fs` (в эталоне
`@types/node` есть в devDependencies и такой проблемы не возникает).

## 7. Anti-monolith: содержательное ядро отклонений

| Порог эталона           | Лимит | Факт (максимум)        | Итог   |
| ----------------------- | ----- | ---------------------- | ------ |
| файл TS/JS              | 250   | 388 (`data/schema.ts`) | [FAIL] |
| файл TS/JS              | 250   | 307 (`App.tsx`)        | [FAIL] |
| компонент               | 200   | 251 строка тела `App`  | [FAIL] |
| функция                 | 50    | 251 / 149 / 75 / 56    | [FAIL] |
| `useState` в компоненте | < 3   | 7 плюс `useNodesState` | [FAIL] |
| параметры функции       | 5     | не более 4             | [OK]   |

Детали: остальные 11 TS/JS-файлов лимит 250 соблюдают (ближе всех `Inspector.tsx` - 203).
Функции длиннее 50 строк по span-метрике: `App` 251 (строки 57-307), `Inspector` 149,
`buildExport` 75 (строки 314-388), `OrthEdge` 56, `FieldRow` 53. Характер превышений
разный: `schema.ts` раздут в основном литералами данных (7 экранов и 18 рёбер занимают
~190 строк из 388) и сборщиком экспорта в том же файле; `App.tsx` - концентрацией
состояния и JSX оверлеев в одном компоненте. Эталон исключений для data-файлов не
предусматривает (освобождены только тесты), поэтому формально это нарушения;
содержательно декомпозиция напрашивается на `screens/edges/export` и на вынос состояния
карты в хук плюс подкомпоненты тулбара и панелей.

IDE-инспекции эталона, не проверяемые headless-прогоном (цикломатика 15, утверждений
на функцию 30, глубина вложенности 4, `FileLength` для всех типов файлов), в этот
аудит не вошли; по прокси-метрикам строк превышения функции в `App` почти наверняка
сопровождаются превышением лимита утверждений.

Отдельно: сгенерированный `section-x-screen-map.schema.json` (1821 строка) гейтом длины
не покрывается (только TS/JS), но по характеру это артефакт в корне без правил
игнорирования; эталон аналогичный случай (автогенерация CHANGELOG) оформляет скоупом
IDE и проверкой свежести в CI. Скриншоты `screenshots/*.png` - бинарные артефакты
проверки, в эталоне для них место в `.gitattributes` как binary.

## 8. Stylelint: 129 замечаний в index.css

| Правило                | Число | Характер                             |
| ---------------------- | ----- | ------------------------------------ |
| single-line max decl   | 62    | компактные правила в одну строку     |
| empty-line-before      | 22    | пустые строки перед правилами        |
| color notations        | 30    | `rgba()` вместо современного `rgb()` |
| selector-class-pattern | 13    | BEM-классы React Flow                |
| duplicate property     | 1     | мёртвый `width` (строка 203)         |
| media range notation   | 1     | `max-width` вместо range-синтаксиса  |

Первые три группы (114 из 129) снимаются форматированием Prettier и `stylelint --fix`.
Группа `selector-class-pattern` - конфликт стандарта с библиотекой: переопределяются
чужие классы вида `.react-flow__handle`, переименовать их нельзя, нужно исключение
в конфиге. Единственный содержательный дефект - дублирование `width` в блоке
`.link-row` (первое значение мертво). Синтаксических ошибок и неизвестных свойств нет.

## 9. Markdown и документация

`markdownlint` по `README.md`: 27 ошибок - MD060 x19 (таблицы не выровнены по стилю
aligned), MD013 x7 (строки 130-286 символов, все в таблице соответствия спеке),
MD040 x1 (fence с деревом файлов без языка; по эталону нужен `text`). Структурных
нарушений (заголовки, списки, пустые строки) нет.

`check:docs` эталона дал три отказа: нет `.nvmrc`, не задан `engines.node`, в README
нет бейджа-маркера минимальной версии Node. Заодно видно расхождение жанра: эталонный
`README.template.md` требует бейджи CI/лицензии/стека, блоки Status и Last Updated,
разделы Overview, Table of Contents, Features, Tech Stack, Getting Started, Scripts
(таблица), Docs, Architecture, Contributing, Conventions, License. Наш README по
содержанию инструкции запуска даёт, но ни структуры шаблона, ни папки `docs/`
с getting-started/webstorm/testing/markdown/kickoff в проекте нет.

## 10. Символьная политика: гейты чисты, текст правил строже

Нюанс, важный для характера: машинная политика эталона (`eslint-rules/unicode-policy.js`)
запрещает только emoji (`Extended_Pictographic`, региональные индикаторы, U+20E3)
и диапазоны U+2500-257F, U+2580-259F, U+25A0-25FF, U+2800-28FF. По ней проект чист (0).
Но текстовые конвенции шире: AI Rules запрещают emoji и box-графику «в ответах и коде»,
а `docs/markdown.md` требует ASCII в символах (`->` вместо стрелки, `...` вместо
многоточия) и ручной проверки прозы. В проекте встречаются глифы вне машинных диапазонов:
U+2192 x6 и U+2190, U+2193 x2, U+21E9, U+2605 x5, U+2713, U+2715 x2, U+2026, а также
типографика U+2014, U+00B7, U+00D7, кавычки U+00AB/U+00BB.

Характер здесь двойственный: в UI-строках это осознанные элементы интерфейса из исходного
ТЗ («хаб» со звездой U+2605, стрелки переходов, отметка о копировании U+2713), а в
`README.md` - прямое расхождение с чеклистом `docs/markdown.md`. Русская пунктуация
(тире, кавычки-ёлочки, средняя точка) применяется и в документах самого эталона.

## 11. Тесты и процесс

Тестов в проекте нет: ни одного `*.test.*`/`*.spec.*`, нет Vitest в зависимостях и
`vitest.config.ts`, нет скриптов `test`. По эталону это двойное отклонение: отсутствует
инфраструктура (`docs/testing.md` предполагает Vitest из коробки, тесты в `src/**`)
и не выполняется рабочее правило «сначала падающий тест» из раздела отладки AI Rules.
Фактическая верификация проекта делалась браузерными скриншотами (Playwright вне
репозитория, в проект попали только PNG) - по классификации эталона это e2e-уровень
без юнит-базы и без закреплённых в репозитории сценариев.

Git-процесс отсутствует полностью: нет репозитория, веток и коммитов, поэтому требования
Conventional Commits, запрета прямых коммитов в main без верификации, хуков Husky
и свежести CHANGELOG проверить или нарушить невозможно - слой не применён. CI нет,
локальный эквивалент гейтов не запускается (скриптов нет). Файл-шаблоны эталона задают
и форму компонента: `export const Name = (props): ReactElement =>` с JSDoc и именованным
плюс default экспортом; проект пишет `export function` без типа возврата, у `App` только
default-экспорт, `Icon` типизирует props инлайн вместо интерфейса `Props` (у `Inspector`
интерфейс `Props` как раз по шаблону).

## 12. Что уже соответствует эталону

- `strict: true` и фактическое прохождение `tsc` с опциями эталона, включая noUnused;
- отступ 2 пробела, LF, финальные переводы строк, нет хвостовых пробелов, `;` везде;
- нет `any`, `var`, плавающих промисов на виду; `import type` для типов - повсеместно
  (совпадает с инспекцией ConsistentTypeImports);
- имена файлов, идентификаторов и комментарии в коде - на английском (русский только
  в UI-текстах и документации, что соответствует правилу «ответы по-русски, код
  по-английски» по смыслу);
- нет захардкоженных абсолютных путей; экспорт-скрипт строит путь от `import.meta.url`;
- декомпозиция уже начата в духе эталона: данные, роутинг рёбер, ELK-раскладка, узел,
  ребро и инспектор разнесены по модулям `src/data`, `src/flow.ts`, `src/layout`,
  `src/components`; 11 из 13 TS/JS-файлов укладываются в 250 строк;
- структура входа как в Step 4 эталона: `index.html`, `src/main.tsx`, `src/App.tsx`;
- заголовки и структура единственного README markdownlint-совместимы за пределами
  таблиц, длина строк в коде превышена лишь в 9 местах (TS/TSX и CSS).

## 13. Классификация и рекомендуемый порядок приведения

| Тип | Характер                    | Примеры                        | Цена правки |
| --- | --------------------------- | ------------------------------ | ----------- |
| A   | отсутствует слой стандарта  | конфиги, хуки, CI, тесты, git  | средняя     |
| B   | механическое форматирование | кавычки, CSS-нотации, таблицы  | низкая      |
| C   | точечная типизация и JSDoc  | 23 места ESLint, tsconfig      | низкая      |
| D   | декомпозиция anti-monolith  | `App.tsx`, `schema.ts`         | основная    |
| E   | конфликт стандарт/предметка | BEM React Flow, UI-глифы, data | решения     |

Рекомендуемый порядок совпадает с рецептом миграции самого эталона
(`docs/getting-started.md`, «Migrating existing projects»):

1. Инициализировать git, добавить `.gitignore` и `.gitattributes` эталона, зафиксировать
   точку отсчёта коммитом в Conventional Commits.
2. Скопировать конфиги и поставить devDependencies эталона, поднять Node до `.nvmrc`
   (24.15.0) и зафиксировать `engines`.
3. Прогнать `prettier --write` и `stylelint --fix` отдельной «шумной» правкой (тип B),
   в конфиге Stylelint разрешить BEM-паттерн классов React Flow (тип E).
4. Закрыть 23 ESLint-места и выровнять `tsconfig` на base + extends (тип C).
5. Декомпозировать `schema.ts` и `App.tsx` до порогов, вынести состояние карты в хук (тип D).
6. Подключить Vitest и покрыть чистую логику (`toFlowEdges`, `sidesFor`, `buildExport`)
   юнит-тестами в `src/**`; браузерные сценарии оформить как e2e вне Vitest.
7. Включить Husky, lint-staged, commitlint и CI; переписать README по `README.template.md`
   и добавить `docs/`; сгенерировать CHANGELOG.

## Приложение. Методика

Стенд собран копированием исходников проекта в `/tmp/audit` с наложением конфигов
и тулчейна эталона без изменения самих исходников; `node_modules` исключены из индекса
git стенда, чтобы `check-file-length` видел только файлы проекта. Команды аудита:

```bash
./node_modules/.bin/tsc -p tsconfig.audit.json --noEmit
./node_modules/.bin/eslint . --max-warnings=0 -f json
./node_modules/.bin/prettier --check .
./node_modules/.bin/stylelint "**/*.{css,scss}" --allow-empty-input -f json
./node_modules/.bin/markdownlint "**/*.md" --ignore node_modules
./node_modules/.bin/tsx scripts/check-file-length.ts --all
./node_modules/.bin/tsx scripts/check-docs.ts
```

Ограничения: Node стенда (20.20.2) ниже порога эталона, поэтому скрипты `.ts` запускались
через `tsx`, а часть пакетов ставилась с EBADENGINE; инспекции WebStorm (цикломатика,
длина функций по утверждениям, FileLength в IDE) headless не воспроизводятся и оценены
по прокси-метрикам строк; поведение приложения аутом стандарта не покрывается.
Сам отчёт оформлен по правилам `docs/markdown.md` эталона и проверен его же
`markdownlint` и Prettier.
