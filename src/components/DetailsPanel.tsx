import { forwardRef } from 'react';
import {
    CATEGORY_ICONS,
    CATEGORY_LABELS,
    formatYear,
    type HistoricalEvent,
} from '../data/events';

interface DetailsPanelProps {
    event: HistoricalEvent | null;
    onClose: () => void;
    side?: 'left' | 'right';
}

const DetailsPanel = forwardRef<HTMLElement, DetailsPanelProps>(
    function DetailsPanel({ event, onClose, side = 'right' }, ref) {
        const isOpen = event !== null;

        return (
            <aside
                ref={ref}
                className={`details-panel side-${side}${isOpen ? ' is-open' : ''}`}
                aria-hidden={!isOpen}
            >
                {event && (
                    <>
                        <button
                            className="details-close"
                            onClick={onClose}
                            aria-label="Close details"
                        >
                            ×
                        </button>
                        <div className="details-eyebrow">
                            <span className="details-icon">{CATEGORY_ICONS[event.category]}</span>
                            <span>{CATEGORY_LABELS[event.category]}</span>
                        </div>
                        <h2 className="details-title">{event.title}</h2>
                        <div className="details-meta">
                            <span className="details-year">{formatYear(event.year)}</span>
                            <span className="details-dot" aria-hidden="true">·</span>
                            <span className="details-location">{event.location}</span>
                        </div>
                        <div className="details-rule" aria-hidden="true" />
                        <p className="details-description">{event.description}</p>
                    </>
                )}
            </aside>
        );
    },
);

export default DetailsPanel;
