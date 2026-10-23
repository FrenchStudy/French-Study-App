// memory-palace.js - the "Memory palace" step in Vocab.
// Each topic with a palace is a picture of a place cut open (a house, a station, a street of shops).
// Every word sits in the room where it happens, as an object you can tap.
// Modes: Explore (tap anything), Walk through (room by room, in order; each stop is read out, "Play the walk" moves on
// by itself), Quiz (names hidden: find the object).
//
//   MemoryPalace.has(themeId)                      -> true if that topic has a palace
//   MemoryPalace.mount(el, themeId, words, opts)   -> draws it into el
//       words: the deck's words ({ key, fr, en, gender, pos })
//       opts.say(text): speak French; opts.grade(word, ok): record a quiz answer
//
// Palace data: zones are rooms (x, y, w, h in the scene's own units); items are objects
// { k: word key, e: emoji, z: zone id, l: one line linking the object to the word }.
// A zone with k is itself a word (la cuisine): its name tag can be tapped too.
// Words that are not in the deck are skipped, so a palace never shows a word the topic lacks.
(function () {
const PALACES = {
    // ---------------- La Maison & Les Pièces ----------------
    15: {
        title: 'La maison des Martin', w: 1160, h: 790,
        backdrop: { roof: [190, 950, 112], ground: 640, sign: 'Maison Martin', block: [962, 1150, 318] },
        zones: [
            { id: 'grenier', k: 'grenier', fr: 'le grenier', en: 'attic', x: 330, y: 114, w: 500, h: 128 },
            { id: 'chambre', k: 'chambre', fr: 'la chambre', en: 'bedroom', x: 190, y: 250, w: 340, h: 150 },
            { id: 'sdb', k: 'salle de bains', fr: 'la salle de bains', en: 'bathroom', x: 540, y: 250, w: 410, h: 150 },
            { id: 'entree', k: 'entrée', fr: "l'entrée", en: 'hall', x: 190, y: 410, w: 150, h: 150, cols: 2 },
            { id: 'salon', k: 'salon', fr: 'le salon', en: 'living room', x: 350, y: 410, w: 250, h: 150 },
            { id: 'cuisine', k: 'cuisine', fr: 'la cuisine', en: 'kitchen', x: 610, y: 410, w: 340, h: 150 },
            { id: 'sous', k: 'sous-sol', fr: 'le sous-sol', en: 'basement', x: 190, y: 652, w: 760, h: 128 },
            { id: 'immeuble', k: 'immeuble', fr: "l'immeuble", en: 'block of flats', x: 962, y: 328, w: 188, h: 302, cols: 2 },
            { id: 'jardin', k: 'jardin', fr: 'le jardin', en: 'garden', x: 0, y: 404, w: 180, h: 236, cols: 1 },
        ],
        items: [
            { k: 'toit', e: '🏠', z: 'grenier', l: 'Right above the attic: the roof, where the pigeons sit.' },
            { k: 'grenier', e: '📦', z: 'grenier', l: 'Old boxes of toys under the roof: the attic. Grain (grain) was once kept here, hence grenier.' },
            { k: 'lit', e: '🛏️', z: 'chambre', l: 'The bed in the bedroom: you lie in your lit.' },
            { k: 'armoire', e: '👗', z: 'chambre', l: 'Knights kept their armour in it: today it holds your clothes.' },
            { k: 'lampe', e: '💡', z: 'chambre', l: 'The bedside lamp: almost the same word.' },
            { k: 'fenêtre', e: '🪟', z: 'chambre', l: 'To defenestrate is to throw someone out of a window.' },
            { k: 'douche', e: '🚿', z: 'sdb', l: 'A douche of cold water: the shower.' },
            { k: 'baignoire', e: '🛁', z: 'sdb', l: 'Where you take a bain (bath): the bathtub.' },
            { k: 'toilettes', e: '🚽', z: 'sdb', l: 'Toilettes, always plural in French.' },
            { k: 'porte', e: '🚪', z: 'entree', l: 'The front door: a portal into the house.' },
            { k: 'escalier', e: '🪜', z: 'entree', l: 'The stairs go up from the hall. An escalator is a moving escalier.' },
            { k: 'canapé', e: '🛋️', z: 'salon', l: 'The sofa: a canapé is also a snack served on a little "sofa" of bread.' },
            { k: 'fauteuil', e: '💺', z: 'salon', l: 'The armchair by the fire, with a footstool.' },
            { k: 'mur', e: '🧱', z: 'salon', l: 'A mural is painted on a mur: the wall.' },
            { k: 'frigo', e: '🧊', z: 'cuisine', l: 'Frigid cold inside: the fridge.' },
            { k: 'table', e: '🍽️', z: 'cuisine', l: 'The kitchen table, set for dinner.' },
            { k: 'chaise', e: '🪑', z: 'cuisine', l: 'A chaise longue is a long chair; this one is short.' },
            { k: 'placard', e: '🗄️', z: 'cuisine', l: 'Stick a placard on the cupboard door.' },
            { k: 'cave', e: '🍷', z: 'sous', l: 'Not a cave: a cellar full of wine bottles.' },
            { k: 'garage', e: '🚗', z: 'sous', l: 'The car sleeps in the garage, down in the basement.' },
            { k: 'appartement', e: '🏢', z: 'immeuble', l: 'Next door: flats stacked on top of each other.' },
            { k: 'studio', e: '1️⃣', z: 'immeuble', l: 'One room for everything: a studio flat.' },
            { k: 'ascenseur', e: '🛗', z: 'immeuble', l: 'It ascends: the lift.' },
            { k: 'balcon', e: '🌿', z: 'immeuble', l: 'Plants on the balcony of the third floor.' },
            { k: 'piscine', e: '🏊', z: 'jardin', l: 'Pisces is the fish sign: swim like a fish in the pool.' },
            { k: 'terrasse', e: '☀️', z: 'jardin', l: 'Breakfast in the sun on the terrace.' },
        ],
    },

    // ---------------- Transport & Travel ----------------
    22: {
        title: 'Gare, aéroport et route', w: 1160, h: 720,
        backdrop: { roof: [190, 760, 104], arch: true, ground: 670, sign: 'Gare de Lyon', tower: [770, 1150] },
        zones: [
            { id: 'port', fr: 'Le port', en: 'Harbour', x: 0, y: 122, w: 180, h: 346, cols: 1 },
            { id: 'gare', fr: 'La gare', en: 'Station', x: 190, y: 122, w: 570, h: 346 },
            { id: 'aero', k: 'aéroport', fr: "l'aéroport", en: 'airport', x: 770, y: 122, w: 380, h: 346 },
            { id: 'route', k: 'route', fr: 'la route', en: 'road', x: 0, y: 478, w: 1150, h: 180 },
        ],
        items: [
            { k: 'bateau', e: '⛴️', z: 'port', l: 'The ferry waits at the quay: le bateau.' },
            { k: 'horaire', e: '🕒', z: 'gare', l: 'The big board with the hours of every train: the timetable.' },
            { k: 'départ', e: '🛫', z: 'gare', l: 'Departures on the left of the board.' },
            { k: 'arrivée', e: '🛬', z: 'gare', l: 'Arrivals on the right.' },
            { k: 'retard', e: '⏰', z: 'gare', l: 'Tardy: your train is late again.' },
            { k: 'annulation', e: '❌', z: 'gare', l: 'Annulled: a red cross over the 8:15 train.' },
            { k: 'correspondance', e: '🔁', z: 'gare', l: 'A connection: change trains here, like letters corresponding.' },
            { k: 'voie', e: '🛤️', z: 'gare', l: 'The way, the track: "voie 5" is platform 5.' },
            { k: 'terminus', e: '🏁', z: 'gare', l: 'The end of the line: everybody off.' },
            { k: 'contrôleur', e: '🎫', z: 'gare', l: 'The inspector controls your ticket.' },
            { k: 'composter', e: '🎟️', z: 'gare', l: 'Punch your ticket in the yellow machine, or it is not valid.' },
            { k: 'monter', e: '⬆️', z: 'gare', l: 'Mount the steps: get on the train.' },
            { k: 'descendre', e: '⬇️', z: 'gare', l: 'Descend the steps: get off.' },
            { k: 'changer', e: '🔄', z: 'gare', l: 'Change trains at Lyon.' },
            { k: 'place', e: '💺', z: 'gare', l: 'Your seat: "place 42".' },
            { k: 'réserver', e: '📅', z: 'gare', l: 'Reserve your seat before you travel.' },
            { k: 'avion', e: '✈️', z: 'aero', l: 'Aviation: the plane on the runway.' },
            { k: 'vol', e: '🛩️', z: 'aero', l: 'The flight takes off (and a thief also vole: steals).' },
            { k: 'enregistrement', e: '🏷️', z: 'aero', l: 'Check-in: they register your name and tag your bag.' },
            { k: 'bagage', e: '🧳', z: 'aero', l: 'Your baggage on the belt.' },
            { k: "porte d'embarquement", e: '🚪', z: 'aero', l: 'The door (porte) where you embark: the boarding gate.' },
            { k: 'douane', e: '🛃', z: 'aero', l: 'Customs: pay your duty (douane) on what you bring back.' },
            { k: 'voiture', e: '🚗', z: 'route', l: 'Hop in the car, we are going on a tour (voi-TOUR).' },
            { k: 'taxi', e: '🚕', z: 'route', l: 'The yellow taxi at the station door.' },
            { k: 'moto', e: '🏍️', z: 'route', l: 'A motorbike zooms past.' },
            { k: 'vélo', e: '🚲', z: 'route', l: 'Velocity on a bike: le vélo.' },
            { k: 'tram', e: '🚊', z: 'route', l: 'The tram rings its bell.' },
            { k: 'autoroute', e: '🛣️', z: 'route', l: 'Auto (car) + route (road): the motorway.' },
            { k: 'station-service', e: '⛽', z: 'route', l: 'Fill up at the petrol station.' },
            { k: 'essence', e: '🛢️', z: 'route', l: 'Petrol: the essence that makes the engine run.' },
            { k: 'parking', e: '🅿️', z: 'route', l: 'Park in le parking.' },
            { k: 'location de voiture', e: '🔑', z: 'route', l: 'Rent a car: they hand you the keys. Location = renting!' },
        ],
    },

    // ---------------- Café, Food & Ordering ----------------
    18: {
        title: 'La rue gourmande', w: 1160, h: 900,
        backdrop: { ground: 890, street: true },
        zones: [
            { id: 'boul', k: 'boulangerie', fr: 'la boulangerie', en: 'bakery', x: 10, y: 20, w: 370, h: 250, shop: '#b45309' },
            { id: 'cafe', k: 'café', fr: 'le café', en: 'café', x: 390, y: 20, w: 380, h: 250, shop: '#0f766e' },
            { id: 'bouch', k: 'boucherie', fr: 'la boucherie', en: "butcher's", x: 780, y: 20, w: 370, h: 250, shop: '#be123c' },
            { id: 'marche', k: 'marché', fr: 'le marché', en: 'market', x: 10, y: 290, w: 560, h: 250, shop: '#15803d' },
            { id: 'resto', fr: 'Le restaurant', en: 'Restaurant', x: 580, y: 290, w: 570, h: 250, shop: '#4338ca' },
            { id: 'pdj', k: 'petit-déjeuner', fr: 'le petit-déjeuner', en: 'breakfast', x: 10, y: 560, w: 560, h: 150, shop: '#a16207' },
            { id: 'epi', k: 'épicerie', fr: "l'épicerie", en: 'grocery shop', x: 580, y: 560, w: 570, h: 150, shop: '#7c3aed' },
        ],
        items: [
            { k: 'croissant', e: '🥐', z: 'boul', l: 'Crescent-shaped, warm from the oven.' },
            { k: 'baguette', e: '🥖', z: 'boul', l: 'A long stick of bread under your arm.' },
            { k: 'pain', e: '🍞', z: 'boul', l: 'Fresh bread straight out of the pan.' },
            { k: 'gâteau', e: '🎂', z: 'boul', l: 'A fancy gâteau in the window.' },
            { k: 'tarte', e: '🥧', z: 'boul', l: 'A fruit tart, cut in eight.' },
            { k: 'café', e: '☕', z: 'cafe', l: 'A little black coffee at the counter.' },
            { k: 'thé', e: '🍵', z: 'cafe', l: 'Tea: "tay", as in many languages.' },
            { k: 'chocolat chaud', e: '🍫', z: 'cafe', l: 'Hot (chaud) chocolate for the children.' },
            { k: "jus d'orange", e: '🧃', z: 'cafe', l: 'Juice of orange, freshly squeezed.' },
            { k: 'eau', e: '💧', z: 'cafe', l: '"Oh!" says the waiter: a carafe of water, free.' },
            { k: 'lait', e: '🥛', z: 'cafe', l: 'Café au lait: coffee with milk.' },
            { k: 'bière', e: '🍺', z: 'cafe', l: 'A cold beer on the terrace.' },
            { k: 'jambon', e: '🍖', z: 'bouch', l: 'From the jambe (leg) of the pig: ham.' },
            { k: 'poulet', e: '🍗', z: 'bouch', l: 'Poultry: a roast chicken turning on the spit.' },
            { k: 'bœuf', e: '🥩', z: 'bouch', l: 'Beef, as in bœuf bourguignon.' },
            { k: 'porc', e: '🥓', z: 'bouch', l: 'Pork chops on the counter.' },
            { k: 'poisson', e: '🐟', z: 'marche', l: 'Fish on ice. (Careful: poison is le poison.)' },
            { k: 'pomme', e: '🍎', z: 'marche', l: 'A pyramid of apples.' },
            { k: 'banane', e: '🍌', z: 'marche', l: 'Bananas, of course.' },
            { k: 'fraise', e: '🍓', z: 'marche', l: 'Fragrant strawberries in a punnet.' },
            { k: 'tomate', e: '🍅', z: 'marche', l: 'Tomatoes, still on the vine.' },
            { k: 'pomme de terre', e: '🥔', z: 'marche', l: 'Apple of the earth: a potato, still muddy.' },
            { k: 'carotte', e: '🥕', z: 'marche', l: 'Carrots with their green tops.' },
            { k: 'oignon', e: '🧅', z: 'marche', l: 'Onions that make the seller cry.' },
            { k: 'haricots verts', e: '🫛', z: 'marche', l: 'Green (vert) beans (haricots).' },
            { k: 'entrée', e: '🥗', z: 'resto', l: 'The starter: the dish you "enter" the meal with. (Not the main course!)' },
            { k: 'plat principal', e: '🍽️', z: 'resto', l: 'The principal plate: the main course.' },
            { k: 'dessert', e: '🍮', z: 'resto', l: 'Dessert: same word, one S for the desert!' },
            { k: 'soupe', e: '🍲', z: 'resto', l: 'Onion soup with melted cheese on top.' },
            { k: 'salade', e: '🥬', z: 'resto', l: 'A green salad on the side.' },
            { k: 'frites', e: '🍟', z: 'resto', l: 'Fried potatoes: fries.' },
            { k: 'pâtes', e: '🍝', z: 'resto', l: 'Pasta: pâtes sounds like "pat".' },
            { k: 'riz', e: '🍚', z: 'resto', l: 'Rice: drop the C.' },
            { k: 'glace', e: '🍨', z: 'resto', l: 'Ice cream: cold as glass ice.' },
            { k: 'beurre', e: '🧈', z: 'pdj', l: '"Brrr", the butter is cold from the fridge.' },
            { k: 'confiture', e: '🍯', z: 'pdj', l: 'Strawberry jam: a confection of fruit.' },
            { k: 'œufs', e: '🥚', z: 'pdj', l: 'Two eggs: "Oof!" one fell.' },
            { k: 'fromage', e: '🧀', z: 'pdj', l: 'Good cheese comes from age.' },
            { k: 'sucre', e: '🍬', z: 'pdj', l: 'Sucrose: sugar for your coffee.' },
            { k: 'supermarché', e: '🛒', z: 'epi', l: 'A super market, with trolleys.' },
            { k: 'pâtisserie', e: '🧁', z: 'epi', l: 'Pastries: next door to the grocer.' },
        ],
    },
};

// ---------- small helpers ----------
const NS = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function mk(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
}
const CSS = `
.mp-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px}
.mp-title{font-weight:900;font-size:1.25rem;color:#0f172a}
.mp-modes{display:flex;gap:4px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:4px}
.mp-modes button{font-weight:700;font-size:14px;color:#475569;background:transparent;border:0;border-radius:9px;padding:8px 12px;min-height:40px;cursor:pointer}
.mp-modes button[aria-pressed="true"]{background:#4f46e5;color:#fff}
.mp-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}
@media (max-width:1023px){.mp-grid{grid-template-columns:minmax(0,1fr)}}
.mp-scene{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow-x:auto}
.mp-scene svg{display:block;min-width:780px;width:100%;height:auto}
.mp-tools{display:flex;flex-wrap:wrap;gap:8px}
.mp-zoom{display:flex;align-items:center;gap:2px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:4px}
.mp-zoom button{font-weight:800;font-size:16px;color:#334155;background:transparent;border:0;border-radius:9px;min-width:40px;min-height:40px;padding:0 10px;cursor:pointer}
.mp-zoom button:hover:not(:disabled){background:#f1f5f9}
.mp-zoom button:disabled{opacity:.35;cursor:default}
.mp-zoom .mp-fullbtn{font-size:14px;color:#4f46e5}
.mp-zoom button:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.mp-zl{font-size:13px;font-weight:700;color:#64748b;min-width:44px;text-align:center;font-variant-numeric:tabular-nums}
.mp-full{position:fixed;inset:0;margin:0!important;z-index:60;background:#f8fafc;overflow:auto;display:flex;flex-direction:column;gap:12px;
  padding:calc(env(safe-area-inset-top,0px) + 12px) max(16px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 12px) max(16px,env(safe-area-inset-left,0px))}
.mp-full .mp-grid{flex:1;min-height:0}
.mp-full .mp-scene{max-height:calc(100vh - 110px);overflow:auto}
@media (max-width:1023px){.mp-full .mp-scene{max-height:58vh}}
.mp-full .mp-hint{display:none}
.mp-lock,.mp-lock body{overflow:hidden}
.mp-hint{font-size:13px;color:#64748b;margin-top:6px}
.mp-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:10px}
@media (min-width:1024px){.mp-card{position:sticky;top:12px}}
.mp-eyebrow{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5}
.mp-big{font-size:1.75rem;font-weight:900;line-height:1.15;overflow-wrap:anywhere}
.mp-en{font-size:1.1rem;font-weight:700;color:#047857}
.mp-link{background:#eef2ff;border-radius:12px;padding:10px 12px;color:#1e293b}
.mp-hook{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;color:#1e293b;font-size:15px}
.mp-row{display:flex;flex-wrap:wrap;gap:8px}
.mp-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:10px 14px;min-height:44px;cursor:pointer}
.mp-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.mp-btn:disabled{opacity:.45;cursor:default}
.mp-muted{font-size:14px;color:#64748b}
.mp-fb{font-weight:700}.mp-fb.ok{color:#047857}.mp-fb.no{color:#be123c}
.mp-m{color:#0369a1}.mp-f{color:#e11d48}
.mp-modes button:focus-visible,.mp-btn:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.mp-spot{cursor:pointer}.mp-spot:focus{outline:none}
.mp-spot .d{fill:#fff;stroke:#cbd5e1;stroke-width:2;transition:stroke .15s,fill .15s}
.mp-spot:hover .d,.mp-spot:focus-visible .d{stroke:#6366f1}
.mp-spot.on .d{stroke:#4f46e5;stroke-width:4;fill:#eef2ff}
.mp-spot.right .d{stroke:#059669;stroke-width:4}.mp-spot.wrong .d{stroke:#e11d48;stroke-width:4}
.mp-spot .em{font-size:27px;text-anchor:middle;dominant-baseline:central;pointer-events:none}
.mp-spot .ar{font-size:11px;fill:#64748b;text-anchor:middle;pointer-events:none}
.mp-spot .wd{font-size:12.5px;font-weight:700;text-anchor:middle;pointer-events:none;fill:#0f172a}
.mp-spot .wd.m{fill:#0369a1}.mp-spot .wd.f{fill:#e11d48}
.mp-tag{cursor:pointer}.mp-tag rect{fill:#f1f5f9;stroke:#cbd5e1}.mp-tag:hover rect,.mp-tag:focus-visible rect{stroke:#6366f1}
.mp-tag.on rect{fill:#eef2ff;stroke:#4f46e5;stroke-width:3}.mp-tag.right rect{stroke:#059669;stroke-width:3}.mp-tag.wrong rect{stroke:#e11d48;stroke-width:3}
.mp-tag text{font-size:13px;font-weight:800;pointer-events:none}.mp-tag:focus{outline:none}
.mp-quiz .mp-spot .ar,.mp-quiz .mp-spot .wd,.mp-quiz .mp-tag text.lbl{visibility:hidden}
.mp-quiz .mp-spot.done .ar,.mp-quiz .mp-spot.done .wd,.mp-quiz .mp-tag.done text.lbl{visibility:visible}
.mp-zone-en{font-size:12px;fill:#64748b}
@media (prefers-reduced-motion:reduce){.mp-spot .d{transition:none}}
`;
function injectCss() {
    if (document.getElementById('mp-css')) return;
    const s = document.createElement('style'); s.id = 'mp-css'; s.textContent = CSS; document.head.appendChild(s);
}

// ---------- drawing ----------
function drawBackdrop(svg, P) {
    const b = P.backdrop || {};
    mk('rect', { x: 0, y: 0, width: P.w, height: P.h, fill: '#e0f2fe' }, svg);
    mk('rect', { x: 0, y: b.ground || P.h, width: P.w, height: P.h - (b.ground || P.h), fill: '#d1e7d6' }, svg);
    if (b.street) {
        const sy = typeof b.street === 'number' ? b.street : 718;
        mk('rect', { x: 0, y: 0, width: P.w, height: P.h, fill: b.sky || '#f1f5f9' }, svg);
        mk('rect', { x: 0, y: sy, width: P.w, height: P.h - sy, fill: b.streetColor || '#cbd5e1' }, svg);
        if (!b.noDashes) for (let x = 30; x < P.w; x += 120) mk('rect', { x, y: sy + 82, width: 60, height: 8, rx: 4, fill: '#fff' }, svg);
        mk('text', { x: P.w / 2, y: sy + 52, 'text-anchor': 'middle', style: 'font-size:22px;font-weight:900;fill:#475569' }, svg).textContent = b.streetName || 'Rue de la Gourmandise';
    }
    if (b.roof) {
        const [x1, x2, top] = b.roof;
        if (b.arch) mk('path', { d: `M${x1 - 8} ${top + 10} Q${(x1 + x2) / 2} ${top - 70} ${x2 + 8} ${top + 10} Z`, fill: '#334155' }, svg);
        else mk('path', { d: `M${x1 - 14} ${top} L${(x1 + x2) / 2} ${top - 64} L${x2 + 14} ${top} Z`, fill: '#334155' }, svg);
        mk('rect', { x: x1 - 6, y: top, width: x2 - x1 + 12, height: (b.ground || P.h) - top + 8, rx: 4, fill: '#334155' }, svg);
        if (b.sign) {
            const cx = (x1 + x2) / 2;
            mk('rect', { x: cx - 90, y: top - 50, width: 180, height: 32, rx: 8, fill: '#fff' }, svg);
            mk('text', { x: cx, y: top - 29, 'text-anchor': 'middle', style: 'font-size:15px;font-weight:900;fill:#1e293b' }, svg).textContent = b.sign;
        }
    }
    if (b.block) { const [x1, x2, top] = b.block; mk('rect', { x: x1 - 6, y: top, width: x2 - x1 + 12, height: (b.ground || P.h) - top + 8, rx: 4, fill: '#475569' }, svg); }
    if (b.tower) { const [x1, x2] = b.tower; mk('rect', { x: x1 - 6, y: 112, width: x2 - x1 + 12, height: 364, rx: 4, fill: '#475569' }, svg);
        mk('rect', { x: x2 - 70, y: 40, width: 46, height: 76, rx: 4, fill: '#475569' }, svg); mk('rect', { x: x2 - 80, y: 30, width: 66, height: 16, rx: 4, fill: '#334155' }, svg); }
}

// positions of the objects in each zone: rows of evenly spaced spots
function layout(P, items) {
    const pos = {};
    P.zones.forEach(z => {
        const its = items.filter(it => it.z === z.id);
        if (!its.length) return;
        const cols = Math.max(1, Math.min(its.length, z.cols || Math.floor(z.w / 82)));
        const rows = Math.ceil(its.length / cols);
        its.forEach((it, i) => {
            const r = Math.floor(i / cols), inRow = Math.min(cols, its.length - r * cols), c = i % cols;
            const step = z.w / inRow;
            pos[it.k] = [z.x + step * (c + 0.5), z.y + (z.shop ? 76 : 64) + r * 108];
        });
        z._rows = rows;
    });
    return pos;
}

// ---------- the step ----------
function mount(root, themeId, deckWords, opts = {}) {
    const P = PALACES[themeId];
    P.items = P.items.map(it => Array.isArray(it) ? { k: it[0], e: it[1], z: it[2], l: it[3] } : it);
    if (!P || !root) return;
    injectCss();
    const say = opts.say || (() => {});
    const grade = opts.grade || (() => {});
    const byKey = Object.fromEntries((deckWords || []).map(w => [w.key, w]));
    const items = P.items.filter(it => byKey[it.k]).map(it => ({ ...it, w: byKey[it.k] }));
    const tags = P.zones.filter(z => z.k && byKey[z.k] && !items.some(it => it.k === z.k)).map(z => ({ k: z.k, z: z.id, tag: true, w: byKey[z.k], e: '' }));
    const all = items.concat(tags);
    // walking order: zone by zone, the room name first
    const order = [];
    P.zones.forEach(z => { tags.filter(t => t.z === z.id).forEach(t => order.push(t)); items.filter(it => it.z === z.id).forEach(it => order.push(it)); });
    const zoneOf = Object.fromEntries(P.zones.map(z => [z.id, z]));
    const gc = (w) => w.gender === 'm' ? 'm' : w.gender === 'f' ? 'f' : '';

    root.innerHTML = `
        <div class="mp-top">
            <div><div class="mp-eyebrow">Memory palace</div><div class="mp-title">${esc(P.title)}</div></div>
            <div class="mp-tools">
                <div class="mp-modes" role="group" aria-label="Palace mode">
                    <button type="button" data-m="explore" aria-pressed="true">Explore</button>
                    <button type="button" data-m="walk" aria-pressed="false">Walk through</button>
                    <button type="button" data-m="quiz" aria-pressed="false">Quiz</button>
                </div>
                <div class="mp-zoom" role="group" aria-label="Picture size">
                    <button type="button" data-z="-1" aria-label="Smaller">−</button>
                    <span class="mp-zl" aria-live="polite">100%</span>
                    <button type="button" data-z="1" aria-label="Bigger">+</button>
                    <button type="button" class="mp-fullbtn" data-full aria-pressed="false">⤢ Enlarge</button>
                </div>
            </div>
        </div>
        <div class="mp-grid">
            <div><div class="mp-scene"></div><p class="mp-hint">Tap an object to see and hear the word. Use + and − or ⤢ Enlarge to make the picture bigger; slide it sideways on a phone.</p></div>
            <div class="mp-card" aria-live="polite"></div>
        </div>`;
    const sceneBox = root.querySelector('.mp-scene');
    const card = root.querySelector('.mp-card');
    const svg = mk('svg', { viewBox: `0 0 ${P.w} ${P.h}`, role: 'img', 'aria-label': `${P.title}: one object for each word` });
    sceneBox.appendChild(svg);
    drawBackdrop(svg, P);

    // rooms
    P.zones.forEach(z => {
        if (z.shop) {
            mk('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 6, fill: '#fff', stroke: '#cbd5e1' }, svg);
            mk('rect', { x: z.x, y: z.y, width: z.w, height: 30, rx: 6, fill: z.shop }, svg);
            for (let x = z.x + 10; x < z.x + z.w - 10; x += 36) mk('path', { d: `M${x} 0 l18 0 l-9 12 z`, transform: `translate(0 ${z.y + 30})`, fill: z.shop, opacity: 0.55 }, svg);
        } else {
            mk('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 4, fill: '#ffffff' }, svg);
            mk('rect', { x: z.x, y: z.y + z.h - 12, width: z.w, height: 12, fill: '#e2e8f0' }, svg);
        }
    });
    const spots = new Map();
    function hookUp(g, it) {
        g.addEventListener('click', () => pick(it));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(it); } });
        spots.set(it, g);
    }
    // room name tags (a word themselves when the zone has k)
    P.zones.forEach(z => {
        const tag = tags.find(t => t.z === z.id);
        const label = tag ? tag.w.fr : z.fr;
        const y = z.y + (z.shop ? 20 : 20);
        if (tag) {
            const g = mk('g', { class: 'mp-tag', tabindex: 0, role: 'button', 'aria-label': `${label}: ${tag.w.en}` }, svg);
            const wpx = Math.max(70, label.length * 8 + 22);
            mk('rect', { x: z.x + 8, y: y - 15, width: wpx, height: 24, rx: 12 }, g);
            mk('text', { x: z.x + 8 + wpx / 2, y: y + 2, 'text-anchor': 'middle', class: 'lbl', fill: gc(tag.w) === 'f' ? '#e11d48' : gc(tag.w) === 'm' ? '#0369a1' : '#0f172a' }, g).textContent = label;
            if (z.shop) g.querySelector('rect').setAttribute('style', 'fill:#fff');
            hookUp(g, tag);
        } else {
            mk('text', { x: z.x + 12, y: y + 2, style: `font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;fill:${z.shop ? '#fff' : '#64748b'}` }, svg).textContent = label;
        }
        if (z.w > 200) mk('text', { x: z.x + z.w - 12, y: y + 2, 'text-anchor': 'end', class: 'mp-zone-en', style: z.shop ? 'fill:#fff' : '' }, svg).textContent = z.en;
    });
    // objects
    const pos = layout(P, items);
    items.forEach(it => {
        const [x, y] = pos[it.k];
        const w = it.w;
        const m = /^(le\/la |le |la |les |l['’]|un |une )(.*)$/i.exec(w.fr);
        const art = m ? m[1].trim() : '';
        const word = m ? m[2] : w.fr;
        const g = mk('g', { class: 'mp-spot', tabindex: 0, role: 'button', 'aria-label': `${w.fr}: ${w.en}` }, svg);
        mk('circle', { cx: x, cy: y, r: 26, class: 'd' }, g);
        mk('text', { x, y: y + 1, class: 'em' }, g).textContent = it.e;
        mk('text', { x, y: y + 42, class: 'ar' }, g).textContent = art;
        const parts = word.length > 12 && word.includes(' ') ? [word.slice(0, word.indexOf(' ')), word.slice(word.indexOf(' ') + 1)] : [word];
        parts.forEach((p, i) => mk('text', { x, y: y + 57 + i * 14, class: 'wd ' + gc(w) }, g).textContent = p);
        hookUp(g, it);
    });

    // ---------- modes ----------
    // ---------- size: zoom steps and a full-screen view ----------
    const ZOOMS = [1, 1.25, 1.5, 2, 2.5];
    let zi = 0;
    function applyZoom(keepCentre) {
        const z = ZOOMS[zi];
        const cx = sceneBox.scrollLeft + sceneBox.clientWidth / 2, cy = sceneBox.scrollTop + sceneBox.clientHeight / 2;
        const oldW = svg.clientWidth || 1, oldH = svg.clientHeight || 1;
        svg.style.width = (z * 100) + '%';
        svg.style.minWidth = Math.round(780 * z) + 'px';
        root.querySelector('.mp-zl').textContent = Math.round(z * 100) + '%';
        root.querySelector('[data-z="-1"]').disabled = zi === 0;
        root.querySelector('[data-z="1"]').disabled = zi === ZOOMS.length - 1;
        if (keepCentre) {   // keep the same spot in the middle while zooming
            const kx = svg.clientWidth / oldW, ky = svg.clientHeight / oldH;
            sceneBox.scrollLeft = cx * kx - sceneBox.clientWidth / 2;
            sceneBox.scrollTop = cy * ky - sceneBox.clientHeight / 2;
        }
    }
    root.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => {
        zi = Math.max(0, Math.min(ZOOMS.length - 1, zi + Number(b.dataset.z)));
        applyZoom(true);
    }));
    const fullBtn = root.querySelector('[data-full]');
    function setFull(on) {
        root.classList.toggle('mp-full', on);
        document.documentElement.classList.toggle('mp-lock', on);
        fullBtn.setAttribute('aria-pressed', on);
        fullBtn.textContent = on ? '✕ Close' : '⤢ Enlarge';
        if (on && zi === 0 && window.innerWidth < 700) { zi = 1; }
        applyZoom(false);
        fullBtn.focus();
    }
    fullBtn.addEventListener('click', () => setFull(!root.classList.contains('mp-full')));
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('mp-full')) setFull(false); });
    applyZoom(false);

    let mode = 'explore', quiz = null;
    const modeBtns = root.querySelectorAll('.mp-modes button');
    modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    function clearMarks() { spots.forEach(g => g.classList.remove('on', 'right', 'wrong', 'done')); }
    function highlight(it) {
        spots.forEach(g => g.classList.remove('on'));
        if (!it) return;
        const g = spots.get(it); g.classList.add('on');
        const bb = g.getBBox(), px = (bb.x + bb.width / 2) / P.w * svg.clientWidth, py = (bb.y + bb.height / 2) / P.h * svg.clientHeight;
        const left = sceneBox.scrollWidth > sceneBox.clientWidth ? Math.max(0, px - sceneBox.clientWidth / 2) : 0;
        const top = sceneBox.scrollHeight > sceneBox.clientHeight ? Math.max(0, py - sceneBox.clientHeight / 2) : 0;
        if (left || top || sceneBox.scrollLeft || sceneBox.scrollTop) sceneBox.scrollTo({ left, top, behavior: 'smooth' });
    }
    // Auto walk: speaks each stop and moves on by itself until paused
    let autoTimer = null;
    const AUTO_MS = 3200;
    function stopAuto() { clearTimeout(autoTimer); autoTimer = null; }
    function setMode(m) {
        stopAuto();
        mode = m;
        modeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
        svg.classList.toggle('mp-quiz', m === 'quiz');
        clearMarks();
        if (m === 'explore') intro();
        if (m === 'walk') show(0, true);
        if (m === 'quiz') startQuiz();
    }
    function intro() {
        card.innerHTML = `<div class="mp-eyebrow">How it works</div>
            <div class="mp-big">Walk the rooms</div>
            <p class="mp-muted">Each of the ${all.length} words sits in the place where it happens. Walk through once, then close your eyes and walk it again in your head, naming each object in French.</p>
            <p class="mp-muted"><b class="mp-m">Blue</b> = masculine, <b class="mp-f">red</b> = feminine.</p>
            <div class="mp-row"><button type="button" class="mp-btn pri" data-a="walk">Start the walk →</button></div>`;
        card.querySelector('[data-a="walk"]').addEventListener('click', () => setMode('walk'));
    }
    function wordHtml(it) {
        const z = zoneOf[it.z], w = it.w;
        const hook = window.WordMemory && WordMemory.hook(w);
        return `<div class="mp-eyebrow">${esc(z.fr)} · ${esc(z.en)}</div>
            <div class="mp-big mp-${gc(w) || 'n'}">${esc(w.fr)}</div>
            <div class="mp-en">${esc(w.en)}</div>
            ${it.l ? `<div class="mp-link">${it.e} ${esc(it.l)}</div>` : ''}
            ${hook ? `<div class="mp-hook">💡 ${WordMemory.hookHtml(hook)}</div>` : ''}`;
    }
    function show(i, walking) {
        const it = walking ? order[i] : i;
        highlight(it);
        if (walking && autoTimer) clearTimeout(autoTimer);   // a tap on the picture replaces the pending step
        const auto = walking && autoTimer !== null;
        card.innerHTML = wordHtml(it) + `<div class="mp-row">
            <button type="button" class="mp-btn" data-a="say">🔊 Listen</button>
            ${walking ? `<button type="button" class="mp-btn" data-a="prev" ${i === 0 ? 'disabled' : ''}>← Back</button>
                         <button type="button" class="mp-btn pri" data-a="next">${i === order.length - 1 ? 'Finish' : 'Next →'}</button>` : ''}
            </div>${walking ? `<div class="mp-row"><button type="button" class="mp-btn" data-a="auto" aria-pressed="${auto}">${auto ? '⏸ Pause' : '▶ Play the walk'}</button></div>
            <p class="mp-muted">Stop ${i + 1} of ${order.length}${auto ? ' · moving on by itself' : ''}</p>` : ''}`;
        card.querySelector('[data-a="say"]').addEventListener('click', () => say(it.w.fr));
        if (walking) {
            // Each stop reads its word out as soon as you reach it
            say(it.w.fr);
            const next = () => {
                if (!root.isConnected || !card.offsetParent) return stopAuto();   // left the palace: stop talking
                if (i === order.length - 1) { stopAuto(); walkDone(); } else show(i + 1, true);
            };
            card.querySelector('[data-a="prev"]').addEventListener('click', () => { stopAuto(); show(Math.max(0, i - 1), true); });
            card.querySelector('[data-a="next"]').addEventListener('click', () => { if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = 0; } next(); });
            card.querySelector('[data-a="auto"]').addEventListener('click', () => {
                if (autoTimer !== null) { stopAuto(); show(i, true); return; }
                autoTimer = 0; next();
            });
            if (autoTimer !== null) autoTimer = setTimeout(next, AUTO_MS);
        }
    }
    function walkDone() {
        highlight(null);
        card.innerHTML = `<div class="mp-eyebrow">Walk finished</div><div class="mp-big">Now close your eyes</div>
            <p class="mp-muted">Picture the place room by room and name each object in French. Then test yourself: the names disappear and you find the objects.</p>
            <div class="mp-row"><button type="button" class="mp-btn pri" data-a="quiz">Take the quiz</button><button type="button" class="mp-btn" data-a="again">Walk again</button></div>`;
        card.querySelector('[data-a="quiz"]').addEventListener('click', () => setMode('quiz'));
        card.querySelector('[data-a="again"]').addEventListener('click', () => setMode('walk'));
    }
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    function startQuiz() { quiz = { list: shuffle(all), k: 0, score: 0, tries: 0 }; ask(); }
    function ask() {
        highlight(null);
        if (quiz.k >= quiz.list.length) {
            const n = quiz.list.length;
            card.innerHTML = `<div class="mp-eyebrow">Quiz done</div><div class="mp-big">${quiz.score} / ${n}</div>
                <p class="mp-muted">${quiz.score >= n * 0.85 ? 'Excellent: the place is in your head. Words found first time move up in your reviews.' : 'Walk through once more, then try again. It gets easier each time.'}</p>
                <div class="mp-row"><button type="button" class="mp-btn pri" data-a="again">Try again</button><button type="button" class="mp-btn" data-a="walk">Walk through</button></div>`;
            card.querySelector('[data-a="again"]').addEventListener('click', () => setMode('quiz'));
            card.querySelector('[data-a="walk"]').addEventListener('click', () => setMode('walk'));
            return;
        }
        const it = quiz.list[quiz.k];
        quiz.tries = 0;
        card.innerHTML = `<div class="mp-eyebrow">Find it</div><div class="mp-big">${esc(it.w.en)}</div>
            <p class="mp-muted">Tap the object (or room name) that means this. Names stay hidden until you find them.</p>
            <p class="mp-fb" id="mp-fb"></p><p class="mp-muted">Score ${quiz.score} · ${quiz.k + 1} of ${quiz.list.length}</p>`;
    }
    function quizTap(it) {
        const want = quiz.list[quiz.k];
        if (it === want) {
            const first = quiz.tries === 0;
            if (first) quiz.score++;
            grade(it.w, first);
            const g = spots.get(it); g.classList.add('right', 'done');
            say(it.w.fr);
            card.innerHTML = wordHtml(it) + `<p class="mp-fb ok">${first ? 'Right first time!' : 'Found it.'}</p>
                <div class="mp-row"><button type="button" class="mp-btn" data-a="say">🔊 Listen</button><button type="button" class="mp-btn pri" data-a="next">Next →</button></div>
                <p class="mp-muted">Score ${quiz.score} · ${quiz.k + 1} of ${quiz.list.length}</p>`;
            card.querySelector('[data-a="say"]').addEventListener('click', () => say(it.w.fr));
            card.querySelector('[data-a="next"]').addEventListener('click', () => { g.classList.remove('right'); quiz.k++; ask(); });
            highlight(it);
        } else {
            quiz.tries++;
            const g = spots.get(it); g.classList.add('wrong'); setTimeout(() => g.classList.remove('wrong'), 600);
            const fb = card.querySelector('#mp-fb'), z = zoneOf[want.z];
            if (fb) { fb.className = 'mp-fb no'; fb.textContent = quiz.tries >= 2 ? `Hint: look in ${z.fr} (${z.en}).` : 'Not that one. Try again.'; }
        }
    }
    function pick(it) {
        if (mode === 'quiz') { if (!spots.get(it).classList.contains('done')) quizTap(it); return; }
        if (mode === 'walk') { show(order.indexOf(it), true); return; }
        show(it, false);
        say(it.w.fr);
    }
    intro();
}

// more palaces live in js/palaces-data.js (loaded before this file)
Object.assign(PALACES, window.PALACE_DATA || {});

window.MemoryPalace = {
    has: (id) => !!PALACES[id],
    css: injectCss,   // other step-2 tools (the World map) reuse these styles
    mount,
    _data: PALACES   // for tests
};
})();
