import { useEffect, useRef } from 'react';
import type { ProjectedMarker } from './Globe';

interface ConnectorProps {
    projectedRef: React.MutableRefObject<ProjectedMarker | null>;
    cardRef: React.RefObject<HTMLElement | null>;
    cardSide: 'left' | 'right';
    active: boolean;
}

export default function Connector({ projectedRef, cardRef, cardSide, active }: ConnectorProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const lineRef = useRef<SVGLineElement>(null);
    const dotRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        if (!active) {
            // Clear any inline opacity left from the last tick so CSS hides it.
            if (svgRef.current) svgRef.current.style.opacity = '';
            return;
        }
        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const p = projectedRef.current;
            const card = cardRef.current;
            const svg = svgRef.current;
            const line = lineRef.current;
            const dot = dotRef.current;
            if (!p || !card || !svg || !line || !dot) return;
            if (!p.visible) {
                svg.style.opacity = '0';
                return;
            }
            const rect = card.getBoundingClientRect();
            // Anchor the line to the card edge that faces the marker.
            const targetX = cardSide === 'right' ? rect.left : rect.right;
            const targetY = rect.top + rect.height / 2;
            svg.style.opacity = '1';
            line.setAttribute('x1', String(p.x));
            line.setAttribute('y1', String(p.y));
            line.setAttribute('x2', String(targetX));
            line.setAttribute('y2', String(targetY));
            dot.setAttribute('cx', String(p.x));
            dot.setAttribute('cy', String(p.y));
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            if (svgRef.current) svgRef.current.style.opacity = '';
        };
    }, [active, projectedRef, cardRef, cardSide]);

    return (
        <svg
            ref={svgRef}
            className={`connector${active ? ' is-active' : ''}`}
            aria-hidden="true"
        >
            <line
                ref={lineRef}
                stroke="#2a2a25"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.65"
            />
            <circle ref={dotRef} r="3" fill="#2a2a25" />
        </svg>
    );
}
