# People pages (Vocab 12 Personality & Physical Description, 13 Emotions & Feelings)

Step 2 of these two topics is a picture page with people: who is tall, short, red-haired, shy, proud, hungry…
Each label shows the form that fits the person (Paul est grand, Rose est petite): blue for a man or a boy,
pink for a woman or a girl, grey when it is the same for both; the note gives both forms.

1. `python3 tools/people-pages/people.py` writes `js/people-pages.js` (the pages; `picture-page.js` shows them) and
   `faces.json` (the faces they use).
2. `node tools/people-pages/faces.mjs tools/people-pages/faces.json media/people` draws the faces with DiceBear
   toon-head (CC BY 4.0, Johan Melin). It needs the DiceBear core and the toon-head style JSON: set `DICEBEAR`
   (the core's index.js) and `TOONHEAD` (the style JSON).

Six people: Paul, Tom, Hugo (bald, beard), Rose (older, glasses), Julie (red hair), Léa (light brown hair).
Props are Microsoft Fluent Emoji 3D (MIT) in `media/pictures/fe-*.webp`.
