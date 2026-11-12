// progress.js - « Your progress » (this device): words known, words to review, grammar lessons, exam questions,
// the streak, and topics / lessons done per level. Shown on exam.html (moved there from the Home page, Nov 2026).
// Needs config.js (LocalStore, Activity), js/lessons-index.js (LESSON_INDEX) and js/tcf.js (optional).
// window.Progress.render(el, level)
(function () {
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_NAMES = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper intermediate', C1: 'Advanced', C2: 'Mastery' };
const esc = (s) => { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; };

function render(el, level) {
    const IX = window.LESSON_INDEX;
    if (!el || !IX) return;
    const done = LocalStore.get('lessons_done', {});
    const lessonKey = (id) => typeof id === 'string' ? 'c:' + id.slice(1) : 'g:' + id;
    const course = Object.fromEntries(IX.course);
    const lessonsTotal = IX.course.reduce((a, [, items]) => a + items.length, 0);
    const lessonsDone = IX.course.reduce((a, [, items]) => a + items.filter(([id]) => done[lessonKey(id)]).length, 0);
    const stats = LocalStore.get('vocab_topic_stats', {});
    const finished = (n) => { const s = stats['theme:' + n]; return s && s.total && s.known >= s.total; };
    const vocab = LocalStore.get('vocab_progress', {});
    const known = Object.values(vocab).filter(p => p && p.box >= 4).length;
    const due = Object.values(LocalStore.get('vocab_words', {})).filter(w => vocab[w.key] && vocab[w.key].box && vocab[w.key].due <= Date.now()).length;
    const examN = window.TCF ? TCF.practised().size : 0;
    const streak = Activity.streak(), todayN = Activity.today();
    const stat = (href, emoji, value, label, tone) => `<a href="${href}" class="group flex items-center gap-2 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 min-w-0">
        <span class="text-xl" aria-hidden="true">${emoji}</span>
        <span class="min-w-0"><b class="block text-lg leading-tight ${tone}">${value}</b><span class="block text-xs font-semibold text-slate-500 leading-snug">${esc(label)}</span></span></a>`;
    const bar = (n, total, color) => `<span class="block h-1.5 bg-slate-100 rounded-full overflow-hidden"><span class="block h-full ${color} rounded-full" style="width:${total ? Math.round(n / total * 100) : 0}%"></span></span>`;
    el.innerHTML = `
        <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="prog-h" class="font-black text-slate-900">Your progress</h2>
            <span class="text-sm text-slate-500">${[streak ? `🔥 ${streak}-day streak` : '', todayN ? `${todayN} done today` : ''].filter(Boolean).join(' · ')}</span>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
            ${stat('vocab.html', '🗂️', known.toLocaleString('en'), known === 1 ? 'word known' : 'words known', 'text-emerald-600')}
            ${stat(due ? 'vocab.html?topic=review&step=practise' : 'vocab.html', '🔁', due, due ? (due === 1 ? 'word to review now' : 'words to review now') : 'nothing to review', due ? 'text-amber-600' : 'text-slate-400')}
            ${stat('lesson.html', '📚', `${lessonsDone}<span class="text-sm text-slate-400">/${lessonsTotal}</span>`, 'grammar lessons', 'text-sky-600')}
            ${stat('exam.html', '🎓', `${examN}<span class="text-sm text-slate-400">/1,440</span>`, 'exam questions', 'text-indigo-600')}
        </div>
        <div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                <span>By level</span>
                <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>Vocab topics done</span>
                <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>Grammar lessons done</span>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">${LEVELS.map(lv => {
                const topics = Object.keys(IX.themeLevels).filter(n => IX.themeLevels[n] === lv);
                const tDone = topics.filter(finished).length;
                const lessons = course[lv] || [], lDone = lessons.filter(([id]) => done[lessonKey(id)]).length;
                const mine = lv === level;
                return `<div class="rounded-xl p-2.5 border ${mine ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'} space-y-1.5" title="${lv} · ${LEVEL_NAMES[lv]}">
                    <div class="flex items-baseline justify-between gap-1"><b class="text-sm text-slate-900">${lv}</b>${mine ? '<span class="text-xs font-bold uppercase text-indigo-700">You</span>' : ''}</div>
                    <a href="vocab.html" class="block py-1 text-xs text-slate-500 hover:text-indigo-700">${bar(tDone, topics.length, 'bg-emerald-500')}<span class="block mt-0.5">${tDone}/${topics.length} topics</span></a>
                    <a href="lesson.html" class="block py-1 text-xs text-slate-500 hover:text-indigo-700">${bar(lDone, lessons.length, 'bg-sky-500')}<span class="block mt-0.5">${lDone}/${lessons.length} lessons</span></a>
                </div>`;
            }).join('')}</div>
        </div>`;
}
window.Progress = { render };
})();
