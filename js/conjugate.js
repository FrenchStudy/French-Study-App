// js/conjugate.js - rule-based French conjugation engine (no AI, no network).
// Ported from the French cheat sheet. 296 verbs, 12 tenses.
// Public API: window.Conjugator
//   .tenses            [{ key, name, en, group }]
//   .verbs             list of verb objects ({ disp, inf, kind, gloss, aux, refl, ... })
//   .find(text)        verb object for an infinitive (known verb, or a regular verb assumed by its ending)
//   .forms(verb, key)  [{ cp: pronoun, cf: form, say: text to speak }]
//   .highlight(verb, key, i, form)  HTML with the regular ending marked
//   .notes(verb)       short usage notes
(function () {
'use strict';

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function normWord(s) {
  return String(s).toLowerCase().replace(/\u0153/g, "oe").replace(/\u00e6/g, "ae")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019']/g, "").replace(/[-\u2013]/g, " ").replace(/[^a-z0-9\s]/g, " ")
    .replace(/(\d)\s+(?=\d{3}\b)/g, "$1").replace(/\s+/g, " ").trim();
}

const CJ_VOW = /^[aeiouyâàäéèêëîïôöùûüœh]/i;
function cjEl(pro, w) { return (/e$/.test(pro) && CJ_VOW.test(w)) ? pro.slice(0, -1) + "'" + w : pro + " " + w; }
function cjAd(stem, end, soft) {
  if (soft && /^[aoâô]/.test(end)) {
    if (soft === "g") return stem + "e" + end;
    if (soft === "c") return stem.replace(/c$/, "\u00e7") + end;
  }
  return stem + end;
}
function cjRepLast(s, a, b) { const k = s.lastIndexOf(a); return k < 0 ? s : s.slice(0, k) + b + s.slice(k + a.length); }
const CJ_PR = ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
const CJ_SAY = ["je", "tu", "il", "nous", "vous", "ils"];
const CJ_RP = ["me", "te", "se", "nous", "vous", "se"];

/* Regular models */
function cjEr(inf, kind) {
  const stem = inf.slice(0, -2), soft = /ger$/.test(inf) ? "g" : /cer$/.test(inf) ? "c" : "";
  let s2 = stem, fut = inf;
  if (kind === "e_è") { s2 = cjRepLast(stem, "e", "è"); fut = s2 + "er"; }
  else if (kind === "é_è") { s2 = cjRepLast(stem, "é", "è"); fut = stem + "er"; }
  else if (kind === "ll" || kind === "tt") { s2 = stem + stem.slice(-1); fut = s2 + "er"; }
  else if (kind === "yer") { s2 = stem.slice(0, -1) + "i"; fut = s2 + "er"; }
  const E = ["e", "es", "e", "ons", "ez", "ent"];
  const pres = E.map((e, i) => cjAd(i === 3 || i === 4 ? stem : s2, e, soft));
  return { pres: pres, impf: stem, fut: fut, pp: stem + "é", soft: soft, aux: "avoir" };
}
function cjIr(inf) {
  const st = inf.slice(0, -2);
  return { pres: ["is", "is", "it", "issons", "issez", "issent"].map(e => st + e), pp: inf.slice(0, -1), fut: inf, aux: "avoir" };
}
function cjRe(inf) {
  const st = inf.slice(0, -2);
  return { pres: ["s", "s", "", "ons", "ez", "ent"].map(e => st + e), pp: st + "u", fut: inf.slice(0, -1), aux: "avoir" };
}
function cjIr3(inf) {
  const pl = inf.slice(0, -2), sg = pl.slice(0, -1);
  return { pres: [sg + "s", sg + "s", sg + "t", pl + "ons", pl + "ez", pl + "ent"], pp: inf.slice(0, -1), fut: inf, aux: "avoir" };
}
function cjOuv(inf) {
  const st = inf.slice(0, -2);
  return { pres: ["e", "es", "e", "ons", "ez", "ent"].map(e => st + e), pp: inf.slice(0, -3) + "ert", fut: inf, aux: "avoir" };
}

/* Families of irregular verbs: x is the prefix before the model's ending */
const CJ_FAM = {
  prendre: { suf: "prendre", f: x => ({ pres: [x+"prends", x+"prends", x+"prend", x+"prenons", x+"prenez", x+"prennent"], pp: x+"pris", fut: x+"prendr" }) },
  mettre:  { suf: "mettre",  f: x => ({ pres: [x+"mets", x+"mets", x+"met", x+"mettons", x+"mettez", x+"mettent"], pp: x+"mis", fut: x+"mettr" }) },
  venir:   { suf: "venir",   f: x => ({ pres: [x+"viens", x+"viens", x+"vient", x+"venons", x+"venez", x+"viennent"], pp: x+"venu", fut: x+"viendr" }) },
  tenir:   { suf: "tenir",   f: x => ({ pres: [x+"tiens", x+"tiens", x+"tient", x+"tenons", x+"tenez", x+"tiennent"], pp: x+"tenu", fut: x+"tiendr" }) },
  crire:   { suf: "crire",   f: x => ({ pres: [x+"cris", x+"cris", x+"crit", x+"crivons", x+"crivez", x+"crivent"], pp: x+"crit", fut: x+"crir" }) },
  duire:   { suf: "duire",   f: x => ({ pres: [x+"duis", x+"duis", x+"duit", x+"duisons", x+"duisez", x+"duisent"], pp: x+"duit", fut: x+"duir" }) },
  truire:  { suf: "truire",  f: x => ({ pres: [x+"truis", x+"truis", x+"truit", x+"truisons", x+"truisez", x+"truisent"], pp: x+"truit", fut: x+"truir" }) },
  lire:    { suf: "lire",    f: x => ({ pres: [x+"lis", x+"lis", x+"lit", x+"lisons", x+"lisez", x+"lisent"], pp: x+"lu", fut: x+"lir" }) },
  rire:    { suf: "rire",    f: x => ({ pres: [x+"ris", x+"ris", x+"rit", x+"rions", x+"riez", x+"rient"], pp: x+"ri", fut: x+"rir" }) },
  dire:    { suf: "dire",    f: x => ({ pres: [x+"dis", x+"dis", x+"dit", x+"disons", x+"dites", x+"disent"], pp: x+"dit", fut: x+"dir" }) },
  voir:    { suf: "voir",    f: x => ({ pres: [x+"vois", x+"vois", x+"voit", x+"voyons", x+"voyez", x+"voient"], pp: x+"vu", fut: x+"verr" }) },
  croire:  { suf: "croire",  f: x => ({ pres: [x+"crois", x+"crois", x+"croit", x+"croyons", x+"croyez", x+"croient"], pp: x+"cru", fut: x+"croir" }) },
  cevoir:  { suf: "cevoir",  f: x => ({ pres: [x+"çois", x+"çois", x+"çoit", x+"cevons", x+"cevez", x+"çoivent"], pp: x+"çu", fut: x+"cevr" }) },
  vivre:   { suf: "vivre",   f: x => ({ pres: [x+"vis", x+"vis", x+"vit", x+"vivons", x+"vivez", x+"vivent"], pp: x+"vécu", fut: x+"vivr" }) },
  suivre:  { suf: "suivre",  f: x => ({ pres: [x+"suis", x+"suis", x+"suit", x+"suivons", x+"suivez", x+"suivent"], pp: x+"suivi", fut: x+"suivr" }) },
  courir:  { suf: "courir",  f: x => ({ pres: [x+"cours", x+"cours", x+"court", x+"courons", x+"courez", x+"courent"], pp: x+"couru", fut: x+"courr" }) },
  aitre:   { suf: "aître",   f: x => ({ pres: [x+"ais", x+"ais", x+"aît", x+"aissons", x+"aissez", x+"aissent"], pp: x+"u", fut: x+"aîtr" }) },
  indre:   { suf: "indre",   f: (x, base) => { const b = base.slice(0, -3), g = b.slice(0, -1) + "gn";
                 return { pres: [b+"s", b+"s", b+"t", g+"ons", g+"ez", g+"ent"], pp: b+"t", fut: base.slice(0, -1) }; } }
};

/* Fully irregular verbs */
function cjSingle(b) {
  const S = {
    "être":    { pres: ["suis","es","est","sommes","êtes","sont"], pp: "été", impf: "ét", fut: "ser", sj: ["sois","sois","soit","soyons","soyez","soient"], ppres: "étant", imp: ["sois","soyons","soyez"], nosplit: true },
    "avoir":   { pres: ["ai","as","a","avons","avez","ont"], pp: "eu", impf: "av", fut: "aur", sj: ["aie","aies","ait","ayons","ayez","aient"], ppres: "ayant", imp: ["aie","ayons","ayez"], nosplit: true },
    "aller":   { pres: ["vais","vas","va","allons","allez","vont"], pp: "allé", impf: "all", fut: "ir", sj: ["aille","ailles","aille","allions","alliez","aillent"], imp: ["va","allons","allez"], nosplit: true },
    "faire":   { pres: ["fais","fais","fait","faisons","faites","font"], pp: "fait", impf: "fais", fut: "fer", sj: ["fasse","fasses","fasse","fassions","fassiez","fassent"], nosplit: true },
    "pouvoir": { pres: ["peux","peux","peut","pouvons","pouvez","peuvent"], pp: "pu", fut: "pourr", sj: ["puisse","puisses","puisse","puissions","puissiez","puissent"], imp: null, nosplit: true },
    "vouloir": { pres: ["veux","veux","veut","voulons","voulez","veulent"], pp: "voulu", fut: "voudr", sj: ["veuille","veuilles","veuille","voulions","vouliez","veuillent"], imp: ["veuille","veuillons","veuillez"], nosplit: true },
    "devoir":  { pres: ["dois","dois","doit","devons","devez","doivent"], pp: "dû", fut: "devr" },
    "savoir":  { pres: ["sais","sais","sait","savons","savez","savent"], pp: "su", fut: "saur", sj: ["sache","saches","sache","sachions","sachiez","sachent"], ppres: "sachant", imp: ["sache","sachons","sachez"] },
    "boire":   { pres: ["bois","bois","boit","buvons","buvez","boivent"], pp: "bu", fut: "boir" },
    "mourir":  { pres: ["meurs","meurs","meurt","mourons","mourez","meurent"], pp: "mort", fut: "mourr", aux: "être" }
  };
  if (!S[b]) throw new Error("no single " + b);
  return S[b];
}
function cjMake(base, kind) {
  if (["er", "e_è", "é_è", "ll", "tt", "yer"].indexOf(kind) >= 0) return cjEr(base, kind === "er" ? "" : kind);
  if (kind === "ir") return cjIr(base);
  if (kind === "re") return cjRe(base);
  if (kind === "ir3") return cjIr3(base);
  if (kind === "ouv") return cjOuv(base);
  if (kind === "envoyer") { const s = cjEr(base, "yer"); s.fut = base.slice(0, base.length - 7) + "enverr"; return s; }
  if (kind === "single") return Object.assign({ aux: "avoir" }, cjSingle(base));
  const f = CJ_FAM[kind];
  if (!f || !base.endsWith(f.suf)) throw new Error("bad family " + kind + " for " + base);
  return Object.assign({ aux: "avoir" }, f.f(base.slice(0, base.length - f.suf.length), base));
}
function cjFinish(s) {
  if (s.impf == null) s.impf = s.pres[3].replace(/ons$/, "");
  if (!s.ppres) s.ppres = cjAd(s.impf, "ant", s.soft);
  if (!s.sj) {
    const b = s.pres[5].replace(/ent$/, "");
    s.sj = [b + "e", b + "es", b + "e", cjAd(s.impf, "ions", s.soft), cjAd(s.impf, "iez", s.soft), b + "ent"];
  }
  if (s.imp === undefined) {
    let tu = s.pres[1];
    if (/es$/.test(tu)) tu = tu.slice(0, -1);
    s.imp = [tu, s.pres[3], s.pres[4]];
  }
  return s;
}

/* Tenses */
const CJ_TENSES = [
  ["pres", "Présent", "I go", "exam"],
  ["pc", "Passé composé", "I went, I have gone", "exam"],
  ["impf", "Imparfait", "I was going, I used to go", "exam"],
  ["pqp", "Plus-que-parfait", "I had gone", "exam"],
  ["fut", "Futur simple", "I will go", "exam"],
  ["fa", "Futur antérieur", "I will have gone", "exam"],
  ["fp", "Futur proche", "I am going to go", "extra"],
  ["cond", "Conditionnel présent", "I would go", "exam"],
  ["cp", "Conditionnel passé", "I would have gone", "extra"],
  ["subj", "Subjonctif présent", "that I go", "exam"],
  ["sp", "Subjonctif passé", "that I have gone", "exam"],
  ["imp", "Impératif", "go!", "extra"]
];
function cjAux(s) { return (s.aux === "être" || s.refl) ? CJ["être"] : CJ["avoir"]; }
function cjSimple(s, t) {
  if (t === "pres") return s.pres;
  if (t === "impf") return ["ais","ais","ait","ions","iez","aient"].map(e => cjAd(s.impf, e, s.soft));
  if (t === "fut") return ["ai","as","a","ons","ez","ont"].map(e => s.fut + e);
  if (t === "cond") return ["ais","ais","ait","ions","iez","aient"].map(e => s.fut + e);
  if (t === "subj") return s.sj;
  return null;
}
function cjPP(s, i) {
  if (s.aux === "être" || s.refl) return [s.pp + "(e)", s.pp + "(e)", s.pp + "(e)", s.pp + "(e)s", s.pp + "(e)(s)", s.pp + "(e)s"][i];
  return s.pp;
}
function cjRaw(s, t) {
  if (t === "pc" || t === "pqp" || t === "fa" || t === "cp" || t === "sp") {
    const base = cjSimple(cjAux(s), { pc: "pres", pqp: "impf", fa: "fut", cp: "cond", sp: "subj" }[t]);
    return base.map((f, i) => f + " " + cjPP(s, i));
  }
  if (t === "fp") return CJ["aller"].pres.map((f, i) => f + " " + (s.refl ? cjEl(CJ_RP[i], s.inf) : s.inf));
  return cjSimple(s, t);
}
function cjForms(s, t) {
  if (t === "imp") {
    if (!s.imp) return [];
    const L = ["tu", "nous", "vous"], P = ["-toi", "-nous", "-vous"];
    return s.imp.map((f, i) => { const cf = s.refl ? f + P[i] : f; return { cp: L[i], cf: cf, say: cf, i: i }; });
  }
  const subj = t === "subj" || t === "sp";
  const cps = subj ? ["que je", "que tu", "qu'il / elle / on", "que nous", "que vous", "qu'ils / elles"] : CJ_PR;
  const sps = subj ? ["que je", "que tu", "qu'il", "que nous", "que vous", "qu'ils"] : CJ_SAY;
  return cjRaw(s, t).map((r, i) => {
    const cf = (s.refl && t !== "fp") ? cjEl(CJ_RP[i], r) : r;
    let cp = cps[i], sp = sps[i];
    if (i === 0 && CJ_VOW.test(cf)) { cp = subj ? "que j'" : "j'"; sp = cp; }
    const say = (sp + (/'$/.test(sp) ? "" : " ") + cf).replace(/\(e\)|\(s\)/g, "");
    return { cp: cp, cf: cf, say: say, i: i };
  });
}
const CJ_ENDS = {
  pres: s => ({ er: ["e","es","e","ons","ez","ent"], ir: ["is","is","it","issons","issez","issent"], re: ["s","s","","ons","ez","ent"] }[
    ["er","e_è","é_è","ll","tt","yer","ouv","envoyer"].indexOf(s.kind) >= 0 ? "er" : s.kind === "ir" ? "ir" : s.kind === "re" ? "re" : "x"] || ["s","s","t","ons","ez","ent"]),
  impf: () => ["ais","ais","ait","ions","iez","aient"],
  cond: () => ["ais","ais","ait","ions","iez","aient"],
  fut: () => ["ai","as","a","ons","ez","ont"],
  subj: () => ["e","es","e","ions","iez","ent"]
};
function cjHl(s, t, i, form) {
  if (s.nosplit || s.refl || !CJ_ENDS[t]) return esc(form);
  const end = CJ_ENDS[t](s)[i];
  if (!end || !form.endsWith(end)) return esc(form);
  return esc(form.slice(0, form.length - end.length)) + '<span class="en-end">' + esc(end) + "</span>";
}

/* Verb list */
const CJ = {}, CJ_LIST = [];
function V(inf, kind, gloss, o) {
  o = o || {};
  const refl = /^(se |s')/.test(inf), base = inf.replace(/^(se |s')/, "");
  const s = cjMake(base, kind);
  if (o.pp) s.pp = o.pp;
  s.inf = base; s.disp = inf; s.refl = refl; s.kind = kind; s.gloss = gloss;
  s.aux = refl ? "être" : (o.aux || s.aux || "avoir");
  s.dual = !!o.dual;
  cjFinish(s);
  CJ[inf] = s; CJ_LIST.push(s);
}
function VL(kind, arr, o) { arr.forEach(a => V(a[0], kind, a[1], o)); }

VL("single", [["être","to be"],["avoir","to have"],["faire","to do, to make"],["pouvoir","to be able to, can"],["vouloir","to want"],["devoir","to have to, must"],["savoir","to know (a fact, a skill)"],["boire","to drink"]]);
V("mourir", "single", "to die", { aux: "être" });
V("aller", "single", "to go", { aux: "être" });

VL("er", [
  ["parler","to speak"],["aimer","to like, to love"],["chanter","to sing"],["danser","to dance"],["regarder","to watch, to look at"],["écouter","to listen to"],
  ["travailler","to work"],["habiter","to live (in a place)"],["jouer","to play"],["donner","to give"],["trouver","to find"],["penser","to think"],
  ["demander","to ask"],["montrer","to show"],["porter","to carry, to wear"],["marcher","to walk, to work (machines)"],["cuisiner","to cook"],["dessiner","to draw"],
  ["étudier","to study"],["visiter","to visit"],["téléphoner","to phone"],["utiliser","to use"],["rencontrer","to meet"],["présenter","to introduce"],
  ["inviter","to invite"],["oublier","to forget"],["expliquer","to explain"],["chercher","to look for"],["préparer","to prepare"],["fermer","to close"],
  ["refuser","to refuse"],["accepter","to accept"],["aider","to help"],["apporter","to bring"],["arrêter","to stop"],["attraper","to catch"],
  ["brosser","to brush"],["cacher","to hide"],["casser","to break"],["compter","to count"],["continuer","to continue"],["couper","to cut"],
  ["coûter","to cost"],["crier","to shout"],["décider","to decide"],["déjeuner","to have lunch"],["dîner","to have dinner"],["détester","to hate"],
  ["embrasser","to kiss"],["enseigner","to teach"],["éviter","to avoid"],["fumer","to smoke"],["gagner","to win, to earn"],["garder","to keep"],
  ["goûter","to taste"],["imaginer","to imagine"],["inventer","to invent"],["laisser","to leave, to let"],["louer","to rent"],["manquer","to miss"],
  ["noter","to note"],["organiser","to organise"],["pleurer","to cry"],["pousser","to push"],["prêter","to lend"],["proposer","to suggest"],
  ["quitter","to leave"],["raconter","to tell (a story)"],["réserver","to book"],["rêver","to dream"],["sauver","to save"],["sembler","to seem"],
  ["signer","to sign"],["sonner","to ring"],["souhaiter","to wish"],["tirer","to pull"],["toucher","to touch"],["tourner","to turn"],["emprunter","to borrow"],
  ["arriver","to arrive"],["entrer","to enter"],["tomber","to fall"],["rester","to stay"],["rentrer","to go home, to return"],["retourner","to go back"],["monter","to go up"],["passer","to pass, to spend (time)"],
  ["manger","to eat"],["voyager","to travel"],["nager","to swim"],["ranger","to tidy"],["changer","to change"],["partager","to share"],["corriger","to correct"],["déménager","to move house"],["bouger","to move"],["échanger","to exchange"],
  ["commencer","to begin"],["placer","to place"],["lancer","to throw"],["avancer","to move forward"],["prononcer","to pronounce"],["annoncer","to announce"],["remplacer","to replace"],["renoncer","to give up"]
]);
VL("e_è", [["acheter","to buy"],["lever","to lift"],["mener","to lead"],["amener","to bring (someone)"],["emmener","to take (someone)"],["promener","to walk (a dog)"],["peser","to weigh"],["geler","to freeze"],["enlever","to remove"]]);
VL("é_è", [["espérer","to hope"],["préférer","to prefer"],["répéter","to repeat"],["célébrer","to celebrate"],["posséder","to own"],["considérer","to consider"],["exagérer","to exaggerate"],["compléter","to complete"]]);
VL("ll", [["appeler","to call"],["rappeler","to call back, to remind"],["épeler","to spell"]]);
VL("tt", [["jeter","to throw away"],["rejeter","to reject"],["projeter","to plan"]]);
VL("yer", [["payer","to pay"],["essayer","to try"],["nettoyer","to clean"],["employer","to employ, to use"],["appuyer","to press, to lean"],["ennuyer","to bore"],["essuyer","to wipe"]]);
VL("envoyer", [["envoyer","to send"],["renvoyer","to send back"]]);
VL("ir", [["finir","to finish"],["choisir","to choose"],["réussir","to succeed"],["grandir","to grow"],["grossir","to put on weight"],["maigrir","to lose weight"],["réfléchir","to think, to reflect"],["remplir","to fill"],["obéir","to obey"],["punir","to punish"],["agir","to act"],["établir","to establish"],["rougir","to blush"],["applaudir","to applaud"],["atterrir","to land"],["bâtir","to build"],["définir","to define"],["guérir","to heal"],["nourrir","to feed"],["ralentir","to slow down"],["réunir","to gather"]]);
VL("re", [["vendre","to sell"],["attendre","to wait for"],["entendre","to hear"],["répondre","to answer"],["descendre","to go down"],["perdre","to lose"],["rendre","to give back"],["défendre","to defend"],["dépendre","to depend"],["étendre","to stretch"],["prétendre","to claim"],["tendre","to hold out"],["fondre","to melt"],["mordre","to bite"],["confondre","to confuse"],["correspondre","to correspond"],["répandre","to spread"]]);
VL("ir3", [["partir","to leave"],["sortir","to go out"],["dormir","to sleep"],["servir","to serve"],["sentir","to feel, to smell"],["mentir","to lie"],["repartir","to leave again"]]);
VL("ouv", [["ouvrir","to open"],["offrir","to offer"],["souffrir","to suffer"],["couvrir","to cover"],["découvrir","to discover"]]);
VL("prendre", [["prendre","to take"],["apprendre","to learn"],["comprendre","to understand"],["surprendre","to surprise"],["reprendre","to take again"],["entreprendre","to undertake"]]);
VL("mettre", [["mettre","to put, to put on"],["permettre","to allow"],["promettre","to promise"],["remettre","to put back, to hand in"],["admettre","to admit"],["soumettre","to submit"],["transmettre","to pass on"],["commettre","to commit"]]);
VL("venir", [["venir","to come"],["devenir","to become"],["revenir","to come back"],["parvenir","to reach, to manage"],["prévenir","to warn"],["convenir","to suit, to agree"]]);
VL("tenir", [["tenir","to hold"],["obtenir","to obtain"],["retenir","to retain"],["maintenir","to maintain"],["appartenir","to belong"],["soutenir","to support"],["contenir","to contain"]]);
VL("crire", [["écrire","to write"],["décrire","to describe"],["inscrire","to enrol, to write down"]]);
VL("duire", [["conduire","to drive, to lead"],["produire","to produce"],["traduire","to translate"],["réduire","to reduce"],["introduire","to introduce, to insert"],["séduire","to charm"]]);
VL("truire", [["construire","to build"],["détruire","to destroy"]]);
VL("lire", [["lire","to read"],["relire","to reread"],["élire","to elect"]]);
VL("rire", [["rire","to laugh"],["sourire","to smile"]]);
VL("dire", [["dire","to say, to tell"],["redire","to say again"]]);
VL("voir", [["voir","to see"],["revoir","to see again"]]);
VL("croire", [["croire","to believe"]]);
VL("cevoir", [["recevoir","to receive"],["apercevoir","to notice"],["décevoir","to disappoint"],["concevoir","to design, to conceive"]]);
VL("vivre", [["vivre","to live"]]);
VL("suivre", [["suivre","to follow"],["poursuivre","to pursue"]]);
VL("courir", [["courir","to run"],["parcourir","to travel across"],["secourir","to rescue"]]);
VL("aitre", [["connaître","to know (a person, a place)"],["reconnaître","to recognise"],["paraître","to appear, to seem"],["apparaître","to appear"],["disparaître","to disappear"]]);
V("naître", "aitre", "to be born", { aux: "être", pp: "né" });
VL("indre", [["craindre","to fear"],["peindre","to paint"],["joindre","to join"],["rejoindre","to rejoin"],["éteindre","to switch off"],["atteindre","to reach"],["plaindre","to pity"]]);

/* Reflexive verbs */
VL("er", [["se coucher","to go to bed"],["se réveiller","to wake up"],["se laver","to wash (oneself)"],["s'habiller","to get dressed"],["se dépêcher","to hurry"],["se brosser","to brush (one's hair, teeth)"],["se reposer","to rest"],["s'amuser","to have fun"],["s'arrêter","to stop"],["s'excuser","to apologise"],["se marier","to get married"],["se rencontrer","to meet each other"],["se téléphoner","to phone each other"],["s'occuper","to take care of"],["s'intéresser","to be interested"],["se baigner","to bathe, to swim"],["se tromper","to make a mistake"],["se trouver","to be located"]]);
V("se lever", "e_è", "to get up"); V("se promener", "e_è", "to go for a walk");
V("s'appeler", "ll", "to be called"); V("s'inquiéter", "é_è", "to worry"); V("s'ennuyer", "yer", "to be bored");
V("s'endormir", "ir3", "to fall asleep"); V("se sentir", "ir3", "to feel");
V("se souvenir", "venir", "to remember"); V("se plaindre", "indre", "to complain"); V("s'inscrire", "crire", "to enrol");

/* Auxiliary être and dual-auxiliary verbs */
["arriver","entrer","tomber","rester","venir","devenir","revenir","parvenir","partir","repartir","naître","mourir","aller"].forEach(k => { if (CJ[k]) CJ[k].aux = "être"; });
["rentrer","retourner","monter","passer","sortir","descendre"].forEach(k => { if (CJ[k]) { CJ[k].aux = "être"; CJ[k].dual = true; } });

/* Lookup */
const CJ_MODEL = { er:"parler", "e_è":"acheter", "é_è":"espérer", ll:"appeler", tt:"jeter", yer:"payer", envoyer:"envoyer", ir:"finir", re:"vendre", ir3:"partir", ouv:"ouvrir", prendre:"prendre", mettre:"mettre", venir:"venir", tenir:"tenir", crire:"écrire", duire:"conduire", truire:"construire", lire:"lire", rire:"rire", dire:"dire", voir:"voir", croire:"croire", cevoir:"recevoir", vivre:"vivre", suivre:"suivre", courir:"courir", aitre:"connaître", indre:"craindre" };
const CJ_IDX = {};
function cjKey(s) { return normWord(s).replace(/\s+/g, " "); }
CJ_LIST.forEach(s => { CJ_IDX[cjKey(s.disp)] = s; });
CJ_LIST.forEach(s => { if (s.refl) { const k = cjKey(s.inf); if (!CJ_IDX[k]) CJ_IDX[k] = s; } });
function cjP(k, t, i) { return cjForms(CJ[k], t)[i].say; }
function cjF(k, t, i) { return cjForms(CJ[k], t)[i].cf; }

const CJ_KNOTE = {
  "e_è": "Spelling change: the e before the last consonant becomes è when the ending is silent (je lève, ils lèvent), but not in nous and vous (nous levons).",
  "é_è": "Spelling change: é becomes è when the ending is silent (j'espère), but not in nous and vous (nous espérons). The future keeps é (j'espérerai).",
  "ll": "Spelling change: the consonant doubles when the ending is silent (j'appelle, ils appellent), but not in nous and vous.",
  "tt": "Spelling change: the consonant doubles when the ending is silent (je jette, ils jettent), but not in nous and vous.",
  "yer": "Spelling change: y becomes i when the ending is silent (je paie, ils paient), but not in nous and vous (nous payons).",
  "envoyer": "Like payer, but with an irregular future: j'enverrai.",
  "single": "Irregular verb. Learn its forms by heart.",
  "er": "Regular -er verb.",
  "ir": "Regular -ir verb: adds -iss- in the plural, like finir.",
  "re": "Regular -re verb, like vendre."
};
function cjNotes(s) {
  const out = [];
  if (s.assumed) out.push("This verb is not in the app's list, so its forms assume it is regular like " + (s.kind === "er" ? "parler" : s.kind === "ir" ? "finir" : "vendre") + ". Check a reference such as Bescherelle or Le Conjugueur, especially for -ir and -re verbs, which are often irregular.");
  else if (CJ_KNOTE[s.kind]) out.push(CJ_KNOTE[s.kind]);
  else if (CJ_MODEL[s.kind] === s.disp) {
    const fam = CJ_LIST.filter(v => v.kind === s.kind && v !== s && !v.refl).map(v => v.disp);
    out.push("Irregular verb, and the model for its family" + (fam.length ? ": " + fam.slice(0, 12).join(", ") + (fam.length > 12 ? ", ..." : "") + "." : "."));
  }
  else out.push("Irregular verb. Conjugates like " + CJ_MODEL[s.kind] + ".");
  if (s.soft === "g") out.push("-ger verbs keep an e before a and o: nous mangeons, je mangeais.");
  if (s.soft === "c") out.push("-cer verbs take ç before a and o: nous commençons, je commençais.");
  if (s.dual) out.push("Takes être without an object and avoir with a direct object: il est sorti, but il a sorti le chien.");
  if (s.refl) out.push("Reflexive verb: the pronoun matches the subject, and compound tenses use être.");
  return out;
}

function cjAssume(raw) {
  const full = raw.trim().toLowerCase();
  const w = full.replace(/^(se |s')/, "");
  const kind = /er$/.test(w) ? "er" : /ir$/.test(w) ? "ir" : /re$/.test(w) ? "re" : null;
  if (!kind || w.length < 4 || !/^[a-z\u00e0\u00e2\u00e4\u00e7\u00e9\u00e8\u00ea\u00eb\u00ee\u00ef\u00f4\u00f6\u00f9\u00fb\u00fc\u0153]+$/.test(w)) return null;
  try {
    const s = cjMake(w, kind);
    s.inf = w; s.disp = full; s.refl = /^(se |s')/.test(full); s.kind = kind; s.gloss = ""; s.aux = s.refl ? "être" : "avoir"; s.dual = false; s.assumed = true;
    return cjFinish(s);
  } catch (e) { return null; }
}


window.Conjugator = {
    tenses: CJ_TENSES.map(([key, name, en, group]) => ({ key, name, en, group })),
    verbs: CJ_LIST,
    models: CJ_MODEL,
    find(text) {
        if (!text) return null;
        return CJ_IDX[cjKey(text)] || cjAssume(text);
    },
    forms: cjForms,
    highlight: cjHl,
    notes: cjNotes
};
})();
