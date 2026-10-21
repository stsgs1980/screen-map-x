import { useMemo, type ReactElement } from "react";
import { SECTION_PATH } from "../../data/constants";
import { ENTITY_META } from "../../data/entities";
import { SCREENS } from "../../data/screens";
import { defOf } from "../../flow";
import { selectActiveEntity, useMapStore } from "../../store/mapStore";
import { Star } from "../icons";

/**
 * Inspector in overview mode (no screen selected): section counters,
 * the entity route index and the screen index.
 * @returns overview content for the inspector panel
 */
export function InspectorOverview(): ReactElement {
  const edges = useMapStore((s) => s.edges);
  const activeEntity = useMapStore(selectActiveEntity);
  const pinnedEntity = useMapStore((s) => s.pinnedEntity);
  const setHoverEntity = useMapStore((s) => s.setHoverEntity);
  const togglePin = useMapStore((s) => s.togglePin);
  const focusScreen = useMapStore((s) => s.focusScreen);

  const defs = useMemo(() => edges.map(defOf), [edges]);
  const fieldsTotal = SCREENS.reduce((n, s) => n + s.fields.length, 0);
  const entities = Object.keys(ENTITY_META).map((key) => ({
    key,
    fields: SCREENS.reduce((n, s) => n + s.fields.filter((f) => f.entity === key).length, 0),
    edges: defs.filter((e) => e.entity === key).length,
  }));

  return (
    <>
      <div className="mono-label">{SECTION_PATH}</div>
      <h2 className="insp-h">Карта экранов</h2>
      <p className="insp-p">
        Узлы — экраны, рёбра — переходы по полям-сущностям (не по кнопкам). Наведите курсор на поле, чтобы подсветить
        весь маршрут сущности; клик по экрану открывает его спецификацию.
      </p>
      <div className="stat-grid">
        <div>
          <b>{SCREENS.length}</b>
          <span>screens</span>
        </div>
        <div>
          <b>{fieldsTotal}</b>
          <span>fields</span>
        </div>
        <div>
          <b>{defs.length}</b>
          <span>links</span>
        </div>
      </div>

      <div className="sec-h mono-label">Сущности · маршруты</div>
      <div className="ent-list">
        {entities.map((e) => (
          <button
            key={e.key}
            className={`ent-row${activeEntity === e.key ? "on" : ""}`}
            onMouseEnter={() => setHoverEntity(e.key)}
            onMouseLeave={() => setHoverEntity(null)}
            onClick={() => togglePin(e.key)}
            title="Клик — закрепить подсветку маршрута"
          >
            <span className="ent-key">{e.key}</span>
            <span className="ent-label">{ENTITY_META[e.key].label}</span>
            <span className="ent-meta">
              {e.fields} пол. · {e.edges} перех.{pinnedEntity === e.key ? " · pinned" : ""}
            </span>
          </button>
        ))}
      </div>

      <div className="sec-h mono-label">Экраны раздела</div>
      <div className="scr-list">
        {SCREENS.map((s) => (
          <button key={s.id} className="scr-row" onClick={() => focusScreen(s.id)}>
            <span className="mono-label">{s.code}</span>
            <span className="scr-row-t">
              {s.title}
              {s.hub ? <Star size={10} fill="currentColor" aria-hidden /> : null}
            </span>
            <span className="scr-row-r">{s.route}</span>
          </button>
        ))}
      </div>

      <p className="insp-note">
        Связи можно редактировать: тяните от порта-поля, чтобы добавить переход, Delete удаляет выбранную связь, Ctrl+Z
        отменяет, перетаскивание карточек привязано к сетке 10 px. «Сброс · хаб» возвращает исходную схему.
      </p>
    </>
  );
}
