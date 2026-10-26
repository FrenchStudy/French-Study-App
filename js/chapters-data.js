// chapters-data.js - a long topic split into chapters of about 10 words, each with a short story.
//   Chapters.for(themeId) -> [{ title, en, keys: [word keys], story: [[French, English], …] }] or null
//   Chapters.parts(key)   -> [[French, English], …]: the words a phrase is built from, or []
//   Chapters.family(key)  -> [[French, English], …]: other words of the same family, or []
// In a story, [[text]] or [[text|word key]] marks a word of the chapter (tap it to see the meaning).
// Chapters set the order of the Learn page and of new words in Practise; nothing is locked.
// Words of a topic that no chapter lists go into an extra last chapter, and words that look the
// same as in English are left out of the chapters (vocab.html shows them on their own).
(function () {
const CHAPTERS = {
    // ---------------- 31 Environment & Climate ----------------
    31: [
        { title: 'La nature', en: 'Nature around us',
          keys: ['campagne', 'paysage', 'rivière', 'arbre', 'air', 'terre', 'soleil', 'eau', 'saison', 'mer'],
          story: [
            ['Le week-end, je quitte la ville pour la [[campagne]].', 'At the weekend, I leave the city for the countryside.'],
            ['Le [[paysage]] est magnifique : une [[rivière]] traverse les champs et un vieil [[arbre]] donne de l\'ombre.', 'The landscape is beautiful: a river runs through the fields and an old tree gives shade.'],
            ['Je respire l\'[[air]] frais et je sens la [[terre]] mouillée.', 'I breathe the fresh air and smell the wet soil.'],
            ['En été, le [[soleil]] brille et on se baigne dans l\'[[eau]] froide.', 'In summer the sun shines and we swim in the cold water.'],
            ['Mais ma [[saison]] préférée, c\'est l\'automne, quand on va voir la [[mer]] sans les touristes.', 'But my favourite season is autumn, when we go to see the sea without the tourists.'],
          ] },
        { title: 'Quel temps !', en: 'Weather and extremes',
          keys: ['chaleur', 'sécheresse', 'tempête', 'vent', 'inondation', 'neige', 'glace'],
          story: [
            ['Cet été, la [[chaleur]] a duré des semaines et les champs ont souffert de la [[sécheresse]].', 'This summer the heat lasted for weeks and the fields suffered from drought.'],
            ['En automne, au contraire, une violente [[tempête]] a apporté du [[vent]] et des pluies énormes.', 'In autumn, on the other hand, a violent storm brought wind and huge amounts of rain.'],
            ['La rivière a débordé et l\'[[inondation]] a fermé l\'école.', 'The river burst its banks and the flood closed the school.'],
            ['En montagne, il y a moins de [[neige]] et la [[glace]] des lacs est plus fine.', 'In the mountains there is less snow and the ice on the lakes is thinner.'],
          ] },
        { title: 'La planète en danger', en: 'A planet in danger',
          keys: ['charbon', 'pétrole', 'gaz', 'émission', 'menace', 'menacer', 'espèce', 'disparaître'],
          story: [
            ['Depuis deux siècles, nous brûlons du [[charbon]], du [[pétrole]] et du [[gaz]].', 'For two centuries we have burned coal, oil and gas.'],
            ['Ces [[émissions|émission]] réchauffent la planète.', 'These emissions are warming the planet.'],
            ['Le climat change, et c\'est une [[menace]] pour la nature.', 'The climate is changing, and that is a threat to nature.'],
            ['La chaleur et le plastique [[menacent|menacer]] beaucoup d\'animaux.', 'Heat and plastic threaten many animals.'],
            ['Chaque année, des [[espèces|espèce]] [[disparaissent|disparaître]].', 'Every year, species disappear.'],
          ] },
        { title: 'Protéger la planète', en: 'Protecting the planet',
          keys: ['sauver', 'protéger', 'jeter', 'déchet', 'durable', 'vert'],
          story: [
            ['Il n\'est pas trop tard pour [[sauver]] la planète.', 'It isn\'t too late to save the planet.'],
            ['Pour [[protéger]] la nature, on peut commencer chez soi.', 'To protect nature, you can start at home.'],
            ['Ne [[jetez|jeter]] pas vos [[déchets|déchet]] par terre : triez-les.', 'Don\'t throw your rubbish on the ground: sort it.'],
            ['Choisissez des produits [[durables|durable]], qui durent longtemps.', 'Choose sustainable products that last a long time.'],
            ['Et pourquoi pas une ville plus [[verte|vert]], avec des arbres et des parcs ?', 'And why not a greener town, with trees and parks?'],
          ] },
    ],
};

// What a phrase is built from (key -> [[French, English], …])
const PARTS = {
    'changement climatique': [['changer', 'to change'], ['le climat', 'climate']],
    'réchauffement climatique': [['chaud', 'hot'], ['réchauffer', 'to warm up'], ['le climat', 'climate']],
    'effet de serre': [['un effet', 'an effect'], ['une serre', 'a greenhouse']],
    'gaz à effet de serre': [['le gaz', 'gas'], ['l\'effet de serre', 'the greenhouse effect']],
    'empreinte carbone': [['une empreinte', 'a footprint, a print'], ['le carbone', 'carbon']],
    'neutralité carbone': [['neutre', 'neutral'], ['le carbone', 'carbon']],
    'fonte des glaciers': [['fondre', 'to melt'], ['un glacier', 'a glacier']],
    'montée des eaux': [['monter', 'to go up'], ['l\'eau', 'water']],
    'événements météorologiques extrêmes': [['un événement', 'an event'], ['la météo', 'the weather'], ['extrême', 'extreme']],
    'pollution de l\'air': [['la pollution', 'pollution'], ['l\'air', 'air']],
    'perte de biodiversité': [['perdre', 'to lose'], ['la biodiversité', 'biodiversity']],
    'espèces en danger': [['une espèce', 'a species'], ['le danger', 'danger']],
    'faune et la flore': [['la faune', 'wildlife (animals)'], ['la flore', 'plants (flora)']],
    'habitat naturel': [['un habitat', 'a habitat'], ['naturel', 'natural']],
    'disparition des espèces': [['disparaître', 'to disappear'], ['une espèce', 'a species']],
    'réserve naturelle': [['une réserve', 'a reserve'], ['naturel', 'natural']],
    'reboisement': [['re-', 'again'], ['le bois', 'wood, woods']],
    'déforestation': [['dé-', 'un-, removing'], ['la forêt', 'forest']],
    'énergies renouvelables': [['l\'énergie', 'energy'], ['renouveler', 'to renew']],
    'énergie solaire': [['l\'énergie', 'energy'], ['le soleil → solaire', 'sun → solar']],
    'énergie éolienne': [['l\'énergie', 'energy'], ['une éolienne', 'a wind turbine (from Éole, god of the wind)']],
    'combustibles fossiles': [['brûler, la combustion', 'to burn, burning'], ['un fossile', 'a fossil']],
    'sobriété énergétique': [['sobre', 'sober, plain'], ['l\'énergie', 'energy']],
    'tri sélectif': [['trier', 'to sort'], ['sélectif', 'selective']],
    'compostage': [['le compost', 'compost']],
    'déchets plastiques': [['un déchet', 'a piece of rubbish'], ['le plastique', 'plastic']],
    'plastique à usage unique': [['le plastique', 'plastic'], ['un usage', 'a use'], ['unique', 'single, only']],
    'zéro déchet': [['zéro', 'zero'], ['un déchet', 'a piece of rubbish']],
    'gaspillage alimentaire': [['gaspiller', 'to waste'], ['un aliment', 'a food']],
    'consommation responsable': [['consommer', 'to consume'], ['responsable', 'responsible']],
    'circuit court': [['un circuit', 'a circuit, a route'], ['court', 'short']],
    'd\'occasion': [['une occasion', 'an opportunity, a bargain']],
    'économie circulaire': [['l\'économie', 'economy'], ['circulaire', 'circular']],
    'agriculture biologique': [['l\'agriculture', 'farming'], ['bio, biologique', 'organic']],
    'écoblanchiment': [['éco-', 'eco-, green'], ['blanchir', 'to whiten, to whitewash']],
    'transports en commun': [['les transports', 'transport'], ['en commun', 'shared']],
    'transports propres': [['les transports', 'transport'], ['propre', 'clean']],
    'covoiturage': [['co-', 'together'], ['une voiture', 'a car']],
    'autopartage': [['une auto', 'a car'], ['partager', 'to share']],
    'piste cyclable': [['une piste', 'a track'], ['un cycle, un cycliste', 'a bike, a cyclist']],
    'développement durable': [['développer', 'to develop'], ['durable', 'lasting']],
    'transition écologique': [['une transition', 'a change, a transition'], ['écologique', 'ecological']],
    'réseaux d\'eau': [['un réseau', 'a network'], ['l\'eau', 'water']],
    'écoresponsabilité': [['éco-', 'eco-, green'], ['la responsabilité', 'responsibility']],
    'geste écoresponsable': [['un geste', 'a gesture, an action'], ['éco- + responsable', 'green + responsible']],
    'taxe carbone': [['une taxe', 'a tax'], ['le carbone', 'carbon']],
    'lutter contre': [['lutter', 'to fight'], ['contre', 'against']],
    'sensibilisation': [['sensible', 'sensitive, aware'], ['sensibiliser', 'to make aware']],
    'prendre conscience de': [['prendre', 'to take'], ['la conscience', 'awareness']],
    'passer à l\'action': [['passer à', 'to move on to'], ['l\'action', 'action']],
    'faire sa part': [['faire', 'to do'], ['une part', 'a share']],
    'montrer l\'exemple': [['montrer', 'to show'], ['un exemple', 'an example']],
    'à long terme': [['long', 'long'], ['un terme', 'a term, an end']],
    'à court terme': [['court', 'short'], ['un terme', 'a term, an end']],
    'générations futures': [['une génération', 'a generation'], ['futur', 'future']],
    'il est urgent de': [['urgent', 'urgent'], ['il est … de', 'it is … to']],
};

// Word families: learn one, the others come free. Each group lists [French, English] pairs.
const FAMILIES = [
    [['trier', 'to sort'], ['le tri', 'sorting'], ['le tri sélectif', 'waste sorting']],
    [['gaspiller', 'to waste'], ['le gaspillage', 'waste'], ['le gaspillage alimentaire', 'food waste']],
    [['polluer', 'to pollute'], ['la pollution', 'pollution'], ['polluant', 'polluting']],
    [['protéger', 'to protect'], ['la protection', 'protection'], ['protégé', 'protected']],
    [['préserver', 'to preserve'], ['la préservation', 'preservation']],
    [['sensibiliser', 'to raise awareness'], ['la sensibilisation', 'awareness-raising'], ['sensible', 'sensitive, aware']],
    [['recycler', 'to recycle'], ['le recyclage', 'recycling'], ['recyclable', 'recyclable']],
    [['émettre', 'to emit'], ['une émission', 'an emission']],
    [['menacer', 'to threaten'], ['la menace', 'threat'], ['menacé', 'threatened']],
    [['disparaître', 'to disappear'], ['la disparition', 'disappearance'], ['la disparition des espèces', 'extinction of species']],
    [['consommer', 'to consume'], ['la consommation', 'consumption'], ['un consommateur', 'a consumer']],
    [['réduire', 'to reduce'], ['la réduction', 'reduction']],
    [['économiser', 'to save'], ['les économies', 'savings'], ['l\'économie', 'economy']],
    [['dégrader', 'to damage'], ['la dégradation', 'damage']],
    [['restaurer', 'to restore'], ['la restauration', 'restoration']],
    [['inciter', 'to encourage'], ['l\'incitation', 'incentive']],
    [['taxer', 'to tax'], ['la taxe', 'tax'], ['la taxe carbone', 'carbon tax']],
    [['s\'engager', 'to get involved'], ['l\'engagement', 'commitment']],
    [['lutter contre', 'to fight against'], ['la lutte', 'fight, struggle']],
    [['interdire', 'to ban'], ['l\'interdiction', 'ban'], ['interdit', 'forbidden']],
    [['sec', 'dry'], ['sécher', 'to dry'], ['la sécheresse', 'drought']],
    [['chaud', 'hot'], ['la chaleur', 'heat'], ['le réchauffement climatique', 'global warming']],
    [['inonder', 'to flood'], ['l\'inondation', 'flood']],
    [['jeter', 'to throw away'], ['jetable', 'disposable']],
    [['sauver', 'to save, to rescue'], ['le sauvetage', 'rescue']],
    [['durer', 'to last'], ['durable', 'lasting, sustainable'], ['le développement durable', 'sustainable development']],
    [['vert', 'green'], ['la verdure', 'greenery']],
    [['la glace', 'ice'], ['le glacier', 'glacier'], ['glacé', 'icy']],
    [['la neige', 'snow'], ['neiger', 'to snow']],
    [['le soleil', 'sun'], ['solaire', 'solar'], ['ensoleillé', 'sunny'], ['l\'énergie solaire', 'solar energy']],
    [['la terre', 'earth, soil'], ['terrestre', 'on land']],
    [['la mer', 'sea'], ['marin', 'sea (adj.)'], ['la montée des eaux', 'rising sea levels']],
    [['l\'air', 'air'], ['aérien', 'air (adj.)'], ['la pollution de l\'air', 'air pollution']],
    [['le pays', 'country'], ['le paysage', 'landscape'], ['le paysan', 'farmer']],
    [['l\'espèce', 'species'], ['les espèces en danger', 'endangered species']],
    [['le bois', 'wood'], ['le reboisement', 'reforestation'], ['déboiser', 'to cut down a forest']],
    [['le compost', 'compost'], ['le compostage', 'composting']],
    [['le carbone', 'carbon'], ['l\'empreinte carbone', 'carbon footprint'], ['la neutralité carbone', 'carbon neutrality']],
    [['l\'effet de serre', 'greenhouse effect'], ['les gaz à effet de serre', 'greenhouse gases']],
    [['le terme', 'term'], ['à court terme', 'in the short term'], ['à long terme', 'in the long term']],
];

const ARTICLE = /^(le |la |les |l['’]|un |une )/i;
const keyOf = (fr) => String(fr).toLowerCase().replace(/[’]/g, "'").replace(ARTICLE, '').replace(/\s+/g, ' ').trim();
const FAMILY_OF = {};
FAMILIES.forEach(g => g.forEach(([fr]) => { (FAMILY_OF[keyOf(fr)] = FAMILY_OF[keyOf(fr)] || []).push(g); }));

window.Chapters = {
    for(themeId) { return CHAPTERS[themeId] || null; },
    parts(key) { return PARTS[key] || []; },
    family(key) {
        const seen = new Set([key]);
        return (FAMILY_OF[key] || []).flat().filter(([fr]) => { const k = keyOf(fr); if (seen.has(k)) return false; seen.add(k); return true; });
    },
    keyOf,
};
})();
