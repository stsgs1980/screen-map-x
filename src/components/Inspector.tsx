import { useContext } from 'react';
import { MapContext } from '../context';
import {
  ENTITY_META,
  FIELD_OF,
  SCREEN_BY_ID,
  SCREENS,
  SECTION_PATH,
  STATUS,
  type EdgeDef,
  type ScreenDef,
} from '../data/schema';

interface Props {
  screen: ScreenDef | null;
  defs: EdgeDef[];
  onClose: () => void;
  onFocusScreen: (id: string) => void;
}

function LinkRow({
  def,
  dir,
  onFocusScreen,
}: {
  def: EdgeDef;
  dir: 'in' | 'out';
  onFocusScreen: (id: string) => void;
}) {
  const { setHoverEntity } = useContext(MapContext);
  const other = dir === 'in' ? def.from : def.to;
  const otherScreen = SCREEN_BY_ID[other.screen];
  const otherField = FIELD_OF(other.screen, other.entity);
  return (
    <button
      className="link-row"
      onClick={() => onFocusScreen(other.screen)}
      onMouseEnter={() => setHoverEntity(def.entity)}
      onMouseLeave={() => setHoverEntity(null)}
      title={def.note}
    >
      <span
        className="dot"
        style={{ background: otherField ? STATUS[otherField.status].color : '#666' }}
      />
      <span className="link-ent">{def.entity}</span>
      <span className="link-arrow">{dir === 'in' ? '←' : '→'}</span>
      <span className="link-target">
        {otherScreen?.title} · {otherField?.label}
      </span>
    </button>
  );
}

export function Inspector({ screen, defs, onClose, onFocusScreen }: Props) {
  const { activeEntity, setHoverEntity, pinnedEntity, togglePin } = useContext(MapContext);

  /* ------------------------------------------------------------ overview */
  if (!screen) {
    const fieldsTotal = SCREENS.reduce((n, s) => n + s.fields.length, 0);
    const entities = Object.keys(ENTITY_META).map((key) => ({
      key,
      fields: SCREENS.reduce((n, s) => n + s.fields.filter((f) => f.entity === key).length, 0),
      edges: defs.filter((e) => e.entity === key).length,
    }));
    return (
      <aside className="inspector">
        <div className="mono-label">{SECTION_PATH}</div>
        <h2 className="insp-h">Карта экранов</h2>
        <p className="insp-p">
          Узлы — экраны, рёбра — переходы по полям-сущностям (не по кнопкам). Наведите курсор на
          поле, чтобы подсветить весь маршрут сущности; клик по экрану открывает его спецификацию.
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
              className={`ent-row${activeEntity === e.key ? ' on' : ''}`}
              onMouseEnter={() => setHoverEntity(e.key)}
              onMouseLeave={() => setHoverEntity(null)}
              onClick={() => togglePin(e.key)}
              title="Клик — закрепить подсветку маршрута"
            >
              <span className="ent-key">{e.key}</span>
              <span className="ent-label">{ENTITY_META[e.key].label}</span>
              <span className="ent-meta">
                {e.fields} пол. · {e.edges} перех.{pinnedEntity === e.key ? ' · pinned' : ''}
              </span>
            </button>
          ))}
        </div>

        <div className="sec-h mono-label">Экраны раздела</div>
        <div className="scr-list">
          {SCREENS.map((s) => (
            <button key={s.id} className="scr-row" onClick={() => onFocusScreen(s.id)}>
              <span className="mono-label">{s.code}</span>
              <span className="scr-row-t">
                {s.title}
                {s.hub ? ' ★' : ''}
              </span>
              <span className="scr-row-r">{s.route}</span>
            </button>
          ))}
        </div>

        <p className="insp-note">
          Связи можно редактировать: тяните от порта-поля, чтобы добавить переход, Delete удаляет
          выбранную связь, перетаскивание карточек привязано к сетке 10 px. «Сброс · хаб ★»
          возвращает исходную схему.
        </p>
      </aside>
    );
  }

  /* ------------------------------------------------------- screen spec */
  const incoming = defs.filter((e) => e.to.screen === screen.id);
  const outgoing = defs.filter((e) => e.from.screen === screen.id);
  return (
    <aside className="inspector">
      <div className="insp-top">
        <div>
          <div className="mono-label">
            {screen.code}
            {screen.hub ? ' · HUB' : ''}
          </div>
          <h2 className="insp-h">{screen.title}</h2>
        </div>
        <button className="btn btn-ghost insp-close" onClick={onClose} title="Закрыть (клик по холсту)">
          ✕
        </button>
      </div>

      <div className="route-chip">{screen.route}</div>
      <p className="insp-p">{screen.description}</p>

      <div className="sec-h mono-label">API</div>
      {screen.api.map((a) => (
        <div className="api-row" key={a.path}>
          <span className="api-m">{a.method}</span>
          <span className="api-p">{a.path}</span>
        </div>
      ))}

      <div className="sec-h mono-label">Состояния</div>
      <div className="chip-row">
        {screen.states.map((st) => (
          <span className="state-chip" key={st}>
            {st}
          </span>
        ))}
        {screen.skeleton && <span className="state-chip chip-skel">skeleton block · 30px</span>}
      </div>

      <div className="sec-h mono-label">Поля · статусы</div>
      {screen.fields.map((f) => (
        <div
          className={`spec-field${activeEntity === f.entity ? ' on' : ''}`}
          key={f.entity}
          onMouseEnter={() => setHoverEntity(f.entity)}
          onMouseLeave={() => setHoverEntity(null)}
        >
          <span className="dot" style={{ background: STATUS[f.status].color }} />
          <span className="spec-label">{f.label}</span>
          <span className="spec-name">
            {f.name}: {f.type}
          </span>
          <span className="spec-st" style={{ color: STATUS[f.status].color === '#3D3D3D' ? '#8A8A8A' : STATUS[f.status].color }}>
            {STATUS[f.status].label}
          </span>
        </div>
      ))}

      <div className="sec-h mono-label">Входящие связи · {incoming.length}</div>
      {incoming.length === 0 && <p className="insp-empty">— нет входящих переходов</p>}
      {incoming.map((e) => (
        <LinkRow key={e.id} def={e} dir="in" onFocusScreen={onFocusScreen} />
      ))}

      <div className="sec-h mono-label">Исходящие связи · {outgoing.length}</div>
      {outgoing.length === 0 && <p className="insp-empty">— нет исходящих переходов</p>}
      {outgoing.map((e) => (
        <LinkRow key={e.id} def={e} dir="out" onFocusScreen={onFocusScreen} />
      ))}
    </aside>
  );
}
