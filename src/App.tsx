import { useEffect, useRef, useState } from "react";
import type { Action, GameState, CityId, UpgradeId } from "./game/types";
import {
  advance,
  transition,
  income,
  tileIncome,
  interval,
  emptyPlots,
  cityUnlocked,
  achievements,
  offline,
  proximity,
  newGame,
} from "./game/engine/core";
import { BUILDINGS, building } from "./game/config/buildings";
import { CITIES, CITY_IDS } from "./game/config/cities";
import { ECONOMY, UPGRADES, upgradeCost } from "./game/config/economy";
import { level, threshold, unlocked } from "./game/config/progression";
import {
  loadGame,
  saveGame,
  parseSave,
  exportSave,
} from "./game/persistence/saves";
import { BuildingArt, CrateArt, Icon } from "./components/Art";
import { useTheme } from "./components/useTheme";
import { useBoardCamera } from "./components/Board/useBoardCamera";
import { PLOT_SIZE, PLOT_STEP, WORLD_SIZE } from "./components/Board/camera";

export const fmt = (n: number) =>
  n >= 1e12
    ? `${(n / 1e12).toFixed(1).replace(/\.0$/, "")}T`
    : n >= 1e9
      ? `${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`
      : n >= 1e6
        ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`
        : n >= 1000
          ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`
          : n.toFixed(n < 10 && n % 1 !== 0 ? 1 : 0);
type Modal =
  | "shop"
  | "upgrades"
  | "achievements"
  | "collection"
  | "settings"
  | "offline"
  | null;
type Effect = { index: number; key: number; text: string; kind: string };
export default function App() {
  const [initial] = useState(() => loadGame());
  const [game, setGame] = useState(initial.state),
    ref = useRef(game);
  const [selected, setSelected] = useState<number | null>(null),
    [modal, setModal] = useState<Modal>(initial.report ? "offline" : null);
  const [report, setReport] = useState(initial.report),
    [toast, setToast] = useState(initial.error),
    [saveError, setSaveError] = useState("");
  const [effect, setEffect] = useState<Effect | null>(null),
    [drag, setDrag] = useState<{
      from: number;
      x: number;
      y: number;
      tier: number;
      size: number;
    } | null>(null),
    [hover, setHover] = useState<number | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false),
    [importError, setImportError] = useState("");
  const gesture = useRef<{
      from: number;
      x: number;
      y: number;
      moved: boolean;
    } | null>(null),
    dialog = useRef<HTMLDivElement>(null),
    lastFocus = useRef<HTMLElement | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const id = game.selectedCity,
    c = game.cities[id],
    lvl = level(c.xp),
    open = unlocked(c.xp),
    full = !emptyPlots(c).length,
    ips = income(game, id),
    sel = selected === null ? null : c.board[selected],
    ready = achievements(game).filter(
      (a) => a.progress >= a.target && !game.claimed.includes(a.id),
    ).length;
  const camera = useBoardCamera(open, id);
  const theme = useTheme(game.settings.theme, id);
  function persist(s: GameState) {
    if (s.settings.autoSave && !saveGame(s))
      setSaveError(
        "Storage is unavailable. Export your save in Settings to keep your town.",
      );
    else setSaveError("");
  }
  function commit(s: GameState, save = true) {
    ref.current = s;
    setGame(s);
    if (save) persist(s);
  }
  function notify(message: string) {
    setToast(message);
  }
  function chime() {
    if (!ref.current.settings.sound) return;
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
      const ctx = audio.current;
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator(),
          gain = ctx.createGain(),
          t = ctx.currentTime + i * 0.05;
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch {
      /* Audio is optional on devices without Web Audio. */
    }
  }
  function act(action: Action) {
    const prev = ref.current,
      next = transition(prev, action, Date.now()),
      city = prev.selectedCity,
      before = prev.cities[city],
      after = next.cities[city];
    commit(next);
    if (action.type === "settings") saveGame(next);
    if (after.merges > before.merges) {
      chime();
      const index = action.type === "move" ? action.to : 0;
      const source = action.type === "move" ? before.board[action.from] : null;
      setEffect({
        index,
        key: Date.now(),
        text: `+${source?.kind === "building" ? source.tier * ECONOMY.xpPerSourceTier : 1} XP`,
        kind: "merge",
      });
    } else if (
      action.type === "open" &&
      after.board[action.index]?.kind === "building"
    )
      setEffect({
        index: action.index,
        key: Date.now(),
        text: "Welcome home",
        kind: "open",
      });
    if (after.discovered.length > before.discovered.length) {
      const tier = after.discovered.find(
        (t) => !before.discovered.includes(t),
      )!;
      notify(`Discovered ${building(city, tier).name} · Tier ${tier}`);
    }
    if (level(after.xp) > level(before.xp)) {
      notify(
        `Level ${level(after.xp)}! ${unlocked(after.xp).length - unlocked(before.xp).length} new plots are ready to build.`,
      );
      chime();
    }
    if (!cityUnlocked(prev, "sunshore") && cityUnlocked(next, "sunshore"))
      notify("Hello, sunshine! Sunshore is now open.");
    if (action.type === "buy" && after.purchases > before.purchases) {
      notify(`${building(city, action.tier).name} moved in!`);
      chime();
    }
    if (
      action.type === "upgrade" &&
      after.upgrades[action.id] > before.upgrades[action.id]
    ) {
      notify(`${UPGRADES[action.id].name} upgraded!`);
      chime();
    }
    if (action.type === "claim")
      notify("Reward collected. Your town thanks you!");
    if (action.type === "switch") {
      setSelected(null);
      setEffect(null);
    }
    if (action.type === "recycle") setSelected(null);
  }
  useEffect(() => {
    let lastSave = Date.now();
    const tick = () => {
      const now = Date.now(),
        current = ref.current;
      commit(advance(current, now), now - lastSave >= 2000);
      if (now - lastSave >= 2000) lastSave = now;
    };
    const timer = setInterval(tick, 250);
    const visibility = () => {
      if (document.hidden) {
        commit(advance(ref.current, Date.now()));
      } else {
        const r = offline(ref.current, Date.now());
        commit(r.state);
        if (r.seconds >= 30) {
          setReport(r);
          setModal("offline");
        }
      }
    };
    const leave = () => persist(advance(ref.current, Date.now()));
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", leave);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", leave);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!effect) return;
    const timer = setTimeout(() => setEffect(null), 900);
    return () => clearTimeout(timer);
  }, [effect]);
  useEffect(() => {
    if (!modal) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const el = dialog.current;
    el?.focus();
    function keys(e: KeyboardEvent) {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab" && el) {
        const nodes = [
          ...el.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input,textarea,[tabindex="0"]',
          ),
        ];
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === el)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("keydown", keys);
      lastFocus.current?.focus();
    };
  }, [modal]);
  function tileTap(index: number) {
    const tile = ref.current.cities[ref.current.selectedCity].board[index];
    if (tile?.kind === "crate") {
      act({ type: "open", index });
      setSelected(null);
      return;
    }
    if (selected !== null && selected !== index) {
      act({ type: "move", from: selected, to: index });
      setSelected(null);
    } else
      setSelected(
        tile?.kind === "building" && selected !== index ? index : null,
      );
  }
  function pointerDown(e: React.PointerEvent, index: number) {
    if (e.button !== 0 || c.board[index]?.kind !== "building") return;
    gesture.current = { from: index, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pointerMove(e: React.PointerEvent) {
    const g = gesture.current;
    if (!g) return;
    if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 7) g.moved = true;
    if (g.moved) {
      const tile = c.board[g.from];
      if (tile?.kind === "building") {
        setDrag({
          from: g.from,
          x: e.clientX,
          y: e.clientY,
          tier: tile.tier,
          size: e.currentTarget.getBoundingClientRect().width * 1.12,
        });
        setSelected(g.from);
        const target = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest<HTMLElement>("[data-plot]");
        setHover(target ? Number(target.dataset.plot) : null);
      }
    }
  }
  function pointerUp(e: React.PointerEvent, index: number) {
    const g = gesture.current;
    gesture.current = null;
    if (g?.moved) {
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-plot]");
      if (target)
        act({ type: "move", from: g.from, to: Number(target.dataset.plot) });
      setSelected(null);
    } else tileTap(index);
    setDrag(null);
    setHover(null);
  }
  const modalTitles = {
    shop: "The neighborhood shop",
    upgrades: "A little boost for your town",
    achievements: "Small steps. Big milestones.",
    collection: "Your building collection",
    settings: "Make yourself at home",
    offline: "Your town missed you",
  };
  const panelButton = (
    kind: Modal,
    name: string,
    icon: string,
    badge?: number,
  ) => (
    <button
      aria-label={name}
      className={modal === kind ? "nav-button active" : "nav-button"}
      onClick={() => setModal(kind)}
    >
      <span className="nav-icon">
        <Icon name={icon} />
        {!!badge && <i className="badge">{badge}</i>}
      </span>
      <span>{name}</span>
    </button>
  );
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const state = parseSave(await file.text());
      const r = offline(state);
      commit(r.state);
      setSelected(null);
      setImportError("");
      notify("Your town is restored. Welcome back!");
      setModal(null);
    } catch (e) {
      setImportError(
        e instanceof Error ? e.message : "Unable to read this file.",
      );
    }
  }
  return (
    <div
      className={`app game-screen theme-${theme} ${id} ${game.settings.reducedMotion ? "reduce-motion" : ""}`}
    >
      <main className="play-area" aria-label="Town game">
        <header className="game-topbar">
          <div className="game-identity">
            <div className="game-title">
              <span>TINY TOWN MERGE</span>
              <h1>{CITIES[id].name}</h1>
            </div>
            <div className="city-tabs" aria-label="Choose city">
              {CITY_IDS.map((city) => (
                <button
                  key={city}
                  className={id === city ? "city-tab selected" : "city-tab"}
                  aria-pressed={id === city}
                  onClick={() =>
                    cityUnlocked(game, city)
                      ? act({ type: "switch", city })
                      : notify(
                          `Sunshore opens at Meadowville level ${CITIES.sunshore.unlock}. Keep merging to earn XP!`,
                        )
                  }
                >
                  <Icon
                    name={
                      city === "meadowville"
                        ? "leaf"
                        : cityUnlocked(game, city)
                          ? "sun"
                          : "lock"
                    }
                    size={16}
                  />
                  <span>{CITIES[city].name}</span>
                  {!cityUnlocked(game, city) && (
                    <small>LV {CITIES[city].unlock}</small>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="town-hud">
            <div
              className={`balance ${ips > 0 ? "is-earning" : ""}`}
              aria-label="Town treasury"
            >
              <span className="coin-medallion">
                <Icon name="coin" size={23} />
              </span>
              <strong data-testid="coins">{fmt(c.coins)}</strong>
            </div>
            <div className="income-pill" aria-label="Coins per second">
              <Icon name="coin" size={17} />
              <strong>{fmt(ips)}</strong>
              <span>/ sec</span>
            </div>
            <button
              className={`game-sparks ${game.boosts.incomeUntil > game.lastTick || game.boosts.speedUntil > game.lastTick ? "boost-active" : ""}`}
              aria-label="Boosts"
              title={`${game.boosts.tokens} sparks available`}
              onClick={() => setModal("upgrades")}
            >
              <Icon name="bolt" size={21} />
              <strong>{game.boosts.tokens}</strong>
            </button>
            <div className="level-stat">
              <span className="level-badge" title={`Level ${lvl}`}>
                {lvl}
              </span>
              <div
                className="xp-track"
                role="progressbar"
                aria-label={`Level ${lvl} experience`}
                aria-valuemin={0}
                aria-valuemax={threshold(lvl + 1) - threshold(lvl)}
                aria-valuenow={c.xp - threshold(lvl)}
              >
                <span
                  style={{
                    width: `${((c.xp - threshold(lvl)) / (threshold(lvl + 1) - threshold(lvl))) * 100}%`,
                  }}
                />
                <small>
                  {c.xp - threshold(lvl)} /{" "}
                  {threshold(lvl + 1) - threshold(lvl)} XP
                </small>
              </div>
              <span className="plot-count">
                {open.length}
                <small> / 25</small>
              </span>
            </div>
          </div>
        </header>
        <div className="landscape" key={id}>
          <div className="board-viewport" ref={camera.viewportRef}>
            <div
              className="board"
              data-testid="board"
              data-camera-scale={camera.scale}
              data-columns={camera.columns}
              data-rows={camera.rows}
              style={{
                width: WORLD_SIZE,
                height: WORLD_SIZE,
                visibility: camera.ready ? "visible" : "hidden",
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              }}
              role="group"
              aria-label={`${CITIES[id].name} building plots`}
            >
              {open.map((index) => {
                const tile = c.board[index];
                const compatible =
                  sel?.kind === "building" &&
                  tile?.kind === "building" &&
                  sel.tier === tile.tier &&
                  index !== selected;
                return (
                  <button
                    key={index}
                    data-plot={index}
                    data-testid={`plot-${index}`}
                    data-kind={tile?.kind || "empty"}
                    data-tier={
                      tile?.kind === "building" ? tile.tier : undefined
                    }
                    style={{
                      left: (index % 5) * PLOT_STEP,
                      top: Math.floor(index / 5) * PLOT_STEP,
                      width: PLOT_SIZE,
                      height: PLOT_SIZE,
                    }}
                    className={`plot unlocked ${selected === index ? "is-selected" : ""} ${compatible ? "compatible" : ""} ${drag?.from === index ? "drag-source" : ""} ${hover === index ? "drag-over" : ""} ${effect?.index === index ? `effect-${effect.kind}` : ""}`}
                    aria-label={
                      tile?.kind === "crate"
                        ? `Open crate on plot ${index + 1}`
                        : tile?.kind === "building"
                          ? `${building(id, tile.tier).name}, tier ${tile.tier}, plot ${index + 1}`
                          : `Empty plot ${index + 1}`
                    }
                    onPointerDown={(e) => pointerDown(e, index)}
                    onPointerMove={pointerMove}
                    onPointerUp={(e) => pointerUp(e, index)}
                    onPointerCancel={() => {
                      gesture.current = null;
                      setDrag(null);
                      setHover(null);
                    }}
                    onClick={(e) => {
                      if (e.detail === 0) tileTap(index);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        tileTap(index);
                      }
                    }}
                  >
                    <span className="plot-surface" />
                    {tile?.kind === "building" ? (
                      <>
                        <BuildingArt tier={tile.tier} city={id} />
                        <span className="tier-tag">{tile.tier}</span>
                        {tile.party && <span className="party-tag">♫</span>}
                      </>
                    ) : tile?.kind === "crate" ? (
                      <>
                        <CrateArt />
                        <span className="open-label">TAP TO OPEN</span>
                      </>
                    ) : (
                      <span className="empty-mark">+</span>
                    )}
                    {effect?.index === index && (
                      <span className="merge-effects" key={effect.key}>
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <b>{effect.text}</b>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="game-dock">
          <div
            className={`selection-panel ${sel?.kind === "building" ? "has-selection" : ""}`}
            aria-live="polite"
          >
            {sel?.kind === "building" && selected !== null ? (
              <>
                <div className="selection-info">
                  <span className="selected-tier">{sel.tier}</span>
                  <div>
                    <strong>{building(id, sel.tier).name}</strong>
                    <span>
                      {fmt(tileIncome(game, id, selected))} coins/sec
                      {proximity(c, selected) && id === "sunshore"
                        ? " · 2× party bonus"
                        : ""}
                      {sel.party ? " · Party host" : ""}
                    </span>
                  </div>
                </div>
                <div className="selection-actions">
                  {id === "sunshore" &&
                    sel.tier >= ECONOMY.partyMinimumTier &&
                    !sel.party && (
                      <button
                        className="text-button"
                        disabled={
                          c.coins <
                          building(id, sel.tier).income *
                            ECONOMY.partyCostFactor
                        }
                        onClick={() => act({ type: "party", index: selected })}
                      >
                        Host party ·{" "}
                        {fmt(
                          building(id, sel.tier).income *
                            ECONOMY.partyCostFactor,
                        )}
                      </button>
                    )}
                  <button
                    className="recycle-button"
                    title="Recycle this building for coins"
                    onClick={() => {
                      act({ type: "recycle", index: selected });
                      notify(
                        "Recycled. A fresh plot and a little coin for your next idea.",
                      );
                    }}
                  >
                    <Icon name="recycle" size={16} />
                    <span>
                      Recycle +
                      {fmt(
                        building(id, sel.tier).price * ECONOMY.recycleFactor,
                      )}
                    </span>
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Deselect building"
                    onClick={() => setSelected(null)}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Icon name={full ? "recycle" : "leaf"} size={16} />
                <span>
                  {full
                    ? "Open crates, merge matching buildings, or select one to recycle."
                    : c.merges === 0
                      ? "Open two crates, then drag matching buildings together."
                      : "Drag to merge or move · Tap two matching buildings to merge"}
                </span>
              </>
            )}
          </div>

          <div className="game-controls">
            <nav className="bottom-nav" aria-label="Game menus">
              {panelButton("upgrades", "Upgrades", "upgrade")}
              {panelButton("collection", "Collection", "book")}
              {panelButton("achievements", "Milestones", "trophy", ready)}
              {panelButton("settings", "Settings", "gear")}
            </nav>
            <div className="generator-area">
              <button
                className={`generator ${full ? "is-full" : ""}`}
                data-testid="generate"
                disabled={full}
                onClick={() => act({ type: "tap" })}
              >
                <span
                  className="generator-progress"
                  style={{
                    width: `${Math.min(100, (c.crateProgress / interval(game, id)) * 100)}%`,
                  }}
                />
                <span className="generator-box">
                  <CrateArt />
                </span>
                <span className="generator-text">
                  <strong>{full ? "FULL" : "New crate"}</strong>
                  <small>
                    {full
                      ? "Merge or recycle to make room"
                      : c.generated < ECONOMY.onboardingCrates
                        ? "Tap to deliver"
                        : `${Math.max(0, Math.ceil((interval(game, id) - c.crateProgress) / (game.boosts.speedUntil > game.lastTick ? 2 : 1)))}s · Tap to speed up`}
                  </small>
                </span>
                <span className="generator-tap">{full ? "FULL" : "+"}</span>
              </button>
            </div>

            <div className="shop-shortcut">
              {panelButton("shop", "Shop", "shop")}
            </div>
          </div>
        </footer>
      </main>
      {(toast || saveError) && (
        <div className="toast" role="status">
          <span>
            <Icon name={saveError ? "gear" : "leaf"} size={18} />
          </span>
          {saveError || toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              setToast("");
              setSaveError("");
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {drag && (
        <div
          className="drag-ghost"
          style={{
            left: drag.x,
            top: drag.y,
            width: drag.size,
            height: (drag.size * 124) / 120,
          }}
        >
          <BuildingArt city={id} tier={drag.tier} />
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            className={`modal modal-${modal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            ref={dialog}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {modal === "offline"
                    ? "WELCOME BACK"
                    : CITIES[id].name.toUpperCase()}
                </span>
                <h2 id="modal-title">{modalTitles[modal]}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close menu"
                onClick={() => setModal(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            {modal === "shop" && (
              <>
                <p className="modal-intro">
                  Familiar faces for a growing neighborhood. Discover new
                  buildings by merging.
                </p>
                <div className="modal-wallet">
                  <Icon name="coin" />
                  {fmt(c.coins)} coins
                  <span>{emptyPlots(c).length} empty plots</span>
                </div>
                {full && (
                  <p className="notice">
                    Your neighborhood is full. Merge or recycle a building to
                    make room.
                  </p>
                )}
                <div className="shop-grid">
                  {BUILDINGS[id]
                    .filter((b) => c.discovered.includes(b.tier))
                    .map((b) => (
                      <div className="shop-item" key={b.tier}>
                        <div className="shop-art">
                          <BuildingArt tier={b.tier} city={id} />
                        </div>
                        <span className="eyebrow">TIER {b.tier}</span>
                        <h3>{b.name}</h3>
                        <p>
                          {fmt(
                            b.income *
                              (1 +
                                c.upgrades.income * ECONOMY.incomePerUpgrade),
                          )}{" "}
                          coins / sec
                        </p>
                        <button
                          className="primary-button"
                          data-testid={`buy-${b.tier}`}
                          disabled={full || c.coins < b.price}
                          onClick={() => act({ type: "buy", tier: b.tier })}
                        >
                          <Icon name="coin" size={16} />
                          {fmt(b.price)}
                          <span>Buy</span>
                        </button>
                      </div>
                    ))}
                </div>
                {!c.discovered.length && (
                  <div className="empty-state">
                    <CrateArt />
                    <h3>Your first neighbor is waiting.</h3>
                    <p>Open a crate to find a building for your shop.</p>
                    <button
                      className="primary-button"
                      onClick={() => setModal(null)}
                    >
                      Back to town
                    </button>
                  </div>
                )}
              </>
            )}
            {modal === "upgrades" && (
              <>
                <p className="modal-intro">
                  Small investments. A lasting difference. Each city has its own
                  upgrades.
                </p>
                <div className="modal-wallet">
                  <Icon name="coin" />
                  {fmt(c.coins)} coins
                </div>
                <div className="upgrade-list">
                  {(Object.keys(UPGRADES) as UpgradeId[]).map((key) => {
                    const u = UPGRADES[key],
                      l = c.upgrades[key],
                      cost = upgradeCost(key, l),
                      max = l === u.max;
                    return (
                      <div className="upgrade-item" key={key}>
                        <span className="upgrade-icon">
                          <Icon
                            name={
                              key === "speed"
                                ? "bolt"
                                : key === "quality"
                                  ? "shop"
                                  : "leaf"
                            }
                            size={25}
                          />
                        </span>
                        <div>
                          <h3>
                            {u.name}{" "}
                            <small>
                              LV {l} / {u.max}
                            </small>
                          </h3>
                          <p>{u.description}.</p>
                          <span className="upgrade-preview">
                            {key === "speed"
                              ? `${Math.round(l * ECONOMY.speedPerUpgrade * 100)}% → ${Math.round(Math.min(u.max, l + 1) * ECONOMY.speedPerUpgrade * 100)}% faster`
                              : key === "income"
                                ? `+${Math.round(l * ECONOMY.incomePerUpgrade * 100)}% → +${Math.round(Math.min(u.max, l + 1) * ECONOMY.incomePerUpgrade * 100)}% income`
                                : `Crate tier ${1 + l} → ${Math.min(6, l + 2)}`}
                          </span>
                        </div>
                        <button
                          className="primary-button"
                          disabled={
                            max || c.coins < cost || lvl < u.unlockLevel
                          }
                          onClick={() => act({ type: "upgrade", id: key })}
                        >
                          {max ? (
                            "Max level"
                          ) : lvl < u.unlockLevel ? (
                            `Level ${u.unlockLevel}`
                          ) : (
                            <>
                              <Icon name="coin" size={14} />
                              {fmt(cost)}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="modal-boosts">
                  <h3>
                    A little extra spark{" "}
                    <small>{game.boosts.tokens} available</small>
                  </h3>
                  <p>
                    Each spark gives a 2-minute boost in both cities. Earn one
                    every 5 merges or claimed milestone.
                  </p>
                  {(["income", "speed"] as const).map((key) => {
                    const until =
                        game.boosts[
                          key === "income" ? "incomeUntil" : "speedUntil"
                        ],
                      active = until > game.lastTick;
                    return (
                      <button
                        key={key}
                        className="boost-button"
                        disabled={active || game.boosts.tokens < 1}
                        onClick={() => act({ type: "boost", id: key })}
                      >
                        <Icon name="bolt" size={16} />
                        {key === "income" ? "2× income" : "2× crate speed"}
                        <small>
                          {active
                            ? `${Math.ceil((until - game.lastTick) / 1000)}s remaining`
                            : "Use 1 spark"}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {modal === "collection" && (
              <>
                <p className="modal-intro">
                  Every building has a beginning. What will you discover next?
                </p>
                <div className="collection-progress">
                  <strong>{c.discovered.length} / 20 discovered</strong>
                  <div className="mini-progress">
                    <span
                      style={{ width: `${(c.discovered.length / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="collection-grid">
                  {BUILDINGS[id].map((b) => {
                    const seen = c.discovered.includes(b.tier);
                    return (
                      <div
                        key={b.tier}
                        className={`collection-item ${seen ? "" : "undiscovered"}`}
                      >
                        <BuildingArt
                          tier={b.tier}
                          city={id}
                          silhouette={!seen}
                        />
                        <span className="eyebrow">TIER {b.tier}</span>
                        <h4>{seen ? b.name : "A new possibility"}</h4>
                        <small>
                          {seen
                            ? `${fmt(b.income)} coins / sec`
                            : "Keep merging to discover"}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {modal === "achievements" && (
              <>
                <p className="modal-intro">
                  Every milestone brings coins and one spark. Rewards go to your
                  current city.
                </p>
                <div className="achievement-list">
                  {achievements(game).map((a) => {
                    const claimed = game.claimed.includes(a.id),
                      done = a.progress >= a.target;
                    return (
                      <div
                        className={`achievement ${claimed ? "claimed" : ""}`}
                        key={a.id}
                      >
                        <span className="achievement-icon">
                          <Icon name={claimed ? "check" : "trophy"} size={23} />
                        </span>
                        <div className="achievement-info">
                          <h3>{a.title}</h3>
                          <p>{a.description}</p>
                          <div className="mini-progress">
                            <span
                              style={{
                                width: `${Math.min(100, (a.progress / a.target) * 100)}%`,
                              }}
                            />
                          </div>
                          <small>
                            {fmt(Math.min(a.target, a.progress))} /{" "}
                            {fmt(a.target)}
                          </small>
                        </div>
                        <button
                          className="primary-button"
                          disabled={!done || claimed}
                          onClick={() => act({ type: "claim", id: a.id })}
                        >
                          {claimed
                            ? "Collected"
                            : done
                              ? `Claim ${fmt(a.reward)}`
                              : `${fmt(a.reward)} coins`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {modal === "settings" && (
              <>
                <p className="modal-intro">
                  Your town lives in this browser. Export a backup to take it
                  with you.
                </p>
                <div className="appearance-setting">
                  <strong>Appearance</strong>
                  <p>Follow your device or choose your favorite time of day.</p>
                  <div
                    className="appearance-control"
                    role="radiogroup"
                    aria-label="Color theme"
                  >
                    {(["system", "light", "dark"] as const).map((option) => (
                      <label
                        key={option}
                        className={`theme-choice ${game.settings.theme === option ? "chosen" : ""}`}
                      >
                        <input
                          type="radio"
                          name="color-theme"
                          value={option}
                          checked={game.settings.theme === option}
                          onChange={() =>
                            act({
                              type: "settings",
                              settings: { theme: option },
                            })
                          }
                        />
                        <Icon
                          name={
                            option === "system"
                              ? "monitor"
                              : option === "dark"
                                ? "moon"
                                : "sun"
                          }
                          size={18}
                        />
                        <span>{option[0].toUpperCase() + option.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Gentle sounds</strong>
                    <p>A little chime with every merge.</p>
                  </div>
                  <button
                    className={`toggle ${game.settings.sound ? "on" : ""}`}
                    role="switch"
                    aria-checked={game.settings.sound}
                    aria-label="Gentle sounds"
                    onClick={() =>
                      act({
                        type: "settings",
                        settings: { sound: !game.settings.sound },
                      })
                    }
                  >
                    <span />
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Reduced motion</strong>
                    <p>A calmer town, with fewer animations.</p>
                  </div>
                  <button
                    className={`toggle ${game.settings.reducedMotion ? "on" : ""}`}
                    role="switch"
                    aria-checked={game.settings.reducedMotion}
                    aria-label="Reduced motion"
                    onClick={() =>
                      act({
                        type: "settings",
                        settings: {
                          reducedMotion: !game.settings.reducedMotion,
                        },
                      })
                    }
                  >
                    <span />
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Automatic saving</strong>
                    <p>After every action and every two seconds.</p>
                  </div>
                  <button
                    className={`toggle ${game.settings.autoSave ? "on" : ""}`}
                    role="switch"
                    aria-checked={game.settings.autoSave}
                    aria-label="Automatic saving"
                    onClick={() =>
                      act({
                        type: "settings",
                        settings: { autoSave: !game.settings.autoSave },
                      })
                    }
                  >
                    <span />
                  </button>
                </div>
                <div className="save-controls">
                  <button
                    className="secondary-button"
                    onClick={() => {
                      if (saveGame(ref.current))
                        notify("Town saved to this browser.");
                      else notify("Saving failed. Please export a backup.");
                    }}
                  >
                    Save now
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => exportSave(advance(ref.current, Date.now()))}
                  >
                    Export save
                  </button>
                  <label className="secondary-button file-button">
                    Import save
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={(e) => void importFile(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {importError && (
                  <p role="alert" className="error-message">
                    {importError}
                  </p>
                )}
                <p className="small muted">
                  Importing replaces your current town. Export it first if you
                  want to keep a copy. Offline growth is capped at 8 hours.
                </p>
                <div className="reset-section">
                  <h3>A brand-new beginning</h3>
                  <p>Reset both cities, coins, and all discoveries.</p>
                  {resetConfirm ? (
                    <div className="reset-confirm">
                      <p>
                        This permanently clears your town. Have you exported a
                        backup?
                      </p>
                      <button
                        className="danger-button"
                        onClick={() => {
                          const s = newGame();
                          commit(s);
                          saveGame(s);
                          setSelected(null);
                          setResetConfirm(false);
                          setModal(null);
                          notify(
                            "A fresh patch of possibility. Welcome to your new town.",
                          );
                        }}
                      >
                        Yes, reset everything
                      </button>
                      <button
                        className="text-button"
                        onClick={() => setResetConfirm(false)}
                      >
                        Keep my town
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-button danger-text"
                      onClick={() => setResetConfirm(true)}
                    >
                      Reset progress
                    </button>
                  )}
                </div>
              </>
            )}
            {modal === "offline" && report && (
              <>
                <div className="welcome-art">
                  <BuildingArt tier={Math.max(1, ...c.discovered)} city={id} />
                  <span>✦</span>
                </div>
                <p className="welcome-text">
                  While you were away, your little world kept growing.
                </p>
                <p className="muted center">
                  {report.seconds >= 3600
                    ? `${(report.seconds / 3600).toFixed(1)} hours`
                    : `${Math.floor(report.seconds / 60)} minutes`}{" "}
                  of town time · Up to 8 hours of offline growth
                </p>
                <div className="offline-earnings">
                  {report.earnings.map((e) => (
                    <div key={e.id}>
                      <span>
                        {CITIES[e.id].name}
                        <small>{e.crates} new crates</small>
                      </span>
                      <strong>
                        +{fmt(e.coins)} <Icon name="coin" size={18} />
                      </strong>
                    </div>
                  ))}
                </div>
                <p className="small muted center">
                  Already added to your treasuries. Crates stop when your plots
                  are full.
                </p>
                <button
                  className="primary-button wide"
                  onClick={() => setModal(null)}
                >
                  Lovely. Let’s keep growing <Icon name="arrow" size={18} />
                </button>
              </>
            )}
            <div className="modal-footer">
              <Icon name="leaf" size={14} /> Little by little, a lovely place to
              be.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
