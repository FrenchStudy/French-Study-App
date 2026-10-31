# Café video (Vocab theme 18)

Léa orders breakfast, lunch and a goûter from Chloé, the waitress. Makes `media/cafe/cafe.mp4`, its poster and the three quiz pictures.

1. Put the Piper program (`piper/`, release 2023.11.14-2) and the voice `voices/fr-siwis-medium/` (release v0.0.2) in this folder.
2. `python3 build_audio.py`: the script is at the top. Every line is spoken as one whole sentence (cutting lines into pieces made the voice stumble). Chloé is the same voice, a little higher (ffmpeg rubberband). Writes `timeline.json` and `audio.wav`; the moments when things appear are placed where their words are in the sentence.
3. `python3 render.py video`: draws `scene.html` frame by frame (one file per scene, joined, then the sound). The camera goes to whoever speaks; Chloé writes the order, fetches a tray and serves; the listener nods.
4. `NOSUB=1 python3 render.py stills 27.6 46.4 87.6`: the quiz pictures (matin, midi, goûter).
5. For the web: `ffmpeg -i cafe.mp4 -c:v libx264 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart cafe-web.mp4`.

`chars/`: Léa and Chloé with three mouths (smile, laugh, agape) and three eyes (happy, humble = blink, bow = delighted), made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: food from Microsoft Fluent Emoji (MIT).
