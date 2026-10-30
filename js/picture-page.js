// picture-page.js - bilingual picture pages: step 2 of Vocab topics about things you can see, in place of
// the memory palace. A drawn scene with each object labelled in French (blue = le, pink = la) and English.
//   Explore  tap an object or its label: hear it, see the meaning and the gender; English labels can be hidden
//   Point    hear a word, tap the object
//   Name it  labels hidden, one object glows, pick its name from four
// Point and Name it count like the memory palace: right first time moves the word up a box.
// Pages: PAGES[themeId] = { name, next, title, w, h, scene (SVG background), items: [{ key, fr, g, en, x, ly, d }] }
//   key = the word in the topic list; fr = what is shown and said (with le / la / l'); x, ly = label position; d = SVG of the object
//   optional: lines (label on several lines), fs (label size), pl (plural), nobox (no bigger tap box)
// Several pictures in tabs: { name, next, title, credit, scenes: [{ title, w, h, minw, scene, items }] } (minw: on phones the picture
//   keeps this width and scrolls sideways, so small objects stay big enough to tap)
//   VocabTools[themeId] = { name, next, mount(el, { say, grade, words }) }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().replace(/^(le |la |les |l'|l’)/, '').replace(/[.!?…\s]+$/g, '').trim();
const CO = { m: '#0369a1', f: '#e11d48' };

const PAGES = {};
// ---------------- 35 Cooking & Recipes: la cuisine ----------------
PAGES[35] = {
    name: 'Picture', next: 'Explore the kitchen picture', title: 'La cuisine', w: 680, h: 560,
    credit: '3D pictures: Microsoft Fluent Emoji (MIT licence)',
    scene: `<defs><pattern id="pp-tile" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#F7F1E3"/><path d="M34 0V34H0" fill="none" stroke="#E6DCC6" stroke-width="1.5"/></pattern></defs>
      <rect width="680" height="335" fill="url(#pp-tile)"/>
      <rect x="450" y="24" width="200" height="170" rx="6" fill="#fff" stroke="#C9B48F" stroke-width="6"/><rect x="456" y="30" width="188" height="158" fill="#BFE3F7"/><circle cx="600" cy="70" r="20" fill="#FFE27A"/><path d="M456,160 Q520,120 580,150 Q620,135 644,150 L644,188 L456,188Z" fill="#9DD18C"/><line x1="550" y1="30" x2="550" y2="188" stroke="#C9B48F" stroke-width="5"/><line x1="456" y1="109" x2="644" y2="109" stroke="#C9B48F" stroke-width="5"/>
      <rect x="20" y="132" width="380" height="10" rx="3" fill="#9C6B3F"/><rect x="40" y="142" width="8" height="18" fill="#7A5134"/><rect x="372" y="142" width="8" height="18" fill="#7A5134"/>
      <rect y="330" width="680" height="16" fill="#9AA3AE"/><rect y="346" width="680" height="70" fill="#C98F5A"/>
      <rect y="416" width="680" height="144" fill="#E9D2AE"/><rect y="416" width="680" height="6" fill="#D6B98C"/>`,
    items: [
        { key: 'huile', fr: "l'huile", g: 'f', en: 'oil', x: 70, ly: 162, d: `<defs><linearGradient id="pp-oil" x1="0" x2="1"><stop offset="0" stop-color="#C9A227"/><stop offset=".45" stop-color="#F6DA6A"/><stop offset="1" stop-color="#B08A18"/></linearGradient></defs><path d="M58,130 Q53,127 53,118 L53,88 Q53,75 64,68 L64,52 L76,52 L76,68 Q87,75 87,88 L87,118 Q87,127 82,130Z" fill="url(#pp-oil)"/><rect x="61" y="40" width="18" height="14" rx="4" fill="#7A4E2D"/><path d="M61,86 Q61,78 67,73" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/><line x1="60" y1="92" x2="60" y2="120" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/><ellipse cx="72" cy="104" rx="9" ry="7" fill="#6E9E3A"/><path d="M72,97 Q76,92 80,94" stroke="#4E7A26" stroke-width="2" fill="none"/>` },
        { key: 'sel', fr: "le sel", g: 'm', en: 'salt', x: 150, ly: 162, d: `<image href="media/pictures/sel.webp" x="114.0" y="62" width="72" height="72"/>` },
        { key: 'sucre', fr: "le sucre", g: 'm', en: 'sugar', x: 230, ly: 162, d: `<defs><linearGradient id="pp-sug" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE3EA"/></linearGradient><linearGradient id="pp-bowl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7FB2E5"/><stop offset="1" stop-color="#3F7CC0"/></linearGradient></defs><path d="M198,112 L262,112 Q258,132 230,132 Q202,132 198,112Z" fill="url(#pp-bowl)"/><ellipse cx="230" cy="112" rx="32" ry="6" fill="#A9CDF0"/><g stroke="#C9D2DB" stroke-width="1.5"><rect x="208" y="92" width="22" height="22" rx="4" fill="url(#pp-sug)" transform="rotate(-8,219,103)"/><rect x="230" y="94" width="22" height="22" rx="4" fill="url(#pp-sug)" transform="rotate(10,241,105)"/><rect x="219" y="74" width="22" height="22" rx="4" fill="url(#pp-sug)" transform="rotate(4,230,85)"/></g><g fill="#fff"><circle cx="214" cy="97" r="2"/><circle cx="236" cy="99" r="2"/><circle cx="225" cy="79" r="2"/></g>` },
        { key: 'lait', fr: "le lait", g: 'm', en: 'milk', x: 318, ly: 162, d: `<image href="media/pictures/lait.webp" x="278.0" y="56" width="80" height="80"/>` },
        { key: 'pain', fr: "le pain", g: 'm', en: 'bread', x: 75, ly: 364, d: `<image href="media/pictures/pain.webp" x="25.0" y="242" width="100" height="100"/>` },
        { key: 'couteau', fr: "le couteau", g: 'm', en: 'knife', x: 170, ly: 397, d: `<image href="media/pictures/couteau.webp" x="130.0" y="256" width="80" height="80"/>` },
        { key: 'fromage', fr: "le fromage", g: 'm', en: 'cheese', x: 262, ly: 364, d: `<image href="media/pictures/fromage.webp" x="221.0" y="256" width="82" height="82"/>` },
        { key: 'assiette', fr: "l'assiette", g: 'f', en: 'plate', x: 356, ly: 397, d: `<defs><radialGradient id="pp-plate" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F4F8"/><stop offset="1" stop-color="#C9D3DE"/></radialGradient></defs><ellipse cx="356" cy="326" rx="50" ry="14" fill="#B8C2CE" opacity=".5"/><ellipse cx="356" cy="320" rx="50" ry="15" fill="url(#pp-plate)" stroke="#C3CCD7" stroke-width="1.5"/><ellipse cx="356" cy="319" rx="32" ry="8.5" fill="#F7F9FB" stroke="#DCE3EA" stroke-width="1.2"/><path d="M322,314 Q336,308 352,307" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>` },
        { key: 'poisson', fr: "le poisson", g: 'm', en: 'fish', x: 450, ly: 364, d: `<image href="media/pictures/poisson.webp" x="409.0" y="256" width="82" height="82"/>` },
        { key: 'verre', fr: "le verre", g: 'm', en: 'glass', x: 540, ly: 397, d: `<defs><linearGradient id="pp-glass" x1="0" x2="1"><stop offset="0" stop-color="#D7EEF9"/><stop offset=".5" stop-color="#F6FCFF"/><stop offset="1" stop-color="#C3E2F2"/></linearGradient><linearGradient id="pp-water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9BD6F6"/><stop offset="1" stop-color="#4FA9E3"/></linearGradient></defs><path d="M516,262 L564,262 L558,330 Q540,336 522,330Z" fill="url(#pp-glass)" stroke="#9CC7DE" stroke-width="2"/><path d="M519,286 L561,286 L557,328 Q540,333 523,328Z" fill="url(#pp-water)" opacity=".85"/><ellipse cx="540" cy="286" rx="21" ry="4" fill="#BFE6FA"/><path d="M524,268 L528,322" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>` },
        { key: 'œuf', fr: "l'œuf", g: 'm', en: 'egg', x: 625, ly: 364, d: `<image href="media/pictures/oeuf.webp" x="592.0" y="270" width="66" height="66"/>` },
        { key: 'viande', fr: "la viande", g: 'f', en: 'meat', x: 70, ly: 520, d: `<image href="media/pictures/viande.webp" x="27.0" y="416" width="86" height="86"/>` },
        { key: 'poulet', fr: "le poulet", g: 'm', en: 'chicken', x: 180, ly: 520, d: `<image href="media/pictures/poulet.webp" x="137.0" y="416" width="86" height="86"/>` },
        { key: 'légume', fr: "le légume", g: 'm', en: 'vegetable', x: 295, ly: 520, d: `<image href="media/pictures/brocoli.webp" x="240.0" y="430" width="70" height="70"/><image href="media/pictures/carotte.webp" x="283.0" y="432" width="70" height="70"/>` },
        { key: 'pomme', fr: "la pomme", g: 'f', en: 'apple', x: 410, ly: 520, d: `<image href="media/pictures/pomme.webp" x="371.0" y="422" width="78" height="78"/>` },
        { key: 'beurre', fr: "le beurre", g: 'm', en: 'butter', x: 515, ly: 520, d: `<image href="media/pictures/beurre.webp" x="472.0" y="418" width="86" height="86"/>` },
        { key: 'crème', fr: "la crème", g: 'f', en: 'cream', x: 615, ly: 520, d: `<defs><linearGradient id="pp-pot" x1="0" x2="1"><stop offset="0" stop-color="#DDE3EA"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD3DC"/></linearGradient></defs><path d="M588,458 L642,458 L636,500 Q615,506 594,500Z" fill="url(#pp-pot)" stroke="#B9C3CE" stroke-width="1.5"/><rect x="588" y="470" width="54" height="12" fill="#5B9BD5"/><ellipse cx="615" cy="458" rx="27" ry="7" fill="#F7F3EA" stroke="#E2DACB"/><path d="M600,456 Q606,440 616,446 Q626,438 630,454 Q616,462 600,456Z" fill="#FFFDF7" stroke="#E8E0CF" stroke-width="1.5"/><path d="M608,450 Q615,444 622,449" stroke="#E8E0CF" stroke-width="1.5" fill="none"/><path d="M592,474 L592,496" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>` },
    ],
};

// ---------------- 15 La Maison & Les Pièces: three pictures (made by tools/picture-pages/house.py) ----------------
PAGES[15] = {
    name: 'Picture', next: 'Explore the house pictures', title: 'La maison',
    credit: '3D furniture: Microsoft Fluent Emoji (MIT licence)',
    scenes: [
        { title: 'La maison', w: 900, h: 640, minw: 660, scene: `<defs><linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7"/><stop offset="1" stop-color="#E9F6FD"/></linearGradient>
 <linearGradient id="h-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C7550"/><stop offset="1" stop-color="#7A5636"/></linearGradient></defs>
 <rect width="900" height="474" fill="url(#h-sky)"/><circle cx="855" cy="58" r="26" fill="#FFE27A"/>
 <rect y="474" width="900" height="166" fill="url(#h-earth)"/><rect y="466" width="900" height="10" fill="#7CC36A"/>
 <rect x="170" y="190" width="592" height="284" fill="#CDB89A"/><rect x="170" y="476" width="580" height="126" fill="#8E8A84"/>
 <rect x="182" y="320" width="556" height="8" fill="#A8916F"/>`, items: [
            { key: 'maison', fr: "la maison", g: 'f', en: 'house', x: 75, ly: 150, d: `<image href="media/pictures/maison.webp" x="20" y="18" width="110" height="110"/>` },
            { key: 'toit', fr: "le toit", g: 'm', en: 'roof', x: 690, ly: 112, d: `<path d="M150,196 L460,52 L770,196Z M214,188 L460,96 L706,188Z" fill-rule="evenodd" fill="#B5543A"/><path d="M150,196 L460,52 L770,196" fill="none" stroke="#8E3E29" stroke-width="5" stroke-linejoin="round"/>` },
            { key: 'grenier', fr: "le grenier", g: 'm', en: 'attic', x: 460, ly: 162, d: `<path d="M214,188 L460,96 L706,188Z" fill="#EBDDC6"/><rect x="560" y="164" width="34" height="24" fill="#C79A64"/><rect x="598" y="170" width="26" height="18" fill="#B38655"/><rect x="300" y="168" width="30" height="20" fill="#C79A64"/>` },
            { key: 'premier étage', fr: "le premier étage", g: 'm', en: 'first floor', x: 85, ly: 254, fs: 13, d: `<rect x="12" y="200" width="146" height="118" rx="12" fill="#EEF2FF" stroke="#A5B4FC" stroke-width="2"/><path d="M158,259 L170,259" stroke="#A5B4FC" stroke-width="2"/>` },
            { key: 'rez-de-chaussée', fr: "le rez-de-chaussée", g: 'm', en: 'ground floor', x: 85, ly: 395, fs: 13, d: `<rect x="12" y="330" width="146" height="138" rx="12" fill="#EEF2FF" stroke="#A5B4FC" stroke-width="2"/><path d="M158,399 L170,399" stroke="#A5B4FC" stroke-width="2"/>` },
            { key: 'chambre', fr: "la chambre", g: 'f', en: 'bedroom', x: 287, ly: 224, d: `<rect x="182" y="198" width="148" height="122" fill="#F6E7EF"/><rect x="252" y="292" width="70" height="24" rx="5" fill="#8FB3D9"/><rect x="252" y="284" width="20" height="12" rx="4" fill="#fff"/>` },
            { key: 'fenêtre', fr: "la fenêtre", g: 'f', en: 'window', x: 218, ly: 282, fs: 14, d: `<rect x="193" y="210" width="50" height="50" rx="3" fill="#BFE3F7" stroke="#fff" stroke-width="5"/><path d="M218,212 V258 M195,235 H241" stroke="#fff" stroke-width="3"/>` },
            { key: 'salle de bains', fr: "la salle de bains", g: 'f', en: 'bathroom', x: 457, ly: 222, lines: ["la salle", "de bains"], fs: 14, d: `<rect x="392" y="198" width="130" height="122" fill="#E3F2FB"/><path d="M410,296 h70 v6 q0,14 -14,14 h-42 q-14,0 -14,-14z" fill="#fff" stroke="#9CC7DE" stroke-width="2"/>` },
            { key: 'toilettes', fr: "les toilettes", g: 'f', en: 'toilet', x: 562, ly: 222, lines: ["les", "toilettes"], fs: 14, pl: true, d: `<rect x="526" y="198" width="74" height="122" fill="#EAF4EA"/><rect x="552" y="270" width="22" height="18" rx="3" fill="#fff" stroke="#AAB" stroke-width="1.5"/><path d="M548,292 h30 q0,22 -15,22 q-15,0 -15,-22z" fill="#fff" stroke="#AAB" stroke-width="1.5"/>` },
            { key: 'bureau', fr: "le bureau", g: 'm', en: 'study, office', x: 669, ly: 224, fs: 14, d: `<rect x="604" y="198" width="134" height="122" fill="#FFF4DE"/><rect x="640" y="290" width="70" height="6" fill="#8C6440"/><rect x="646" y="296" width="5" height="22" fill="#8C6440"/><rect x="700" y="296" width="5" height="22" fill="#8C6440"/><rect x="660" y="268" width="30" height="20" rx="2" fill="#334155"/>` },
            { key: 'entrée', fr: "l'entrée", g: 'f', en: 'entrance hall', x: 230, ly: 344, fs: 14, d: `<rect x="182" y="328" width="102" height="142" fill="#F3EAD9"/>` },
            { key: 'porte', fr: "la porte", g: 'f', en: 'door', x: 230, ly: 374, fs: 14, d: `<rect x="208" y="394" width="44" height="74" rx="3" fill="#8C5A35"/><rect x="214" y="400" width="32" height="28" rx="2" fill="#A06A42"/><circle cx="244" cy="434" r="3.5" fill="#F2C94C"/>` },
            { key: 'couloir', fr: "le couloir", g: 'm', en: 'corridor, hallway', x: 322, ly: 344, fs: 14, d: `<rect x="288" y="328" width="104" height="142" fill="#EFE6D6"/>` },
            { key: 'escalier', fr: "l'escalier", g: 'm', en: 'stairs', x: 362, ly: 456, fs: 13, nobox: true, d: `<path d="M288,470 L392,330 L392,470Z" fill="#B98B5E"/><path d="M288,470.0 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M301,452.5 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M314,435.0 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M327,417.5 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M340,400.0 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M353,382.5 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M366,365.0 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/><path d="M379,347.5 h13 v17.5" fill="none" stroke="#8C6440" stroke-width="2"/>` },
            { key: 'salon', fr: "le salon", g: 'm', en: 'living room', x: 472, ly: 346, d: `<rect x="396" y="328" width="156" height="142" fill="#E8F0FB"/><rect x="420" y="430" width="100" height="30" rx="8" fill="#6F8FCF"/><rect x="420" y="416" width="100" height="18" rx="7" fill="#88A6E0"/>` },
            { key: 'salle à manger', fr: "la salle à manger", g: 'f', en: 'dining room', x: 602, ly: 346, lines: ["la salle", "à manger"], fs: 14, d: `<rect x="556" y="328" width="94" height="142" fill="#FBEEDD"/><rect x="572" y="436" width="62" height="6" fill="#8C6440"/><rect x="576" y="442" width="5" height="26" fill="#8C6440"/><rect x="625" y="442" width="5" height="26" fill="#8C6440"/>` },
            { key: 'cuisine', fr: "la cuisine", g: 'f', en: 'kitchen', x: 694, ly: 346, fs: 14, d: `<rect x="654" y="328" width="84" height="142" fill="#F1F7E8"/><rect x="664" y="430" width="64" height="38" fill="#fff" stroke="#AAB" stroke-width="1.5"/><circle cx="680" cy="438" r="4" fill="#556"/><circle cx="712" cy="438" r="4" fill="#556"/>` },
            { key: 'mur', fr: "le mur", g: 'm', en: 'wall', x: 806, ly: 296, d: `<rect x="738" y="190" width="24" height="284" fill="#C46A4A"/><path d="M738,190 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,190 V202" stroke="#E8D3C0" stroke-width="2"/><path d="M738,202 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,202 V214" stroke="#E8D3C0" stroke-width="2"/><path d="M738,214 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,214 V226" stroke="#E8D3C0" stroke-width="2"/><path d="M738,226 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,226 V238" stroke="#E8D3C0" stroke-width="2"/><path d="M738,238 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,238 V250" stroke="#E8D3C0" stroke-width="2"/><path d="M738,250 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,250 V262" stroke="#E8D3C0" stroke-width="2"/><path d="M738,262 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,262 V274" stroke="#E8D3C0" stroke-width="2"/><path d="M738,274 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,274 V286" stroke="#E8D3C0" stroke-width="2"/><path d="M738,286 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,286 V298" stroke="#E8D3C0" stroke-width="2"/><path d="M738,298 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,298 V310" stroke="#E8D3C0" stroke-width="2"/><path d="M738,310 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,310 V322" stroke="#E8D3C0" stroke-width="2"/><path d="M738,322 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,322 V334" stroke="#E8D3C0" stroke-width="2"/><path d="M738,334 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,334 V346" stroke="#E8D3C0" stroke-width="2"/><path d="M738,346 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,346 V358" stroke="#E8D3C0" stroke-width="2"/><path d="M738,358 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,358 V370" stroke="#E8D3C0" stroke-width="2"/><path d="M738,370 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,370 V382" stroke="#E8D3C0" stroke-width="2"/><path d="M738,382 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,382 V394" stroke="#E8D3C0" stroke-width="2"/><path d="M738,394 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,394 V406" stroke="#E8D3C0" stroke-width="2"/><path d="M738,406 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,406 V418" stroke="#E8D3C0" stroke-width="2"/><path d="M738,418 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,418 V430" stroke="#E8D3C0" stroke-width="2"/><path d="M738,430 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,430 V442" stroke="#E8D3C0" stroke-width="2"/><path d="M738,442 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,442 V454" stroke="#E8D3C0" stroke-width="2"/><path d="M738,454 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M750,454 V466" stroke="#E8D3C0" stroke-width="2"/><path d="M738,466 H762" stroke="#E8D3C0" stroke-width="2"/><path d="M744,466 V478" stroke="#E8D3C0" stroke-width="2"/>` },
            { key: 'sous-sol', fr: "le sous-sol", g: 'm', en: 'basement', x: 330, ly: 540, d: `<rect x="182" y="484" width="334" height="112" fill="#B4B0A9"/><rect x="210" y="560" width="40" height="30" fill="#A07A50"/><rect x="420" y="566" width="50" height="24" fill="#A07A50"/>` },
            { key: 'cave', fr: "la cave", g: 'f', en: 'cellar', x: 628, ly: 540, d: `<rect x="520" y="484" width="218" height="112" fill="#8A7E70"/><circle cx="560" cy="566" r="5" fill="#5B1F2A"/><circle cx="560" cy="580" r="5" fill="#5B1F2A"/><circle cx="576" cy="566" r="5" fill="#5B1F2A"/><circle cx="576" cy="580" r="5" fill="#5B1F2A"/><circle cx="592" cy="566" r="5" fill="#5B1F2A"/><circle cx="592" cy="580" r="5" fill="#5B1F2A"/><circle cx="608" cy="566" r="5" fill="#5B1F2A"/><circle cx="608" cy="580" r="5" fill="#5B1F2A"/><circle cx="624" cy="566" r="5" fill="#5B1F2A"/><circle cx="624" cy="580" r="5" fill="#5B1F2A"/><circle cx="640" cy="566" r="5" fill="#5B1F2A"/><circle cx="640" cy="580" r="5" fill="#5B1F2A"/><circle cx="656" cy="566" r="5" fill="#5B1F2A"/><circle cx="656" cy="580" r="5" fill="#5B1F2A"/><circle cx="672" cy="566" r="5" fill="#5B1F2A"/><circle cx="672" cy="580" r="5" fill="#5B1F2A"/><circle cx="688" cy="566" r="5" fill="#5B1F2A"/><circle cx="688" cy="580" r="5" fill="#5B1F2A"/><circle cx="704" cy="566" r="5" fill="#5B1F2A"/><circle cx="704" cy="580" r="5" fill="#5B1F2A"/>` },
            { key: 'jardin', fr: "le jardin", g: 'm', en: 'garden', x: 826, ly: 246, d: `<rect x="758" y="230" width="142" height="240" fill="#BFE3F7" fill-opacity="0.01"/><rect x="758" y="440" width="142" height="30" fill="#8FD07B"/><rect x="862" y="350" width="14" height="94" fill="#7A5134"/><circle cx="869" cy="330" r="30" fill="#4FAF66"/><circle cx="852" cy="350" r="20" fill="#3E9A57"/><circle cx="772" cy="456" r="4" fill="#F48FB1"/><circle cx="790" cy="460" r="4" fill="#FFD54A"/><circle cx="890" cy="458" r="4" fill="#fff"/>` },
            { key: 'terrasse', fr: "la terrasse", g: 'f', en: 'terrace, patio', x: 800, ly: 404, fs: 14, d: `<rect x="752" y="450" width="94" height="18" fill="#C9A06E"/><path d="M752,456 H846 M752,462 H846" stroke="#A9814F" stroke-width="1.5"/><rect x="792" y="432" width="20" height="4" fill="#fff"/><rect x="800" y="436" width="4" height="14" fill="#fff"/><path d="M780,430 Q802,412 824,430Z" fill="#E8574A"/><rect x="801" y="424" width="2" height="12" fill="#666"/>` },
            { key: 'piscine', fr: "la piscine", g: 'f', en: 'swimming pool', x: 830, ly: 556, fs: 14, d: `<rect x="768" y="484" width="124" height="44" rx="6" fill="#4FB6E8" stroke="#E9F6FD" stroke-width="5"/><path d="M780,500 q10,-6 20,0 q10,6 20,0 q10,-6 20,0 q10,6 20,0 q10,-6 20,0" stroke="#BFE9FB" stroke-width="3" fill="none"/>` },
        ] },
        { title: "L'immeuble", w: 900, h: 640, minw: 520, scene: `<defs><linearGradient id="b-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7"/><stop offset="1" stop-color="#EAF6FD"/></linearGradient></defs>
 <rect width="900" height="640" fill="url(#b-sky)"/><rect y="600" width="900" height="40" fill="#9AA3AE"/><rect y="596" width="900" height="6" fill="#C5CCD4"/>
 <circle cx="110" cy="560" r="34" fill="#4FAF66"/><rect x="104" y="566" width="12" height="34" fill="#7A5134"/><circle cx="800" cy="556" r="38" fill="#4FAF66"/><rect x="794" y="566" width="12" height="34" fill="#7A5134"/>`, items: [
            { key: 'immeuble', fr: "l'immeuble", g: 'm', en: 'block of flats, building', x: 450, ly: 36, d: `<rect x="250" y="60" width="400" height="540" fill="#E3CFAE"/><rect x="240" y="56" width="420" height="14" rx="3" fill="#B5543A"/><rect x="262" y="523" width="288" height="69" fill="#F3E3C8"/><rect x="262" y="438" width="288" height="69" fill="#F3E3C8"/><rect x="282" y="452" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="362" y="452" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="442" y="452" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="510" y="452" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="262" y="353" width="288" height="69" fill="#F3E3C8"/><rect x="282" y="367" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="362" y="367" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="442" y="367" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="510" y="367" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="262" y="268" width="288" height="69" fill="#F3E3C8"/><rect x="282" y="282" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="362" y="282" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="442" y="282" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="510" y="282" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="262" y="183" width="288" height="69" fill="#F3E3C8"/><rect x="282" y="197" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="362" y="197" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="442" y="197" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="510" y="197" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="262" y="98" width="288" height="69" fill="#F3E3C8"/><rect x="282" y="112" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="362" y="112" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="442" y="112" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="510" y="112" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/><rect x="400" y="530" width="60" height="70" rx="3" fill="#6B4A2F"/><rect x="404" y="534" width="24" height="62" fill="#9CCBEA" opacity=".7"/><rect x="432" y="534" width="24" height="62" fill="#9CCBEA" opacity=".7"/><rect x="250" y="592" width="400" height="8" fill="#B49B78"/><rect x="250" y="507" width="400" height="8" fill="#B49B78"/><rect x="250" y="422" width="400" height="8" fill="#B49B78"/><rect x="250" y="337" width="400" height="8" fill="#B49B78"/><rect x="250" y="252" width="400" height="8" fill="#B49B78"/><rect x="250" y="167" width="400" height="8" fill="#B49B78"/>` },
            { key: 'ascenseur', fr: "l'ascenseur", g: 'm', en: 'lift, elevator', x: 740, ly: 306, d: `<rect x="560" y="90" width="60" height="510" fill="#A7B0BB"/><path d="M590,90 V600" stroke="#8994A1" stroke-width="2"/><rect x="564" y="268" width="52" height="69" rx="3" fill="#E2E8EF" stroke="#64748B" stroke-width="2"/><path d="M590,270 V335" stroke="#64748B" stroke-width="2"/><path d="M584,254 l6,-8 l6,8z" fill="#22C55E"/><path d="M626,302 H690" stroke="#64748B" stroke-width="2" stroke-dasharray="4 3"/>` },
            { key: 'étage', fr: "l'étage", g: 'm', en: 'floor (storey)', x: 185, ly: 360, d: `<rect x="130" y="268" width="110" height="69" rx="12" fill="#EEF2FF" stroke="#A5B4FC" stroke-width="2"/><text x="185" y="315" text-anchor="middle" font-size="34" font-weight="900" fill="#4F46E5">3e</text><path d="M240,302 H250" stroke="#A5B4FC" stroke-width="2"/>` },
            { key: 'appartement', fr: "l'appartement", g: 'm', en: 'flat, apartment', x: 470, ly: 294, fs: 14, d: `<rect x="262" y="268" width="288" height="69" fill="#FFF1B8"/><path d="M352,268 V337 M420,268 V337" stroke="#C9A53A" stroke-width="3"/>` },
            { key: 'pièce', fr: "la pièce", g: 'f', en: 'room', x: 307, ly: 294, fs: 14, d: `<rect x="264" y="270" width="86" height="65" fill="#FFE07A"/>` },
            { key: 'studio', fr: "le studio", g: 'm', en: 'studio flat', x: 307, ly: 128, fs: 14, d: `<rect x="262" y="98" width="92" height="69" fill="#D9F2E1"/><path d="M354,98 V167" stroke="#4FAF66" stroke-width="3"/>` },
        ] },
        { title: 'Les meubles', w: 900, h: 600, minw: 560, scene: `<rect x="10" y="10" width="440" height="290" rx="16" fill="#F6E7EF"/><rect x="10" y="220" width="440" height="80" fill="#000" fill-opacity=".05"/><text x="26" y="38" font-size="15" font-weight="700" fill="#64748B">dans la chambre</text><rect x="450" y="10" width="440" height="290" rx="16" fill="#E8F0FB"/><rect x="450" y="220" width="440" height="80" fill="#000" fill-opacity=".05"/><text x="466" y="38" font-size="15" font-weight="700" fill="#64748B">dans le salon</text><rect x="10" y="300" width="440" height="290" rx="16" fill="#E3F2FB"/><rect x="10" y="510" width="440" height="80" fill="#000" fill-opacity=".05"/><text x="26" y="328" font-size="15" font-weight="700" fill="#64748B">dans la salle de bains</text><rect x="450" y="300" width="440" height="290" rx="16" fill="#F1F7E8"/><rect x="450" y="510" width="440" height="80" fill="#000" fill-opacity=".05"/><text x="466" y="328" font-size="15" font-weight="700" fill="#64748B">dans la cuisine</text><rect x="470" y="520" width="400" height="10" fill="#B9C3CE"/><rect x="620" y="530" width="250" height="40" fill="#E2E8EF"/>`, items: [
            { key: 'lit', fr: "le lit", g: 'm', en: 'bed', x: 150, ly: 272, d: `<image href="media/pictures/lit.webp" x="70" y="92" width="160" height="160"/>` },
            { key: 'armoire', fr: "l'armoire", g: 'f', en: 'wardrobe', x: 352, ly: 272, d: `<defs><linearGradient id="h-wood" x1="0" x2="1"><stop offset="0" stop-color="#A9764B"/><stop offset=".5" stop-color="#C99464"/><stop offset="1" stop-color="#9A6A42"/></linearGradient></defs>
 <rect x="300" y="70" width="104" height="176" rx="6" fill="url(#h-wood)" stroke="#7A5134" stroke-width="2"/><path d="M352,74 V242" stroke="#7A5134" stroke-width="2.5"/><rect x="342" y="148" width="4" height="22" rx="2" fill="#F2C94C"/><rect x="358" y="148" width="4" height="22" rx="2" fill="#F2C94C"/><rect x="306" y="246" width="10" height="6" fill="#7A5134"/><rect x="388" y="246" width="10" height="6" fill="#7A5134"/>` },
            { key: 'canapé', fr: "le canapé", g: 'm', en: 'sofa', x: 560, ly: 272, d: `<image href="media/pictures/canape.webp" x="485" y="102" width="150" height="150"/>` },
            { key: 'fauteuil', fr: "le fauteuil", g: 'm', en: 'armchair', x: 717, ly: 272, d: `<defs><linearGradient id="h-arm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0A35E"/><stop offset="1" stop-color="#D97A35"/></linearGradient></defs>
 <path d="M672,150 Q672,128 694,128 L740,128 Q762,128 762,150 L762,206 L672,206Z" fill="url(#h-arm)"/><rect x="660" y="180" width="26" height="56" rx="12" fill="#E58A45"/><rect x="748" y="180" width="26" height="56" rx="12" fill="#E58A45"/><rect x="680" y="200" width="74" height="30" rx="10" fill="#F4B47A"/><rect x="668" y="236" width="8" height="12" fill="#7A5134"/><rect x="758" y="236" width="8" height="12" fill="#7A5134"/><path d="M684,140 Q716,132 750,140" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/>` },
            { key: 'chaise', fr: "la chaise", g: 'f', en: 'chair', x: 840, ly: 272, d: `<image href="media/pictures/chaise.webp" x="792" y="156" width="96" height="96"/>` },
            { key: 'baignoire', fr: "la baignoire", g: 'f', en: 'bath, bathtub', x: 140, ly: 564, d: `<image href="media/pictures/baignoire.webp" x="55" y="376" width="170" height="170"/>` },
            { key: 'douche', fr: "la douche", g: 'f', en: 'shower', x: 345, ly: 564, d: `<image href="media/pictures/douche.webp" x="265" y="386" width="160" height="160"/>` },
            { key: 'frigo', fr: "le frigo", g: 'm', en: 'fridge', x: 560, ly: 564, d: `<defs><linearGradient id="h-steel" x1="0" x2="1"><stop offset="0" stop-color="#E5EAF0"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD3DC"/></linearGradient></defs>
 <rect x="512" y="340" width="96" height="196" rx="10" fill="url(#h-steel)" stroke="#9AA6B4" stroke-width="2"/><path d="M512,404 H608" stroke="#9AA6B4" stroke-width="2"/><rect x="592" y="360" width="5" height="30" rx="2.5" fill="#94A3B8"/><rect x="592" y="420" width="5" height="44" rx="2.5" fill="#94A3B8"/><path d="M522,352 V396" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` },
            { key: 'placard', fr: "le placard", g: 'm', en: 'cupboard', x: 765, ly: 446, d: `<rect x="680" y="338" width="170" height="84" rx="6" fill="url(#h-wood)" stroke="#7A5134" stroke-width="2"/><path d="M765,342 V418" stroke="#7A5134" stroke-width="2.5"/><circle cx="756" cy="380" r="4" fill="#F2C94C"/><circle cx="774" cy="380" r="4" fill="#F2C94C"/>` },
        ] },
    ],
};
const CSS = `
.pp{display:grid;gap:10px;max-width:820px}
.pp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pp-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.pp-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.pp-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.pp-btn:focus-visible,.pp-opt:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.pp-en{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:14px;color:#475569;cursor:pointer;min-height:44px}
.pp-en input{width:18px;height:18px;accent-color:#4f46e5}
.pp-leg{font-size:13px;color:#64748b}
.pp-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:10px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.pp-swipe{display:none;font-size:12px;color:#64748b;margin:0 0 4px}
@media (max-width:640px){.pp-swipe.on{display:block}}
.pp-svg{width:100%;height:auto;display:block;border-radius:10px;touch-action:manipulation}
.pp-svg .obj{cursor:pointer;outline:none}
.pp-svg .obj:hover>.shape,.pp-svg .obj:focus-visible>.shape,.pp-svg .obj.hl>.shape{filter:drop-shadow(0 0 6px #6366f1)}
.pp-svg .obj.ok>.shape{filter:drop-shadow(0 0 8px #059669)}
.pp-svg .obj.no>.shape{filter:drop-shadow(0 0 8px #e11d48)}
.pp-svg .lab{cursor:pointer}
.pp-svg .lab text{paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
.pp-panel{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px 14px;min-height:56px;font-size:15px;color:#1e293b}
.pp-big{font-size:1.3rem;font-weight:900}
.pp-small{font-size:13px;color:#64748b}
.pp-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
@media (max-width:340px){.pp-opts{grid-template-columns:1fr}}
.pp-opt{text-align:left;font-size:17px;font-weight:700;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:48px;cursor:pointer}
.pp-opt.ok{background:#ecfdf5;border-color:#059669}.pp-opt.no{background:#fff1f2;border-color:#e11d48}
.pp-fb{font-weight:700;color:#be123c}
.pp-tab[aria-selected="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.pp-scene{display:grid}`;
function css() { if (!document.getElementById('pp-css')) { const s = document.createElement('style'); s.id = 'pp-css'; s.textContent = CSS; document.head.appendChild(s); } }

// A page with several scenes (House: the house, the block of flats, the furniture) gets a row of tabs
function mount(page, root, opts) {
    css();
    if (!page.scenes) return mountScene(page, root, opts);
    root.innerHTML = `<div class="pp"><div class="pp-row pp-scenes" role="tablist" aria-label="Pictures">${page.scenes.map((sc, i) => `<button type="button" role="tab" class="pp-btn pp-tab" data-s="${i}" aria-selected="${i === 0}">${esc(sc.title)}</button>`).join('')}</div><div class="pp-scene"></div></div>`;
    const box = root.querySelector('.pp-scene');
    const show = (i) => {
        root.querySelectorAll('.pp-tab').forEach(b => b.setAttribute('aria-selected', Number(b.dataset.s) === i));
        mountScene({ ...page, ...page.scenes[i] }, box, opts);
    };
    root.querySelectorAll('.pp-tab').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.s))));
    show(0);
}
let showEnglish = true;
function mountScene(page, root, { say, grade, words }) {
    const W = page.items;
    root.innerHTML = `<div class="pp">
      <div class="pp-row" role="group" aria-label="Mode">
        <button type="button" class="pp-btn" data-m="explore" aria-pressed="true">Explore</button>
        <button type="button" class="pp-btn" data-m="point" aria-pressed="false">Point</button>
        <button type="button" class="pp-btn" data-m="name" aria-pressed="false">Name it</button>
        <label class="pp-en"><input type="checkbox" id="pp-en" ${showEnglish ? 'checked' : ''}> English</label>
      </div>
      <div class="pp-leg"><b style="color:${CO.m}">blue = le</b> (masculine) · <b style="color:${CO.f}">pink = la</b> (feminine) · before a vowel it is l', and the colour tells you which</div>
      <div class="pp-card">${page.minw ? '<p class="pp-swipe on">Swipe sideways to see the whole picture.</p>' : ''}<svg class="pp-svg" viewBox="0 0 ${page.w} ${page.h}" role="img" aria-label="${esc(page.title)}"${page.minw ? ` style="min-width:${page.minw}px"` : ''}>${page.scene}<g class="objs"></g><g class="labs"></g></svg></div>
      <div class="pp-panel" id="pp-pn" aria-live="polite"></div>
      ${page.credit ? `<p class="pp-small">${esc(page.credit)}</p>` : ''}</div>`;
    const $ = (s) => root.querySelector(s);
    const objs = $('.objs'), labs = $('.labs'), pn = $('#pp-pn');
    objs.innerHTML = W.map((w, i) => `<g class="obj" data-i="${i}" role="button" tabindex="0" aria-label="${esc(w.fr)}"><g class="shape">${w.d}</g></g>`).join('');
    // a bigger tap area: the box around each object, so a tap in a gap (between the carrot and the broccoli) still counts
    objs.querySelectorAll('.obj').forEach(o => {
        if (W[Number(o.dataset.i)].nobox) return;   // a slanted shape (the stairs) would cover its neighbour
        try {
            const bb = o.querySelector('.shape').getBBox(), pad = 6;
            o.insertAdjacentHTML('afterbegin', `<rect x="${bb.x - pad}" y="${bb.y - pad}" width="${bb.width + 2 * pad}" height="${bb.height + 2 * pad}" fill="#000" fill-opacity="0"/>`);
        } catch (e) { /* not drawn yet: the shape itself is still tappable */ }
    });
    const el = (i) => objs.querySelector(`[data-i="${i}"]`);
    const clear = () => objs.querySelectorAll('.obj').forEach(o => o.classList.remove('hl', 'ok', 'no'));
    const word = (w) => `<span style="color:${CO[w.g]};font-weight:900">${esc(w.fr)}</span>`;
    const wordFor = (w) => (words || []).find(x => plain(x.fr) === plain(w.key) || plain(x.key || '') === plain(w.key));
    const mark = (w, ok) => { const x = wordFor(w); if (x && grade) grade(x, ok); };
    function drawLabels() {
        const en = showEnglish = $('#pp-en').checked;
        labs.innerHTML = W.map((w, i) => {
            const lines = w.lines || [w.fr], fs = w.fs || 15;
            return `<g class="lab" data-i="${i}">${lines.map((t, k) => `<text x="${w.x}" y="${w.ly + k * (fs + 1)}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${CO[w.g]}">${esc(t)}</text>`).join('')}${en ? `<text x="${w.x}" y="${w.ly + lines.length * (fs + 1) - 1}" text-anchor="middle" font-size="${fs - 3}" fill="#475569">${esc(w.en)}</text>` : ''}</g>`;
        }).join('');
        labs.querySelectorAll('.lab').forEach(l => l.addEventListener('click', () => tap(Number(l.dataset.i))));
    }
    let mode = 'explore', q = null;
    function tap(i) {
        const w = W[i];
        if (mode === 'explore') {
            clear(); el(i).classList.add('hl'); say(w.fr);
            pn.innerHTML = `<span class="pp-big">${word(w)}</span> · ${esc(w.en)} <span class="pp-small">(${w.g === 'm' ? 'masculine' : 'feminine'}${w.pl ? ' plural' : ''})</span>`;
            return;
        }
        if (mode !== 'point' || q.done) return;
        if (i === q.t) {
            el(i).classList.add('ok'); q.done = true;
            if (!q.tries) { q.score++; mark(w, true); }
            say(w.fr);
            pn.innerHTML = `✅ ${word(w)} · ${esc(w.en)} <div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn pri" id="pp-nx">Next →</button><span class="pp-small">Score ${q.score} / ${q.n}</span></div>`;
            $('#pp-nx').addEventListener('click', askPoint);
        } else {
            if (!q.tries) mark(W[q.t], false);
            q.tries++; el(i).classList.add('no'); setTimeout(() => el(i).classList.remove('no'), 600);
            $('#pp-fb').textContent = `That is ${w.fr} (${w.en}). Listen again.`;
            say(W[q.t].fr);
        }
    }
    objs.querySelectorAll('.obj').forEach(o => {
        o.addEventListener('click', () => tap(Number(o.dataset.i)));
        o.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(Number(o.dataset.i)); } });
    });
    function next() { if (q.n >= W.length) { finish(); return null; } q.n++; return q.order[q.n - 1]; }
    function finish() {
        clear();
        pn.innerHTML = `<span class="pp-big">${q.score} / ${W.length}</span> right first time. <div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn pri" id="pp-ag">Again</button></div>`;
        $('#pp-ag').addEventListener('click', () => setMode(mode));
    }
    function askPoint() {
        clear(); const t = next(); if (t === null) return;
        q.t = t; q.tries = 0; q.done = false;
        pn.innerHTML = `<b>Listen and tap.</b> <span class="pp-small">${q.n} / ${W.length}</span><div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn" id="pp-pl">🔊 Play again</button><span class="pp-fb" id="pp-fb"></span></div>`;
        $('#pp-pl').addEventListener('click', () => say(W[q.t].fr));
        say(W[t].fr);
    }
    function askName() {
        clear(); const t = next(); if (t === null) return;
        q.done = false; el(t).classList.add('hl');
        const opts = shuffle([t, ...shuffle(W.map((_, i) => i).filter(i => i !== t)).slice(0, 3)]);
        pn.innerHTML = `<b>What is the glowing one?</b> <span class="pp-small">${q.n} / ${W.length}</span><div class="pp-opts">${opts.map(i => `<button type="button" class="pp-opt" data-i="${i}">${esc(W[i].fr)}</button>`).join('')}</div><div id="pp-after" style="margin-top:8px"></div>`;
        let tries = 0;
        pn.querySelectorAll('.pp-opt').forEach(b => b.addEventListener('click', () => {
            if (q.done) return;
            const i = Number(b.dataset.i);
            if (i === t) {
                b.classList.add('ok'); q.done = true;
                if (!tries) { q.score++; mark(W[t], true); }
                say(W[t].fr);
                $('#pp-after').innerHTML = `${word(W[t])} · ${esc(W[t].en)} <div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn pri" id="pp-nx">Next →</button></div>`;
                $('#pp-nx').addEventListener('click', askName);
            } else { if (!tries) mark(W[t], false); tries++; b.classList.add('no'); b.disabled = true; }
        }));
    }
    function setMode(m) {
        mode = m;
        root.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
        clear(); labs.style.display = m === 'explore' ? '' : 'none';
        q = { order: shuffle(W.map((_, i) => i)), n: 0, score: 0 };
        if (m === 'explore') pn.innerHTML = '<span class="pp-small">Tap anything in the picture, or its label, to hear it.</span>';
        else if (m === 'point') askPoint(); else askName();
    }
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    $('#pp-en').addEventListener('change', drawLabels);
    drawLabels(); setMode('explore');
}

window.PicturePages = PAGES;
window.VocabTools = window.VocabTools || {};
for (const id of Object.keys(PAGES)) {
    const p = PAGES[id];
    window.VocabTools[id] = { name: p.name, next: p.next, mount: (el, opts) => mount(p, el, opts) };
}
})();
