// js/meteo-lesson.js - topic 8, Météo, date et jours: the Learn step's hands-on lesson (content/vocab/meteo-date-jours.html).
//   MeteoLesson.bind(box): pick a date on a mini calendar (the weekday and the season follow), a weather picture and a
//   temperature, and read the whole forecast aloud; then a short "Quel temps fait-il ?" quiz and the question guide.
// Needs speakText (js/lesson-kit.js); pictures come from media/pictures/fe-*.webp.
window.MeteoLesson = (function () {
    const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const PIC = (n) => `media/pictures/fe-${n}.webp`;

    // [key, French, English, picture, how it is built, usual temperature]
    const WEATHER = [
        ['beau', 'il fait beau', 'the weather is nice', 'sun-with-face', 'fait', 22],
        ['soleil', 'il y a du soleil', 'it is sunny', 'sun', 'ya', 25],
        ['nuages', 'il y a des nuages', 'it is cloudy', 'cloud', 'ya', 15],
        ['mauvais', 'il fait mauvais', 'the weather is bad', 'sun-behind-rain-cloud', 'fait', 10],
        ['pluie', 'il pleut', 'it is raining', 'cloud-with-rain', 'verb', 12],
        ['neige', 'il neige', 'it is snowing', 'cloud-with-snow', 'verb', -2],
        ['vent', 'il y a du vent', 'it is windy', 'wind-face', 'ya', 14],
        ['orage', "il y a de l'orage", 'there is a storm', 'cloud-with-lightning-and-rain', 'ya', 20],
        ['brouillard', 'il y a du brouillard', 'it is foggy', 'fog', 'ya', 6],
        ['chaud', 'il fait chaud', 'it is hot', 'hot-face', 'fait', 32],
        ['froid', 'il fait froid', 'it is cold', 'cold-face', 'fait', 2]
    ].map(r => ({ key: r[0], fr: r[1], en: r[2], img: PIC(r[3]), kind: r[4], temp: r[5] }));
    const KIND = {
        fait: { label: 'il fait + adjective', color: '#e11d48', soft: '#fff1f2' },
        ya: { label: 'il y a + du / de la / des + noun', color: '#0284c7', soft: '#f0f9ff' },
        verb: { label: 'a verb of its own', color: '#7c3aed', soft: '#f5f3ff' }
    };
    const SEASONS = {
        printemps: { fr: 'le printemps', it: "C'est le printemps.", en: 'spring', in: 'au printemps', img: PIC('cherry-blossom') },
        ete: { fr: "l'été", it: "C'est l'été.", en: 'summer', in: 'en été', img: PIC('beach-with-umbrella') },
        automne: { fr: "l'automne", it: "C'est l'automne.", en: 'autumn', in: 'en automne', img: PIC('fallen-leaf') },
        hiver: { fr: "l'hiver", it: "C'est l'hiver.", en: 'winter', in: 'en hiver', img: PIC('snowman') }
    };
    // Seasons start around 20 March, 21 June, 22 September and 21 December
    function seasonOf(d) {
        const m = d.getMonth(), day = d.getDate();
        const md = m * 100 + day;
        if (md >= 220 && md < 521) return 'printemps';
        if (md >= 521 && md < 822) return 'ete';
        if (md >= 822 && md < 1121) return 'automne';
        return 'hiver';
    }

    const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
    const TENS = { 2: 'vingt', 3: 'trente', 4: 'quarante' };
    function numberFr(n) {
        if (n < 0) return 'moins ' + numberFr(-n);
        if (n <= 16) return UNITS[n];
        if (n < 20) return 'dix-' + UNITS[n - 10];
        const t = Math.floor(n / 10), u = n % 10;
        return TENS[t] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + UNITS[u]);
    }
    // degré stays singular between −1 and 1: zéro degré, un degré, moins un degré
    const degrees = (n) => numberFr(n) + (Math.abs(n) < 2 ? ' degré' : ' degrés');
    const dateNum = (d) => d === 1 ? '1er' : String(d);
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const say = (t) => window.speakText && window.speakText(t.replace(/\b1er\b/g, 'premier'));
    const ordinalEn = (d) => d + (d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th');

    const CSS = `
.ml{--ml-day:#4f46e5;--ml-num:#d97706;--ml-mon:#059669;font-family:inherit;color:#1e293b}
.ml *{box-sizing:border-box}
.ml h3{font-size:17px;font-weight:700;color:#1e1b4b;margin:0 0 4px}
.ml .ml-sub{font-size:13px;color:#64748b;margin:0 0 12px}
.ml .ml-step{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:99px;background:#4f46e5;color:#fff;font-size:13px;font-weight:700;margin-right:6px}
.ml .ml-box{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-bottom:16px}
.ml .ml-grid{display:grid;gap:16px;grid-template-columns:1fr}
@media(min-width:900px){.ml .ml-grid{grid-template-columns:minmax(0,3fr) minmax(0,2fr)}.ml .ml-side{position:sticky;top:12px;align-self:start}}
.ml button{font:inherit;cursor:pointer}
.ml .ml-cal-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.ml .ml-cal-head .ml-title{flex:1;text-align:center;font-weight:700;font-size:16px;color:var(--ml-mon)}
.ml .ml-arrow{width:44px;height:40px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;font-size:26px;line-height:1;color:#334155}
.ml .ml-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.ml .ml-cal .ml-wd{font-size:11px;font-weight:700;color:#94a3b8;text-align:center;padding:4px 0;text-transform:uppercase}
.ml .ml-cal button{height:40px;border-radius:10px;border:1px solid transparent;background:#f8fafc;font-size:15px;color:#334155}
.ml .ml-cal button.ml-today{border-color:#a5b4fc}
.ml .ml-cal button.ml-on{background:var(--ml-num);color:#fff;font-weight:700}
.ml .ml-cal button.ml-we{color:#94a3b8}
.ml .ml-cal button.ml-on.ml-we{color:#fff}
.ml .ml-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}
.ml .ml-pill{border:1px solid #e2e8f0;background:#fff;border-radius:99px;padding:8px 14px;font-size:14px;color:#334155;min-height:40px}
.ml .ml-date{font-size:20px;font-weight:700;margin-top:12px;line-height:1.4}
.ml .ml-tip{font-size:13px;color:#475569;background:#f8fafc;border-radius:12px;padding:10px 12px;margin-top:10px;line-height:1.5}
.ml .ml-tip b{color:#1e1b4b}
.ml .ml-d{color:var(--ml-day)} .ml .ml-n{color:var(--ml-num)} .ml .ml-m{color:var(--ml-mon)}
.ml .ml-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px}
.ml .ml-tile{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 8px;border-radius:14px;border:2px solid #e2e8f0;background:#fff;text-align:center;min-height:120px;border-top-width:5px}
.ml .ml-tile img{width:56px;height:56px;object-fit:contain}
.ml .ml-tile .ml-fr{font-size:14px;font-weight:700;color:#1e293b;line-height:1.2}
.ml .ml-tile .ml-en{font-size:11px;color:#64748b;line-height:1.2}
.ml .ml-tile.ml-on{box-shadow:0 0 0 3px #c7d2fe;border-color:#4f46e5}
.ml .ml-key{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;color:#475569;margin:0 0 10px}
.ml .ml-key span::before{content:'';display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;background:var(--c);vertical-align:-1px}
.ml .ml-temp{display:flex;align-items:center;gap:12px}
.ml .ml-temp input{flex:1;accent-color:#e11d48;height:36px}
.ml .ml-deg{min-width:74px;text-align:center;font-size:22px;font-weight:800;border-radius:12px;padding:6px 8px;color:#fff}
.ml .ml-scale{display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin:2px 4px 0}
.ml .ml-card{border-radius:20px;padding:18px;color:#1e293b;background:linear-gradient(160deg,#e0f2fe,#eef2ff);border:1px solid #c7d2fe}
.ml .ml-card .ml-pics{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px}
.ml .ml-card .ml-pics img{width:88px;height:88px;object-fit:contain}
.ml .ml-card .ml-pics img.ml-small{width:52px;height:52px;opacity:.9}
.ml .ml-card .ml-big{font-size:28px;font-weight:800;text-align:center;margin-bottom:4px}
.ml .ml-say{font-size:18px;line-height:1.55;font-weight:600}
.ml .ml-say .ml-w{color:#e11d48} .ml .ml-say .ml-t{color:#0369a1} .ml .ml-say .ml-s{color:#0f766e}
.ml .ml-card .ml-trans{font-size:13px;color:#64748b;margin-top:8px}
.ml .ml-listen{display:flex;width:100%;align-items:center;justify-content:center;gap:8px;margin-top:12px;border:0;border-radius:14px;background:#4f46e5;color:#fff;font-weight:700;font-size:16px;min-height:48px}
.ml .ml-seasons{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:12px}
.ml .ml-seasons button{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:6px 2px;font-size:12px;color:#334155;display:flex;flex-direction:column;align-items:center;gap:2px}
.ml .ml-seasons button img{width:34px;height:34px}
.ml .ml-seasons button.ml-on{border-color:#0f766e;background:#f0fdfa;font-weight:700;color:#0f766e}
.ml .ml-q{display:grid;gap:10px}
.ml .ml-qpic{display:flex;justify-content:center}
.ml .ml-qpic img{width:110px;height:110px}
.ml .ml-opts{display:grid;gap:8px}
.ml .ml-opts.ml-pics4{grid-template-columns:repeat(2,1fr)}
@media(min-width:640px){.ml .ml-opts.ml-pics4{grid-template-columns:repeat(4,1fr)}}
.ml .ml-opt{border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:12px;font-size:16px;font-weight:600;color:#1e293b;min-height:48px;text-align:left}
.ml .ml-pics4 .ml-opt{display:flex;justify-content:center;align-items:center;padding:10px}
.ml .ml-pics4 .ml-opt img{width:64px;height:64px}
.ml .ml-opt.ml-ok{border-color:#059669;background:#ecfdf5}
.ml .ml-opt.ml-bad{border-color:#e11d48;background:#fff1f2}
.ml .ml-qtop{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#64748b}
.ml .ml-hear{display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;background:#eef2ff;color:#4338ca;font-weight:700;font-size:16px;min-height:56px}
.ml .ml-fb{font-size:14px;min-height:20px;color:#475569}
.ml .ml-next{border:0;border-radius:12px;background:#4f46e5;color:#fff;font-weight:700;padding:10px 18px;min-height:44px}
.ml .ml-mini{position:sticky;bottom:8px;z-index:5;display:flex;align-items:center;gap:10px;background:#1e1b4b;color:#fff;border-radius:16px;padding:8px 8px 8px 12px;box-shadow:0 6px 20px rgba(30,27,75,.3);margin-bottom:16px}
.ml .ml-mini img{width:36px;height:36px}
.ml .ml-mini span{flex:1;font-size:14px;font-weight:600;line-height:1.3}
.ml .ml-mini button{border:0;border-radius:12px;background:#4f46e5;color:#fff;font-weight:700;min-height:44px;padding:0 14px}
@media(min-width:900px){.ml .ml-mini{display:none}}
.ml .ml-guide{display:grid;gap:10px}
@media(min-width:720px){.ml .ml-guide{grid-template-columns:repeat(2,1fr)}}
.ml .ml-gq{border:1px solid #e2e8f0;border-radius:14px;padding:12px 14px;background:#f8fafc}
.ml .ml-gq .ml-gh{font-size:16px;font-weight:700;color:#1e1b4b;margin:0 0 2px}
.ml .ml-gq .ml-ge{font-size:12px;color:#64748b;margin:0 0 8px}
.ml .ml-gq button{display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:10px;padding:8px 10px;margin-top:6px;font-size:15px;color:#1e293b;min-height:40px}
.ml .ml-gq button small{display:block;font-size:12px;color:#64748b}
`;

    function bind(box) {
        const root = box.querySelector('#meteo-lesson') || box;
        if (!document.getElementById('ml-css')) {
            const st = document.createElement('style'); st.id = 'ml-css'; st.textContent = CSS; document.head.appendChild(st);
        }
        const today = new Date(); today.setHours(12, 0, 0, 0);
        const state = { date: new Date(today), view: new Date(today.getFullYear(), today.getMonth(), 1), w: WEATHER[0], temp: WEATHER[0].temp };

        root.className = 'ml';
        root.innerHTML = `
            <div class="ml-grid">
                <div>
                    <div class="ml-box">
                        <h3><span class="ml-step">1</span>Quelle est la date ?</h3>
                        <p class="ml-sub">Pick a day. The weekday and the season follow by themselves.</p>
                        <div class="ml-cal-head">
                            <button type="button" class="ml-arrow" data-ml="prev" aria-label="Previous month">‹</button>
                            <div class="ml-title"></div>
                            <button type="button" class="ml-arrow" data-ml="next" aria-label="Next month">›</button>
                        </div>
                        <div class="ml-cal"></div>
                        <div class="ml-row"><button type="button" class="ml-pill" data-ml="today">📅 Aujourd'hui</button><button type="button" class="ml-pill" data-ml="say-date">🔊 Hear the date</button></div>
                        <div class="ml-date"></div>
                        <div class="ml-tip">
                            <b>Le + number + month</b>, with the weekday in front if you like: <span class="ml-d">lundi</span> <span class="ml-n">2</span> <span class="ml-m">novembre</span>.<br>
                            Only the 1st is special: <b>le 1er mai</b> (« le premier mai »). After that it is just the number: le 2, le 3… le 31.<br>
                            Days and months take <b>no capital letter</b> in French.
                        </div>
                    </div>
                    <div class="ml-box">
                        <h3><span class="ml-step">2</span>Quel temps fait-il ?</h3>
                        <p class="ml-sub">Tap a picture to hear it and put it in your forecast.</p>
                        <div class="ml-key">${Object.values(KIND).map(k => `<span style="--c:${k.color}">${k.label}</span>`).join('')}</div>
                        <div class="ml-tiles">${WEATHER.map(w => `
                            <button type="button" class="ml-tile" data-w="${w.key}" style="border-top-color:${KIND[w.kind].color}">
                                <img src="${w.img}" alt="" loading="lazy">
                                <span class="ml-fr">${w.fr}</span><span class="ml-en">${w.en}</span>
                            </button>`).join('')}
                        </div>
                    </div>
                    <div class="ml-box">
                        <h3><span class="ml-step">3</span>Quelle température fait-il ?</h3>
                        <p class="ml-sub">Slide to choose. Below zero, say <b>moins</b>: moins cinq degrés.</p>
                        <div class="ml-temp">
                            <input type="range" min="-10" max="40" step="1" aria-label="Temperature in degrees Celsius">
                            <div class="ml-deg"></div>
                        </div>
                        <div class="ml-scale"><span>−10 °C</span><span>0</span><span>10</span><span>20</span><span>30</span><span>40 °C</span></div>
                        <div class="ml-tip ml-temp-say"></div>
                    </div>
                    <div class="ml-mini" aria-hidden="true"><img alt=""><span></span><button type="button" data-ml="listen" tabindex="-1">🔊 Hear</button></div>
                </div>
                <div class="ml-side">
                    <div class="ml-card" role="region" aria-label="Your forecast">
                        <div class="ml-pics"></div>
                        <div class="ml-big"></div>
                        <div class="ml-say"></div>
                        <div class="ml-trans"></div>
                        <button type="button" class="ml-listen" data-ml="listen">🔊 Listen to the forecast</button>
                    </div>
                    <div class="ml-box" style="margin-top:16px">
                        <h3>Les saisons</h3>
                        <p class="ml-sub">« en » for three of them, but <b>au printemps</b>.</p>
                        <div class="ml-seasons">${Object.entries(SEASONS).map(([k, s]) => `
                            <button type="button" data-season="${k}"><img src="${s.img}" alt="">${s.in}<span style="font-weight:400;color:#64748b">${s.en}</span></button>`).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="ml-box">
                <h3>🎯 Check yourself: Quel temps fait-il ?</h3>
                <p class="ml-sub">Eight quick questions: match the picture and the sentence.</p>
                <div class="ml-q"></div>
            </div>

            <div class="ml-box">
                <h3>📖 The questions to know</h3>
                <p class="ml-sub">Tap an answer to hear it.</p>
                <div class="ml-guide">${guide()}</div>
            </div>`;

        const $ = (s) => root.querySelector(s);
        const slider = $('.ml-temp input');

        function drawCalendar() {
            const v = state.view, y = v.getFullYear(), m = v.getMonth();
            $('.ml-title').textContent = `${MONTHS[m]} ${y}`;
            const first = (new Date(y, m, 1).getDay() + 6) % 7;   // Monday first
            const n = new Date(y, m + 1, 0).getDate();
            let h = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `<div class="ml-wd" title="${DAYS[(i + 1) % 7]}">${d}</div>`).join('');
            for (let i = 0; i < first; i++) h += '<div></div>';
            for (let d = 1; d <= n; d++) {
                const dt = new Date(y, m, d), wd = dt.getDay();
                const cls = [sameDay(dt, state.date) ? 'ml-on' : '', sameDay(dt, today) ? 'ml-today' : '', wd === 0 || wd === 6 ? 'ml-we' : ''].join(' ');
                h += `<button type="button" class="${cls}" data-day="${d}" aria-label="${DAYS[wd]} ${dateNum(d)} ${MONTHS[m]} ${y}">${d}</button>`;
            }
            $('.ml-cal').innerHTML = h;
        }
        const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

        function dateParts() {
            const d = state.date;
            return { wd: DAYS[d.getDay()], n: dateNum(d.getDate()), m: MONTHS[d.getMonth()] };
        }
        function datePhrase() { const p = dateParts(); return `le ${p.wd} ${p.n} ${p.m}`; }

        function render() {
            const p = dateParts(), w = state.w, t = state.temp, sk = seasonOf(state.date), s = SEASONS[sk];
            $('.ml-date').innerHTML = `Nous sommes le <span class="ml-d">${p.wd}</span> <span class="ml-n">${p.n}</span> <span class="ml-m">${p.m}</span>.`;
            root.querySelectorAll('.ml-tile').forEach(b => b.classList.toggle('ml-on', b.dataset.w === w.key));
            root.querySelectorAll('[data-season]').forEach(b => b.classList.toggle('ml-on', b.dataset.season === sk));
            slider.value = t;
            const deg = $('.ml-deg');
            deg.textContent = (t < 0 ? '−' + -t : t) + ' °C';
            deg.style.background = t <= 0 ? '#0284c7' : t < 15 ? '#0d9488' : t < 25 ? '#d97706' : '#e11d48';
            $('.ml-temp-say').innerHTML = `<b>Il fait ${degrees(t)}.</b> <span style="color:#64748b">(It is ${t} degrees.)</span>`;

            $('.ml-pics').innerHTML = `<img src="${w.img}" alt="${w.fr}"><img class="ml-small" src="${s.img}" alt="${s.fr}">`;
            $('.ml-big').textContent = (t < 0 ? '−' + -t : t) + ' °C';
            $('.ml-say').innerHTML = `Aujourd'hui, nous sommes le <span class="ml-d">${p.wd}</span> <span class="ml-n">${p.n}</span> <span class="ml-m">${p.m}</span>. `
                + `<span class="ml-s">${s.it}</span> <span class="ml-w">${cap(w.fr)}</span> et <span class="ml-t">il fait ${degrees(t)}</span>.`;
            $('.ml-mini img').src = w.img;
            $('.ml-mini span').textContent = `${p.wd} ${p.n} ${p.m} · ${cap(w.fr)} · ${t < 0 ? '−' + -t : t} °C`;
            const d = state.date;
            $('.ml-trans').textContent = `Today is ${DAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${ordinalEn(d.getDate())}. It is ${s.en}. ${cap(w.en)} and it is ${t} degrees.`;
            window.currentPracticeTarget = sentence();
        }
        function sentence() {
            const p = dateParts(), s = SEASONS[seasonOf(state.date)];
            return `Aujourd'hui, nous sommes le ${p.wd} ${p.n} ${p.m}. ${s.it} ${cap(state.w.fr)} et il fait ${degrees(state.temp)}.`;
        }

        root.addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
            const act = b.dataset.ml;
            if (act === 'prev' || act === 'next') {
                state.view = new Date(state.view.getFullYear(), state.view.getMonth() + (act === 'prev' ? -1 : 1), 1);
                drawCalendar(); return;
            }
            if (act === 'today') { state.date = new Date(today); state.view = new Date(today.getFullYear(), today.getMonth(), 1); drawCalendar(); render(); say('Nous sommes ' + datePhrase()); return; }
            if (act === 'say-date') { say('Nous sommes ' + datePhrase()); return; }
            if (act === 'listen') { say(sentence()); return; }
            if (b.dataset.day) {
                state.date = new Date(state.view.getFullYear(), state.view.getMonth(), Number(b.dataset.day), 12);
                drawCalendar(); render(); say(datePhrase()); return;
            }
            if (b.dataset.w) {
                state.w = WEATHER.find(x => x.key === b.dataset.w); state.temp = state.w.temp;
                render(); say(state.w.fr); return;
            }
            if (b.dataset.season) { const s = SEASONS[b.dataset.season]; say(s.it + ' ' + cap(s.in) + '.'); return; }
            if (b.dataset.g) { say(b.dataset.g); return; }
        });
        slider.addEventListener('input', () => { state.temp = Number(slider.value); render(); });
        slider.addEventListener('change', () => say('Il fait ' + degrees(state.temp)));

        drawCalendar(); render(); quiz($('.ml-q'));
    }

    function guide() {
        const Q = [
            ['Quel jour sommes-nous ?', 'What day is it?', [['Nous sommes lundi.', 'It is Monday.'], ["On est lundi. / C'est lundi.", 'Everyday ways to say it.']]],
            ['Quelle est la date ?', "What's the date?", [['Nous sommes le 2 novembre.', 'It is November 2nd.'], ["C'est le 1er mai.", 'Say « le premier mai ».']]],
            ['Quel temps fait-il ?', "What's the weather like?", [['Il fait beau.', 'The weather is nice.'], ['Il pleut et il y a du vent.', 'It is raining and windy.']]],
            ['Quelle température fait-il ?', 'What is the temperature?', [['Il fait vingt degrés.', 'It is 20 degrees.'], ['Il fait moins cinq.', 'It is minus 5.']]],
            ['On est en quelle saison ?', 'What season is it?', [["C'est l'automne.", 'It is autumn.'], ['Il neige souvent en hiver.', 'It often snows in winter.']]],
            ['Lundi or le lundi?', 'One day, or every week', [["Lundi, je vais au cinéma.", 'On Monday (this one), I am going to the cinema.'], ['Le lundi, je vais au sport.', 'On Mondays (every week), I go to the gym.']]]
        ];
        return Q.map(([q, en, as]) => `
            <div class="ml-gq">
                <p class="ml-gh">${q}</p><p class="ml-ge">${en}</p>
                ${as.map(([fr, e]) => `<button type="button" data-g="${fr.replace(/"/g, '&quot;')}">🔊 ${fr}<small>${e}</small></button>`).join('')}
            </div>`).join('');
    }

    // Pictures that look alike never meet in one question
    const LOOKALIKE = [['beau', 'soleil', 'chaud'], ['mauvais', 'pluie', 'orage'], ['froid', 'neige'], ['nuages', 'brouillard']];
    const alike = (a, b) => LOOKALIKE.some(g => g.includes(a.key) && g.includes(b.key));

    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

    function quiz(el) {
        const N = 8;
        let qs, i, score, done;
        function start() {
            qs = shuffle(WEATHER).slice(0, N).map((w, k) => ({ w, mode: k % 2 ? 'hear' : 'see', opts: shuffle([w, ...shuffle(WEATHER.filter(x => x !== w && !alike(x, w))).slice(0, k % 2 ? 3 : 2)]) }));
            i = 0; score = 0; show();
        }
        function show() {
            done = false;
            if (i >= N) {
                el.innerHTML = `<div style="text-align:center;padding:10px 0"><div style="font-size:40px">${score >= 7 ? '🌟' : score >= 5 ? '👍' : '💪'}</div>
                    <p style="font-size:18px;font-weight:700;margin:6px 0">${score} / ${N}</p>
                    <p class="ml-sub">${score >= 7 ? 'Très bien ! You know your weather.' : 'Have another look at the pictures above, then try again.'}</p>
                    <button type="button" class="ml-next" data-q="again">Try again</button></div>`;
                return;
            }
            const q = qs[i];
            const top = `<div class="ml-qtop"><span>Question ${i + 1} / ${N}</span><span>Score: ${score}</span></div>`;
            if (q.mode === 'see') {
                el.innerHTML = `${top}<div class="ml-qpic"><img src="${q.w.img}" alt="A weather picture"></div>
                    <div class="ml-opts">${q.opts.map(o => `<button type="button" class="ml-opt" data-a="${o.key}">${cap(o.fr)}.</button>`).join('')}</div>
                    <div class="ml-fb"></div>`;
            } else {
                el.innerHTML = `${top}<button type="button" class="ml-hear" data-q="hear">🔊 Listen, then tap the picture</button>
                    <div class="ml-opts ml-pics4">${q.opts.map(o => `<button type="button" class="ml-opt" data-a="${o.key}" aria-label="Picture ${o.en}"><img src="${o.img}" alt=""></button>`).join('')}</div>
                    <div class="ml-fb"></div>`;
                say(cap(q.w.fr) + '.');
            }
        }
        el.addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.q === 'again') { start(); return; }
            if (b.dataset.q === 'hear') { say(cap(qs[i].w.fr) + '.'); return; }
            if (b.dataset.q === 'next') { i++; show(); return; }
            if (!b.dataset.a || done) return;
            done = true;
            const q = qs[i], ok = b.dataset.a === q.w.key;
            if (ok) score++;
            el.querySelectorAll('.ml-opt').forEach(o => { if (o.dataset.a === q.w.key) o.classList.add('ml-ok'); else if (o === b) o.classList.add('ml-bad'); });
            el.querySelector('.ml-fb').innerHTML = `${ok ? '✅ Bien joué !' : '❌ Not quite.'} <b>${cap(q.w.fr)}</b> = ${q.w.en}.
                <div style="margin-top:8px"><button type="button" class="ml-next" data-q="next">${i + 1 < N ? 'Next →' : 'See my score'}</button></div>`;
            el.querySelector('.ml-qtop span:last-child').textContent = 'Score: ' + score;
            say(cap(q.w.fr) + '.');
        });
        start();
    }

    return { bind, numberFr, seasonOf };
})();
