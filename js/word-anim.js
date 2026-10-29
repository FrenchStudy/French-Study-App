// word-anim.js - small moving pictures for words a still picture can't show (directions, time, how often).
//   WordAnim.has(key)        -> true when the word has one
//   WordAnim.svg(key, cls)   -> an <svg> string that plays on its own (loops), or ''
// Shown in Learn (the word tile), in the flashcard and in Watch. They are drawn in code: no files to download.
(function () {
const C = { bg: '#eef2ff', road: '#cbd5e1', line: '#ffffff', me: '#4f46e5', goal: '#f59e0b', house: '#94a3b8', roof: '#64748b', tree: '#16a34a', ink: '#334155' };
const DUR = '2.6s';
// pieces
const house = (x, y, fill = C.house) => `<rect x="${x}" y="${y}" width="30" height="24" rx="3" fill="${fill}"/><path d="M${x - 3} ${y} L${x + 15} ${y - 14} L${x + 33} ${y} Z" fill="${C.roof}"/><rect x="${x + 11}" y="${y + 10}" width="8" height="14" rx="1" fill="#fff" opacity=".8"/>`;
const tree = (x, y) => `<rect x="${x - 2}" y="${y}" width="4" height="12" fill="#92400e"/><circle cx="${x}" cy="${y - 4}" r="11" fill="${C.tree}"/>`;
const star = (x, y) => `<path d="M${x} ${y - 9} l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z" fill="${C.goal}"><animate attributeName="opacity" values="1;.35;1" dur="1.3s" repeatCount="indefinite"/></path>`;
// the walker, moving along a path (relative to its start point)
const walker = (x, y, path, dur = DUR, extra = '') => `<g transform="translate(${x} ${y})"><g>
    <circle r="8" fill="${C.me}" stroke="#fff" stroke-width="2.5"/><circle cx="-2.5" cy="-2" r="1.3" fill="#fff"/><circle cx="2.5" cy="-2" r="1.3" fill="#fff"/>
    <animateMotion dur="${dur}" repeatCount="indefinite" path="${path}" keyPoints="0;1;1" keyTimes="0;.75;1" calcMode="linear" ${extra}/></g></g>`;
const arrow = (d, color = C.me) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 7" opacity=".55">
    <animate attributeName="stroke-dashoffset" values="26;0" dur="1s" repeatCount="indefinite"/></path>`;
const head = (x, y, angle, color = C.me) => `<path d="M0 -9 L9 0 L0 9" transform="translate(${x} ${y}) rotate(${angle})" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`;
const roadH = (y, x1 = 0, x2 = 200) => `<rect x="${x1}" y="${y - 14}" width="${x2 - x1}" height="28" fill="${C.road}"/><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.line}" stroke-width="3" stroke-dasharray="10 8"/>`;
const roadV = (x, y1 = 0, y2 = 140) => `<rect x="${x - 14}" y="${y1}" width="28" height="${y2 - y1}" fill="${C.road}"/><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${C.line}" stroke-width="3" stroke-dasharray="10 8"/>`;

// A week: n days light up one after the other (L M M J V S D)
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const week = (lit, label) => DAYS.map((d, i) => {
    const x = 9 + i * 26, on = lit.includes(i), t = (0.08 + i * 0.09).toFixed(2);
    const fill = on ? `<animate attributeName="fill" values="#fff;#fff;${C.goal};${C.goal}" keyTimes="0;${t};${(+t + 0.01).toFixed(2)};1" dur="3s" repeatCount="indefinite"/>` : '';
    return `<rect x="${x}" y="46" width="22" height="30" rx="5" fill="#fff" stroke="${C.house}" stroke-width="2">${fill}</rect><text x="${x + 11}" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="${C.ink}">${d}</text>`;
}).join('') + `<text x="100" y="28" text-anchor="middle" font-size="15" font-weight="800" fill="${C.ink}">${label}</text>`;
// A time line with "now" in the middle; the event is the orange dot
const NOW = 100;
const timeline = (extra = '') => `<line x1="14" y1="86" x2="186" y2="86" stroke="${C.house}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M180 80 L188 86 L180 92" fill="none" stroke="${C.house}" stroke-width="4" stroke-linecap="round"/>` +
    `<line x1="${NOW}" y1="66" x2="${NOW}" y2="106" stroke="${C.me}" stroke-width="3"/><text x="${NOW}" y="122" text-anchor="middle" font-size="12" font-weight="800" fill="${C.me}">maintenant</text>` +
    `<text x="20" y="122" font-size="11" fill="${C.ink}">hier</text><text x="180" y="122" text-anchor="end" font-size="11" fill="${C.ink}">demain</text>` + extra;
const dot = (x, anim = '') => `<circle cx="${x}" cy="86" r="9" fill="${C.goal}" stroke="#fff" stroke-width="2.5">${anim}</circle>`;
const pulse = '<animate attributeName="r" values="8;12;8" dur="1.2s" repeatCount="indefinite"/>';
const icon = (x, y, t, size = 20) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}">${t}</text>`;
const span = (x1, x2, dur = '2.6s', color = C.goal) => `<rect x="${x1}" y="80" height="12" rx="6" fill="${color}" width="0"><animate attributeName="width" values="0;${x2 - x1};${x2 - x1}" keyTimes="0;.75;1" dur="${dur}" repeatCount="indefinite"/></rect>`;

const SCENES = {
    // ---------- 7 Frequency & Time Adverbs: how often (a week) ----------
    'toujours': () => week([0, 1, 2, 3, 4, 5, 6], '7 / 7 jours'),
    'tout le temps': () => week([0, 1, 2, 3, 4, 5, 6], 'tout le temps'),
    "d'habitude": () => week([0, 1, 2, 3, 4, 5], '6 / 7 : d\'habitude'),
    'normalement': () => week([0, 1, 2, 3, 4, 5], '6 / 7 : normalement'),
    'souvent': () => week([0, 1, 2, 3, 4], '5 / 7 jours'),
    'parfois': () => week([0, 2, 4], '3 / 7 jours'),
    'quelquefois': () => week([1, 3, 5], '3 / 7 jours'),
    'de temps en temps': () => week([1, 5], '2 / 7 jours'),
    'jamais': () => week([], '0 / 7 jours') + `<path d="M40 40 L160 82 M160 40 L40 82" stroke="#e11d48" stroke-width="7" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.4;.45;1" dur="3s" repeatCount="indefinite"/></path>`,
    'tôt / tard': () => `<rect x="0" y="100" width="200" height="40" fill="#bbf7d0"/>` +
        `<circle cx="50" cy="110" r="16" fill="${C.goal}"><animate attributeName="cy" values="98;50;50" keyTimes="0;.6;1" dur="3s" repeatCount="indefinite"/></circle>` + icon(50, 132, '6 h', 13) +
        `<circle cx="150" cy="50" r="14" fill="#cbd5e1"/><circle cx="156" cy="45" r="12" fill="${C.bg}"/>` + icon(150, 132, '23 h', 13),

    // ---------- when: a time line around "now" ----------
    'maintenant': () => timeline(dot(NOW, pulse)),
    'en ce moment': () => timeline(dot(NOW, pulse) + icon(NOW, 52, '⏳', 18)),
    'tout de suite': () => timeline(dot(180, '<animate attributeName="cx" values="180;106;106" keyTimes="0;.2;1" dur="2.6s" repeatCount="indefinite"/>') + icon(150, 56, '⚡', 20)),
    'bientôt': () => timeline(arrow('M104 64 H124') + head(128, 64, 0) + dot(130, pulse)),
    "tout à l'heure": () => timeline(dot(132, pulse) + icon(132, 58, '🕒', 16)),
    'déjà': () => timeline(dot(56) + icon(56, 60, '✅', 18)),
    'pas encore': () => timeline(`<circle cx="148" cy="86" r="9" fill="#fff" stroke="${C.goal}" stroke-width="3" stroke-dasharray="4 3"/>` + icon(148, 60, '⌛', 18)),
    'encore': () => timeline(dot(20, '<animate attributeName="cx" values="20;180;20;180" dur="2.6s" repeatCount="indefinite"/>') + icon(NOW, 50, '↻', 22)),
    'récemment': () => timeline(dot(80, pulse)),
    'autrefois': () => timeline(dot(28, pulse) + icon(28, 58, '🏰', 18)),
    'avant': () => timeline(arrow('M96 64 H48') + head(44, 64, 180) + dot(40)),
    'après': () => timeline(arrow('M104 64 H152') + head(156, 64, 0) + dot(160)),
    'pendant': () => timeline(span(26, 84) + icon(55, 60, '⏱️', 18)),
    'depuis': () => timeline(span(36, NOW) + icon(36, 62, '🚩', 16)),
    'longtemps': () => timeline(span(16, 184, '4s') + icon(100, 58, '🐢', 20)),

    // ---------- 21 Directions: chapter 1, where things are ----------
    'à gauche': () => roadH(84) + arrow('M100 60 H40') + head(36, 60, 180) + walker(100, 84, 'M0 0 H-62'),
    'à droite': () => roadH(84) + arrow('M100 60 H160') + head(164, 60, 0) + walker(100, 84, 'M0 0 H62'),
    'tout droit': () => roadV(100) + arrow('M128 120 V24') + head(128, 20, -90) + walker(100, 118, 'M0 0 V-90'),
    'à côté de': () => `<rect x="0" y="104" width="200" height="36" fill="${C.road}"/>` + house(52, 72) + house(118, 72, C.goal) + star(133, 40) + walker(30, 118, 'M0 0 H103'),
    'en face de': () => house(85, 26) + roadH(76) + house(85, 106, C.goal) + star(150, 112) + walker(30, 76, 'M0 0 H70'),
    'près de / loin de': () => `<rect x="0" y="104" width="200" height="36" fill="${C.road}"/>` + tree(40, 88) + `<text x="70" y="30" font-size="14" font-weight="700" fill="${C.ink}">près … loin</text>` +
        walker(62, 118, 'M0 0 H110 H0', '3.6s'),
    'entre': () => `<rect x="0" y="104" width="200" height="36" fill="${C.road}"/>` + tree(48, 88) + tree(152, 88) + walker(10, 118, 'M0 0 H90'),
    'au coin de': () => roadH(96) + roadV(58, 0, 110) + star(84, 70) + walker(180, 96, 'M0 0 H-106 V-14'),
    'au bout de': () => roadH(80, 0, 170) + `<rect x="168" y="56" width="10" height="48" rx="2" fill="${C.roof}"/>` + star(185, 40) + walker(14, 80, 'M0 0 H144'),
    'après / avant': () => [40, 100, 160].map((x, i) => `<rect x="${x - 20}" y="50" width="40" height="40" rx="8" fill="#fff" stroke="${C.house}" stroke-width="3"/><text x="${x}" y="78" text-anchor="middle" font-size="20" font-weight="800" fill="${C.ink}">${i + 1}</text>`).join('') +
        `<rect x="20" y="50" width="40" height="40" rx="8" fill="none" stroke="${C.me}" stroke-width="4"><animate attributeName="x" values="20;80;140;140" keyTimes="0;.35;.7;1" dur="3s" repeatCount="indefinite"/></rect>` +
        `<text x="40" y="118" text-anchor="middle" font-size="12" fill="${C.ink}">avant</text><text x="160" y="118" text-anchor="middle" font-size="12" fill="${C.ink}">après</text>`,

    // ---------- 21 Directions: chapter 2, giving directions ----------
    'allez tout droit.': () => roadV(100) + arrow('M128 120 V24') + head(128, 20, -90) + walker(100, 118, 'M0 0 V-90'),
    'continuez.': () => roadH(80) + `<text x="100" y="34" text-anchor="middle" font-size="22" fill="${C.ink}">→ → →</text>` + walker(10, 80, 'M0 0 H180', '3s'),
    'tournez à gauche.': () => roadV(130, 40, 140) + roadH(54, 0, 144) + arrow('M156 124 V74 Q156 54 136 54 H40') + head(36, 54, 180) + walker(130, 126, 'M0 0 V-72 H-110'),
    'traversez la rue.': () => roadH(70) + [70, 82, 94, 106, 118].map(x => `<rect x="${x}" y="58" width="7" height="24" fill="#fff"/>`).join('') + walker(96, 116, 'M0 0 V-92'),
    'prenez la première rue à droite.': () => roadV(60) + roadH(96, 60, 200) + roadH(36, 60, 200) +
        `<text x="150" y="122" text-anchor="middle" font-size="12" font-weight="700" fill="${C.goal}">1re</text>` + walker(60, 132, 'M0 0 V-36 H120'),
    'suivez la rue.': () => `<path d="M0 110 C60 110 60 40 120 40 S180 70 200 70" fill="none" stroke="${C.road}" stroke-width="26"/>` +
        `<path d="M0 110 C60 110 60 40 120 40 S180 70 200 70" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>` +
        walker(0, 0, 'M8 110 C60 110 60 40 120 40 S180 70 196 70'),
    'descendez la rue.': () => `<path d="M10 30 L190 118" stroke="${C.road}" stroke-width="28" stroke-linecap="round"/>` + house(18, 12) +
        `<text x="150" y="40" font-size="20" fill="${C.ink}">⬇</text>` + walker(22, 36, 'M0 0 L150 74'),
};

window.WordAnim = {
    has: (key) => !!SCENES[key],
    svg(key, cls = '') {
        const f = SCENES[key];
        if (!f) return '';
        let inner = f();
        // People who turn off motion on their device get the still picture
        try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) inner = inner.replace(/<animate(Motion)?\b[^>]*\/>/g, ''); } catch (e) { /* keep it moving */ }
        return `<svg viewBox="0 0 200 140" class="${cls}" role="img" aria-hidden="true" style="max-width:100%"><rect width="200" height="140" rx="16" fill="${C.bg}"/>${inner}</svg>`;
    }
};
})();
