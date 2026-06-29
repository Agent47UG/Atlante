import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EVENTS, CATEGORY_ICONS, formatYear } from '../data/events';

interface TimelineProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function Timeline({ selectedId, onSelect }: TimelineProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [offset, setOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [hoverId, setHoverId] = useState<string | null>(null);
    const [tipX, setTipX] = useState(0);
    const [hintX, setHintX] = useState<number | null>(null);
    const showHint = selectedId === null && hintX !== null;

    const hoveredEvent = hoverId ? EVENTS.find((e) => e.id === hoverId) ?? null : null;

    // drag state held in a ref so handlers don't re-create
    const drag = useRef({
        active: false,
        startX: 0,
        startOffset: 0,
        moved: 0,
        pointerId: -1,
        downId: null as string | null,
    });

    const clamp = (x: number) => {
        const vp = viewportRef.current;
        const rail = railRef.current;
        if (!vp || !rail) return x;
        const vpW = vp.clientWidth;
        const railW = rail.scrollWidth;
        if (railW <= vpW) return 0;
        const min = vpW - railW; // negative
        const max = 0;
        return Math.min(max, Math.max(min, x));
    };

    // Center the selected icon when selection changes
    useLayoutEffect(() => {
        if (!selectedId) return;
        const vp = viewportRef.current;
        const el = itemRefs.current[selectedId];
        if (!vp || !el) return;
        const vpRect = vp.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const elCenter = elRect.left + elRect.width / 2;
        const vpCenter = vpRect.left + vpRect.width / 2;
        setOffset((prev) => clamp(prev + (vpCenter - elCenter)));
    }, [selectedId]);

    // Clamp again on resize
    useEffect(() => {
        const onResize = () => setOffset((o) => clamp(o));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Position the "click to start" hint over the first event icon.
    useLayoutEffect(() => {
        if (selectedId !== null) return;
        const measure = () => {
            const vp = viewportRef.current;
            const first = itemRefs.current[EVENTS[0].id];
            if (!vp || !first) return;
            const vpRect = vp.getBoundingClientRect();
            const elRect = first.getBoundingClientRect();
            setHintX(elRect.left + elRect.width / 2 - vpRect.left);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [selectedId, offset]);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        drag.current.active = true;
        drag.current.startX = e.clientX;
        drag.current.startOffset = offset;
        drag.current.moved = 0;
        drag.current.pointerId = e.pointerId;
        // remember which event the pointer started on so we can fire selection on release
        const btn = (e.target as HTMLElement).closest('.tl-event') as HTMLButtonElement | null;
        drag.current.downId = btn?.dataset.eventId ?? null;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        setDragging(true);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.current.active) return;
        const dx = e.clientX - drag.current.startX;
        drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
        setOffset(clamp(drag.current.startOffset + dx));
    };

    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.current.active) return;
        drag.current.active = false;
        try {
            (e.currentTarget as HTMLDivElement).releasePointerCapture(drag.current.pointerId);
        } catch {
            // ignore
        }
        // Treat as a click if the pointer barely moved
        if (e.type === 'pointerup' && drag.current.moved <= 4 && drag.current.downId) {
            onSelect(drag.current.downId);
        }
        drag.current.downId = null;
        setDragging(false);
    };

    const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        // Convert vertical wheel to horizontal pan
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta === 0) return;
        setOffset((o) => clamp(o - delta));
    };

    const updateHoverFromTarget = (target: EventTarget | null) => {
        const btn = (target as HTMLElement | null)?.closest?.('.tl-event') as HTMLButtonElement | null;
        if (!btn) {
            setHoverId(null);
            return;
        }
        const id = btn.dataset.eventId ?? null;
        setHoverId(id);
        const vp = viewportRef.current;
        if (vp && btn) {
            const vpRect = vp.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            setTipX(btnRect.left + btnRect.width / 2 - vpRect.left);
        }
    };

    return (
        <div className="timeline">
            <span className="tl-kbd-hint tl-kbd-hint-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                        d="M15 6 L9 12 L15 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className="tl-kbd-hint tl-kbd-hint-right" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                        d="M9 6 L15 12 L9 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <div
                ref={viewportRef}
                className={`timeline-track${dragging ? ' is-dragging' : ''}`}
                onPointerDown={onPointerDown}
                onPointerMove={(e) => {
                    onPointerMove(e);
                    if (!dragging) updateHoverFromTarget(e.target);
                }}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={() => setHoverId(null)}
                onWheel={onWheel}
            >
                <div className="timeline-spine" aria-hidden="true" />
                <div
                    ref={railRef}
                    className="timeline-rail"
                    style={{
                        transform: `translateX(${offset}px)`,
                        transition: dragging ? 'none' : 'transform 280ms cubic-bezier(0.4,0,0.2,1)',
                    }}
                >
                    {EVENTS.map((e) => {
                        const isSelected = e.id === selectedId;
                        return (
                            <button
                                key={e.id}
                                ref={(el) => {
                                    itemRefs.current[e.id] = el;
                                }}
                                data-event-id={e.id}
                                className={`tl-event${isSelected ? ' is-selected' : ''}`}
                                aria-label={`${e.title} — ${formatYear(e.year)}`}
                                title={`${e.title} · ${formatYear(e.year)}`}
                            >
                                <span className="tl-icon" aria-hidden="true">
                                    {CATEGORY_ICONS[e.category]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="timeline-fade timeline-fade-left" aria-hidden="true" />
            <div className="timeline-fade timeline-fade-right" aria-hidden="true" />
            {showHint && (
                <div
                    className="tl-start-hint"
                    style={{ left: `${hintX}px` }}
                    aria-hidden="true"
                >
                    <span className="tl-start-hint-text">Click here to start</span>
                    <svg
                        className="tl-start-hint-arrow"
                        viewBox="0 0 40 60"
                        width="32"
                        height="48"
                        aria-hidden="true"
                    >
                        <path
                            d="M8 4 Q 28 18, 22 38"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                        />
                        <path
                            d="M16 32 L22 40 L28 30"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            )}
            {hoveredEvent && !dragging && (
                <div
                    className="tl-floating-tip"
                    style={{ left: `${tipX}px` }}
                    aria-hidden="true"
                >
                    <span className="tl-tt-title">{hoveredEvent.title}</span>
                    <span className="tl-tt-year">{formatYear(hoveredEvent.year)}</span>
                </div>
            )}
        </div>
    );
}
