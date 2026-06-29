import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Globe, { type ProjectedMarker } from './components/Globe';
import Timeline from './components/Timeline';
import DetailsPanel from './components/DetailsPanel';
import Connector from './components/Connector';
import EventBackground from './components/EventBackground';
import { EVENTS } from './data/events';

type Stage = 'splash' | 'moving' | 'ready';

export default function App() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [cardSide, setCardSide] = useState<'left' | 'right'>('right');
    const [stage, setStage] = useState<Stage>('splash');
    const [menuOpen, setMenuOpen] = useState(false);
    const projectedRef = useRef<ProjectedMarker | null>(null);
    const cardRef = useRef<HTMLElement | null>(null);
    const splashTitleRef = useRef<HTMLHeadingElement>(null);
    const navTitleRef = useRef<HTMLHeadingElement>(null);

    const markers = useMemo(
        () => EVENTS.map(e => ({ id: e.id, lat: e.lat, lon: e.lon })),
        [],
    );

    const selectedEvent = useMemo(
        () => EVENTS.find(e => e.id === selectedId) ?? null,
        [selectedId],
    );

    // Intro animation: a dedicated splash title is CSS-centered at the
    // viewport center. After a beat we measure where the real nav title
    // sits and FLIP the splash to that position, then hand off to the real one.
    useLayoutEffect(() => {
        const splash = splashTitleRef.current;
        const navTitle = navTitleRef.current;
        if (!splash || !navTitle) return;

        let t1: number | undefined;
        let t2: number | undefined;
        let cancelled = false;

        const runIntro = () => {
            if (cancelled) return;
            t1 = window.setTimeout(() => {
                if (cancelled) return;
                // Re-measure right before animating so we use the final laid-out
                // position (after fonts and any reflows).
                const splashRect = splash.getBoundingClientRect();
                const targetRect = navTitle.getBoundingClientRect();

                // Scale by height (line-height:1 makes height track font-size
                // exactly, immune to letter-spacing/trailing-space quirks).
                const s = targetRect.height / splashRect.height;

                // Anchor on the top-left corner of each element. After scaling
                // about the top-left, the element's left edge stays put, so we
                // just translate it to the target's top-left.
                const dx = targetRect.left - splashRect.left;
                const dy = targetRect.top - splashRect.top;

                splash.style.transformOrigin = 'top left';
                splash.style.transition =
                    'transform 900ms cubic-bezier(0.65, 0, 0.35, 1), opacity 400ms ease 1050ms';
                splash.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
                splash.style.opacity = '0';
                setStage('moving');
            }, 1300);

            // Trigger 'ready' right when the splash STARTS fading out, so the
            // nav-title fades in crossfaded with the splash (no blink gap).
            t2 = window.setTimeout(() => {
                if (cancelled) return;
                setStage('ready');
            }, 1300 + 1050);
        };

        // Wait until web fonts have loaded so the measured nav-title rect
        // reflects the final glyph metrics, otherwise the animation lands at
        // the fallback-font position and then snaps when fonts swap in.
        const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
        if (fonts?.ready) {
            fonts.ready.then(runIntro);
        } else {
            runIntro();
        }

        return () => {
            cancelled = true;
            if (t1 !== undefined) window.clearTimeout(t1);
            if (t2 !== undefined) window.clearTimeout(t2);
        };
    }, []);

    // Flip the card to the opposite side of where the marker projects,
    // with hysteresis so it doesn't jitter when the marker sits near center.
    useEffect(() => {
        if (!selectedEvent) return;
        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const p = projectedRef.current;
            if (!p || !p.visible) return;
            const w = window.innerWidth;
            setCardSide(prev => {
                if (prev === 'right' && p.x > w * 0.62) return 'left';
                if (prev === 'left' && p.x < w * 0.38) return 'right';
                return prev;
            });
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [selectedEvent]);

    // Arrow-key navigation through events. Left/Right step through EVENTS
    // (cycling at the ends). Esc closes the details panel.
    useEffect(() => {
        if (stage !== 'ready') return;
        const onKey = (e: KeyboardEvent) => {
            // Ignore if the user is typing into an input/textarea/contenteditable
            const t = e.target as HTMLElement | null;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const dir = e.key === 'ArrowRight' ? 1 : -1;
                const idx = selectedId
                    ? EVENTS.findIndex(ev => ev.id === selectedId)
                    : -1;
                const next = idx === -1
                    ? (dir === 1 ? 0 : EVENTS.length - 1)
                    : (idx + dir + EVENTS.length) % EVENTS.length;
                setSelectedId(EVENTS[next].id);
            } else if (e.key === 'Escape' && selectedId) {
                e.preventDefault();
                setSelectedId(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [stage, selectedId]);

    return (
        <div className={`app stage-${stage}`}>
            <EventBackground event={selectedEvent} />
            {stage !== 'ready' && (
                <div className="splash-overlay" aria-hidden="true">
                    <h1 className="splash-title" ref={splashTitleRef}>
                        Atlante
                    </h1>
                </div>
            )}
            <header className="nav">
                <div className="nav-left">
                    <div className="nav-mark" aria-hidden="true">
                        <span className="nav-mark-glyph" aria-hidden="true">
                            <svg viewBox="-12 -12 24 24" width="14" height="14">
                                <path
                                    fill="currentColor"
                                    d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z"
                                />
                            </svg>
                        </span>
                    </div>
                    <div className="nav-titles">
                        <h1 className="nav-title" ref={navTitleRef}>Atlante</h1>
                        <p className="nav-subtitle">A Visual History of the World</p>
                    </div>
                </div>
                <button
                    type="button"
                    className={`nav-menu-toggle${menuOpen ? ' is-open' : ''}`}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <span className="nav-menu-bar" />
                    <span className="nav-menu-bar" />
                    <span className="nav-menu-bar" />
                </button>
                <nav
                    className={`nav-links${menuOpen ? ' is-open' : ''}`}
                    aria-label="Social links"
                    onClick={() => setMenuOpen(false)}
                >
                    <a
                        className="nav-link"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Portfolio"
                        title="Portfolio"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 8 3 12l5 4M16 8l5 4-5 4M14 5l-4 14"
                            />
                        </svg>
                    </a>
                    <a
                        className="nav-link"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        title="GitHub"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"
                            />
                        </svg>
                    </a>
                    <a
                        className="nav-link"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        title="LinkedIn"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"
                            />
                        </svg>
                    </a>
                    <div className="nav-drawer-byline" aria-label="Author">
                        <span className="nav-drawer-byline-label">By</span>
                        <span className="nav-drawer-byline-name">Ujwal</span>
                    </div>
                </nav>
            </header>
            <div className="globe-stage">
                <Globe
                    markers={markers}
                    selectedId={selectedId}
                    onMarkerClick={setSelectedId}
                    projectedRef={projectedRef}
                />
            </div>
            <Connector
                projectedRef={projectedRef}
                cardRef={cardRef}
                cardSide={cardSide}
                active={selectedEvent !== null}
            />
            <DetailsPanel
                ref={cardRef}
                event={selectedEvent}
                side={cardSide}
                onClose={() => setSelectedId(null)}
            />
            <Timeline selectedId={selectedId} onSelect={setSelectedId} />
            <div className="byline" aria-label="Author">
                <span className="byline-label">By</span>
                <span className="byline-name">Ujwal</span>
            </div>
        </div>
    );
}
