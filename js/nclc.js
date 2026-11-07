// nclc.js - TCF Canada scores as NCLC levels (the scale IRCC uses), and the four-skill summary on exam.html.
// Official IRCC table for TCF Canada (canada.ca, "Language test equivalency charts"):
//   writing and speaking are marked /20, reading and listening /699.
// Reading and listening tests in the app are scored with the widely used (unofficial) TCF weighting:
//   questions 1-4 A1 3 pts, 5-10 A2 9 pts, 11-19 B1 15 pts, 20-29 B2 21 pts, 30-35 C1 26 pts, 36-39 C2 33 pts (total 699).
//
//   NCLC.from20(score)              -> 0 (below 4) or 4…10 (10 = NCLC 10 and above)
//   NCLC.from699('reading'|'listening', score) -> the same
//   NCLC.points(qNumber)            -> points for question 1…39
//   NCLC.label(n)                   -> 'NCLC 8', 'NCLC 10+', 'below NCLC 4'
//   NCLC.badge20(score)             -> small HTML badge "≈ NCLC 8"
//   NCLC.saveTest(part, setId, { correct, total, score })  -> stores a reading/listening test result
//   NCLC.summary()                  -> { listening, reading, writing, speaking }: { nclc, n, detail, at } or null
(function () {
const T20 = [[16, 10], [14, 9], [12, 8], [10, 7], [7, 6], [6, 5], [4, 4]];
const T699 = {
    listening: [[549, 10], [523, 9], [503, 8], [458, 7], [398, 6], [369, 5], [331, 4]],
    reading: [[549, 10], [524, 9], [499, 8], [453, 7], [406, 6], [375, 5], [342, 4]]
};
const pick = (rows, s) => { for (const [min, n] of rows) if (s >= min) return n; return 0; };
const from20 = (s) => pick(T20, Number(s) || 0);
const from699 = (part, s) => pick(T699[part], Number(s) || 0);
const points = (q) => q <= 4 ? 3 : q <= 10 ? 9 : q <= 19 ? 15 : q <= 29 ? 21 : q <= 35 ? 26 : 33;
const label = (n) => n >= 10 ? 'NCLC 10+' : n >= 4 ? `NCLC ${n}` : 'below NCLC 4';
const tone = (n) => n >= 7 ? 'text-emerald-700 bg-emerald-50' : n >= 6 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';
const badge20 = (s) => { const n = from20(s); return `<span class="text-xs font-bold ${tone(n)} px-2 py-0.5 rounded-full" title="TCF Canada: NCLC 7 starts at 10/20">≈ ${label(n)}</span>`; };

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const TESTS = 'tcf_tests';   // [{ part, set, correct, total, score, nclc, at }]
function saveTest(part, set, r) {
    const list = read(TESTS, []);
    const row = { part, set, correct: r.correct, total: r.total, score: r.score, nclc: from699(part, r.score), at: Date.now() };
    list.push(row); write(TESTS, list.slice(-60));
    return row;
}
const tests = () => read(TESTS, []);

// The latest level per skill. Writing and speaking: the average of the last 3 exam-style answers (one answer swings a lot).
function summary() {
    const out = {};
    ['listening', 'reading'].forEach(part => {
        const last = tests().filter(t => t.part === part).sort((a, b) => b.at - a.at)[0];
        out[part] = last ? { nclc: last.nclc, n: 1, at: last.at, detail: `${last.score}/699 · ${last.correct}/${last.total} right` } : null;
    });
    const fromResults = (key, ok) => {
        const rows = Object.entries(read(key, {})).filter(([id, r]) => id.startsWith('tcf-') && r && Number.isFinite(r.score) && ok(r))
            .map(([, r]) => r).sort((a, b) => b.at - a.at).slice(0, 3);
        if (!rows.length) return null;
        const avg = rows.reduce((s, r) => s + r.score, 0) / rows.length;
        return { nclc: from20(Math.round(avg)), n: rows.length, at: rows[0].at, detail: `${Math.round(avg * 10) / 10}/20 · last ${rows.length} answer${rows.length > 1 ? 's' : ''}` };
    };
    out.writing = fromResults('writing_results', () => true);
    out.speaking = fromResults('speak_results', (r) => r.exam);   // only answers marked the exam way
    return out;
}

window.NCLC = { from20, from699, points, label, tone, badge20, saveTest, tests, summary };
})();
