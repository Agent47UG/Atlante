export type EventCategory =
    | 'civilization'
    | 'war'
    | 'invention'
    | 'discovery'
    | 'religion'
    | 'science'
    | 'art'
    | 'milestone';

export interface HistoricalEvent {
    id: string;
    title: string;
    /** Negative for BCE, positive for CE. */
    year: number;
    lat: number;
    lon: number;
    location: string;
    category: EventCategory;
    description: string;
}

export const EVENTS: HistoricalEvent[] = [
    {
        id: 'homo-sapiens',
        title: 'Emergence of Homo sapiens',
        year: -300000,
        lat: 31.83,
        lon: -8.05,
        location: 'Jebel Irhoud, Morocco',
        category: 'milestone',
        description:
            'The earliest known fossils of anatomically modern humans, dated to roughly 300,000 years ago, were discovered at Jebel Irhoud in Morocco — pushing back the origin of our species and suggesting it emerged across Africa rather than a single region.',
    },
    {
        id: 'cave-art-lascaux',
        title: 'Lascaux Cave Paintings',
        year: -17000,
        lat: 45.05,
        lon: 1.17,
        location: 'Dordogne, France',
        category: 'art',
        description:
            'A complex of caves containing some of the most famous Upper Paleolithic art: vivid depictions of horses, aurochs, and stags painted by early modern humans roughly 17,000 years ago.',
    },
    {
        id: 'agriculture',
        title: 'Birth of Agriculture',
        year: -10000,
        lat: 36.2,
        lon: 38.0,
        location: 'Fertile Crescent',
        category: 'milestone',
        description:
            'The Neolithic Revolution: humans in the Fertile Crescent began cultivating wheat, barley, and legumes, and domesticating sheep and goats — the foundation of settled civilization.',
    },
    {
        id: 'gobekli-tepe',
        title: 'Göbekli Tepe',
        year: -9500,
        lat: 37.22,
        lon: 38.92,
        location: 'Şanlıurfa, Turkey',
        category: 'religion',
        description:
            'The oldest known megalithic temple complex, predating Stonehenge by 6,000 years. Its massive carved T-shaped pillars suggest organized religion may have driven settlement, not the other way around.',
    },
    {
        id: 'sumer',
        title: 'Sumerian Civilization',
        year: -4500,
        lat: 31.0,
        lon: 46.1,
        location: 'Mesopotamia (modern Iraq)',
        category: 'civilization',
        description:
            'The Sumerians founded the world’s first cities — Uruk, Ur, Eridu — and invented cuneiform writing, the wheel, the sexagesimal number system, and codified law.',
    },
    {
        id: 'egypt-old-kingdom',
        title: 'Egyptian Old Kingdom',
        year: -2686,
        lat: 29.98,
        lon: 31.13,
        location: 'Giza, Egypt',
        category: 'civilization',
        description:
            'The Age of the Pyramids. Pharaohs Khufu, Khafre, and Menkaure built the Giza necropolis, an astonishing feat of engineering and the only Ancient Wonder still standing.',
    },
    {
        id: 'indus-valley',
        title: 'Indus Valley Civilization',
        year: -2600,
        lat: 27.33,
        lon: 68.14,
        location: 'Mohenjo-daro, Pakistan',
        category: 'civilization',
        description:
            'A sophisticated Bronze Age culture spanning northwest India and Pakistan, with planned cities, advanced sanitation, standardized weights, and a still-undeciphered script.',
    },
    {
        id: 'stonehenge',
        title: 'Stonehenge Completed',
        year: -2500,
        lat: 51.18,
        lon: -1.83,
        location: 'Wiltshire, England',
        category: 'religion',
        description:
            'A prehistoric monument of standing stones aligned with the solstices. Its purpose remains debated — ritual, calendar, or burial site — but its precision astonishes archaeologists.',
    },
    {
        id: 'shang-dynasty',
        title: 'Shang Dynasty',
        year: -1600,
        lat: 36.1,
        lon: 114.35,
        location: 'Anyang, China',
        category: 'civilization',
        description:
            'The earliest Chinese dynasty confirmed by written records. Famous for oracle bone inscriptions and exquisite bronze ritual vessels.',
    },
    {
        id: 'olmec',
        title: 'Olmec Civilization',
        year: -1200,
        lat: 17.9,
        lon: -94.6,
        location: 'Veracruz, Mexico',
        category: 'civilization',
        description:
            'The mother culture of Mesoamerica. The Olmecs carved colossal basalt heads, developed early writing, and laid foundations for the Maya and Aztec.',
    },
    {
        id: 'iron-age',
        title: 'Iron Age Begins',
        year: -1200,
        lat: 40.0,
        lon: 34.0,
        location: 'Anatolia',
        category: 'invention',
        description:
            'The collapse of the Bronze Age civilizations was followed by the spread of iron metallurgy, originating with the Hittites and transforming agriculture and warfare.',
    },
    {
        id: 'buddha',
        title: 'Life of the Buddha',
        year: -480,
        lat: 27.6,
        lon: 83.47,
        location: 'Lumbini, Nepal',
        category: 'religion',
        description:
            'Siddhartha Gautama attains enlightenment under the Bodhi tree and founds Buddhism, a tradition that would spread across Asia and reshape philosophy and ethics.',
    },
    {
        id: 'athenian-democracy',
        title: 'Athenian Democracy',
        year: -508,
        lat: 37.97,
        lon: 23.73,
        location: 'Athens, Greece',
        category: 'milestone',
        description:
            'Cleisthenes’ reforms gave Athenian citizens direct voice in governance — the first recorded democracy and a touchstone for political thought ever since.',
    },
    {
        id: 'alexander',
        title: 'Conquests of Alexander the Great',
        year: -330,
        lat: 32.5,
        lon: 44.4,
        location: 'Babylon',
        category: 'war',
        description:
            'In just over a decade, Alexander forged the largest empire of the ancient world, from Greece to the Indus, spreading Hellenistic culture across three continents.',
    },
    {
        id: 'roman-empire',
        title: 'Roman Empire Founded',
        year: -27,
        lat: 41.9,
        lon: 12.5,
        location: 'Rome, Italy',
        category: 'civilization',
        description:
            'Octavian becomes Augustus, transitioning Rome from republic to empire. For five centuries Rome would shape law, language, architecture, and governance across the Mediterranean.',
    },
    {
        id: 'jesus',
        title: 'Life of Jesus',
        year: 30,
        lat: 31.78,
        lon: 35.22,
        location: 'Jerusalem',
        category: 'religion',
        description:
            'The ministry, crucifixion, and resurrection of Jesus of Nazareth give rise to Christianity, which would become the world’s largest religion.',
    },
    {
        id: 'maya-classic',
        title: 'Classic Maya Civilization',
        year: 250,
        lat: 17.22,
        lon: -89.62,
        location: 'Tikal, Guatemala',
        category: 'civilization',
        description:
            'Maya city-states flourish in Mesoamerica with monumental pyramids, an intricate calendar, hieroglyphic writing, and advanced astronomy.',
    },
    {
        id: 'islam',
        title: 'Founding of Islam',
        year: 622,
        lat: 21.42,
        lon: 39.83,
        location: 'Mecca and Medina',
        category: 'religion',
        description:
            'The Hijra: Muhammad’s migration from Mecca to Medina marks year one of the Islamic calendar and the beginning of the rapid spread of Islam across Arabia, North Africa, and beyond.',
    },
    {
        id: 'tang-dynasty',
        title: 'Tang Dynasty Golden Age',
        year: 700,
        lat: 34.27,
        lon: 108.95,
        location: 'Chang’an, China',
        category: 'civilization',
        description:
            'A high point of Chinese civilization. Chang’an was the largest city in the world, the Silk Road thrived, and Tang poetry, painting, and woodblock printing flourished.',
    },
    {
        id: 'vikings',
        title: 'Viking Age',
        year: 800,
        lat: 60.39,
        lon: 5.32,
        location: 'Scandinavia',
        category: 'civilization',
        description:
            'Norse seafarers raid, trade, and settle across Europe, reaching Iceland, Greenland, and briefly North America (Vinland) around 1000 CE.',
    },
    {
        id: 'angkor',
        title: 'Angkor Wat',
        year: 1150,
        lat: 13.41,
        lon: 103.87,
        location: 'Angkor, Cambodia',
        category: 'art',
        description:
            'The Khmer Empire builds the largest religious monument in the world, originally Hindu and later Buddhist, with breathtaking bas-reliefs.',
    },
    {
        id: 'mongol',
        title: 'Mongol Empire',
        year: 1206,
        lat: 47.92,
        lon: 106.92,
        location: 'Karakorum, Mongolia',
        category: 'war',
        description:
            'Genghis Khan unites the Mongol tribes and launches the largest contiguous land empire in history, stretching from Korea to Hungary and linking East and West.',
    },
    {
        id: 'black-death',
        title: 'The Black Death',
        year: 1347,
        lat: 50.07,
        lon: 14.43,
        location: 'Europe',
        category: 'milestone',
        description:
            'A bubonic plague pandemic kills roughly a third of Europe’s population, reshaping economy, religion, art, and the balance of power between laborers and lords.',
    },
    {
        id: 'gutenberg',
        title: 'Gutenberg’s Printing Press',
        year: 1440,
        lat: 49.99,
        lon: 8.27,
        location: 'Mainz, Germany',
        category: 'invention',
        description:
            'Movable-type printing made books affordable, ignited literacy, and laid the technological foundation for the Reformation, the Scientific Revolution, and the modern world.',
    },
    {
        id: 'columbus',
        title: 'Columbus Reaches the Americas',
        year: 1492,
        lat: 24.07,
        lon: -74.49,
        location: 'San Salvador, Bahamas',
        category: 'discovery',
        description:
            'European contact with the Americas begins the Columbian Exchange — a transformative and devastating mixing of peoples, plants, animals, and diseases across the Atlantic.',
    },
    {
        id: 'reformation',
        title: 'Protestant Reformation',
        year: 1517,
        lat: 51.87,
        lon: 12.65,
        location: 'Wittenberg, Germany',
        category: 'religion',
        description:
            'Martin Luther’s Ninety-five Theses challenge the Catholic Church, splintering Western Christianity and unleashing centuries of religious, political, and intellectual upheaval.',
    },
    {
        id: 'newton',
        title: 'Newton’s Principia',
        year: 1687,
        lat: 52.21,
        lon: 0.12,
        location: 'Cambridge, England',
        category: 'science',
        description:
            'Isaac Newton publishes the laws of motion and universal gravitation, founding classical mechanics and unifying terrestrial and celestial physics.',
    },
    {
        id: 'us-independence',
        title: 'American Independence',
        year: 1776,
        lat: 39.95,
        lon: -75.16,
        location: 'Philadelphia, USA',
        category: 'milestone',
        description:
            'The Declaration of Independence asserts that governments derive their authority from the consent of the governed — a radical claim that would echo across the world.',
    },
    {
        id: 'french-revolution',
        title: 'French Revolution',
        year: 1789,
        lat: 48.85,
        lon: 2.35,
        location: 'Paris, France',
        category: 'milestone',
        description:
            'The storming of the Bastille ignites a revolution that abolishes the monarchy, proclaims the Rights of Man, and reshapes Europe through a decade of upheaval.',
    },
    {
        id: 'industrial-revolution',
        title: 'Industrial Revolution',
        year: 1800,
        lat: 53.48,
        lon: -2.24,
        location: 'Manchester, England',
        category: 'invention',
        description:
            'Steam power, mechanized textiles, and the factory system transform agrarian societies into industrial ones — and remake labor, cities, and the environment.',
    },
    {
        id: 'darwin',
        title: 'Origin of Species',
        year: 1859,
        lat: 51.51,
        lon: -0.13,
        location: 'London, England',
        category: 'science',
        description:
            'Charles Darwin publishes his theory of evolution by natural selection, reframing biology and humanity’s place in the natural world.',
    },
    {
        id: 'wright-brothers',
        title: 'First Powered Flight',
        year: 1903,
        lat: 36.01,
        lon: -75.67,
        location: 'Kitty Hawk, USA',
        category: 'invention',
        description:
            'Orville and Wilbur Wright fly the first heavier-than-air powered aircraft for 12 seconds, opening the age of aviation.',
    },
    {
        id: 'ww1',
        title: 'World War I',
        year: 1914,
        lat: 50.85,
        lon: 4.35,
        location: 'Europe',
        category: 'war',
        description:
            'A global war involving over 70 million combatants. New industrial weapons produced unprecedented casualties and dissolved four empires.',
    },
    {
        id: 'penicillin',
        title: 'Discovery of Penicillin',
        year: 1928,
        lat: 51.52,
        lon: -0.12,
        location: 'London, England',
        category: 'science',
        description:
            'Alexander Fleming discovers the first true antibiotic. Penicillin would save tens of millions of lives and inaugurate the antibiotic era.',
    },
    {
        id: 'ww2',
        title: 'World War II',
        year: 1939,
        lat: 52.23,
        lon: 21.01,
        location: 'Worldwide',
        category: 'war',
        description:
            'The deadliest conflict in human history. Reshaped geopolitics, launched the nuclear age, and led to the founding of the United Nations and decolonization.',
    },
    {
        id: 'moon-landing',
        title: 'Apollo 11 Moon Landing',
        year: 1969,
        lat: 28.57,
        lon: -80.65,
        location: 'Cape Canaveral, USA',
        category: 'discovery',
        description:
            'Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon, fulfilling President Kennedy’s pledge and capping the Space Race.',
    },
    {
        id: 'internet',
        title: 'The World Wide Web',
        year: 1989,
        lat: 46.23,
        lon: 6.05,
        location: 'CERN, Switzerland',
        category: 'invention',
        description:
            'Tim Berners-Lee proposes a hypertext system at CERN that becomes the World Wide Web, transforming communication, commerce, and culture worldwide.',
    },
    {
        id: 'human-genome',
        title: 'Human Genome Sequenced',
        year: 2003,
        lat: 39.0,
        lon: -77.1,
        location: 'Bethesda, USA',
        category: 'science',
        description:
            'The Human Genome Project completes the first full sequence of human DNA — a landmark for biology and medicine.',
    },
];

export const CATEGORY_ICONS: Record<EventCategory, string> = {
    civilization: '⚑',
    war: '⚔',
    invention: '⚙',
    discovery: '✪',
    religion: '☸',
    science: '⚛',
    art: '✦',
    milestone: '★',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
    civilization: 'Civilization',
    war: 'War',
    invention: 'Invention',
    discovery: 'Discovery',
    religion: 'Religion',
    science: 'Science',
    art: 'Art',
    milestone: 'Milestone',
};

export function formatYear(year: number): string {
    if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
    return `${year} CE`;
}
