import { useEffect, useState } from 'react';
import type { HistoricalEvent } from '../data/events';

interface Props {
    event: HistoricalEvent | null;
}

// Eagerly import every image under src/assets/events/. The key is the file
// path; we map it down to its base name (the event id) so lookup is trivial.
//   src/assets/events/columbus.jpg  -> 'columbus'
const modules = import.meta.glob<string>(
    '../assets/events/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
    { eager: true, import: 'default', query: '?url' },
);

const imageById: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
    const file = path.split('/').pop() ?? '';
    const id = file.replace(/\.[^.]+$/, '').toLowerCase();
    imageById[id] = url as unknown as string;
}

export default function EventBackground({ event }: Props) {
    // Track the two most recent images so we can crossfade between them.
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [currUrl, setCurrUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!event) {
            setPrevUrl(currUrl);
            setCurrUrl(null);
            return;
        }
        // Optional explicit override on the event itself.
        const override = (event as unknown as { image?: string }).image;
        const url = override ?? imageById[event.id.toLowerCase()] ?? null;
        setPrevUrl(currUrl);
        setCurrUrl(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event?.id]);

    return (
        <div className="event-bg" aria-hidden="true">
            {prevUrl && (
                <div
                    key={prevUrl}
                    className="event-bg-layer is-prev"
                    style={{ backgroundImage: `url("${prevUrl}")` }}
                />
            )}
            {currUrl && (
                <div
                    key={currUrl}
                    className="event-bg-layer is-curr"
                    style={{ backgroundImage: `url("${currUrl}")` }}
                />
            )}
        </div>
    );
}
