// word-anim.js - small moving pictures for words a still picture can't show (directions, places).
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

const SCENES = {
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
