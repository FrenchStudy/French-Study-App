# Café video (Vocab theme 18)

Makes `media/cafe/cafe.mp4`, its poster and the pictures for Check yourself. Same steps as `tools/meteo-video`:

1. Put the Piper program (`piper/`) and the voices `voices/fr-siwis-medium/` (Léa) and `voices/fr-gilles-low/` (Hugo) in this folder.
2. `python3 build_audio.py`: records every line and writes `timeline.json` and `audio.wav` (the script is at the top).
3. `python3 render.py video`: draws `scene.html` frame by frame and joins it with the sound.
4. `NOSUB=1 python3 render.py stills 24.6 40.5 66.2`: the three quiz pictures (matin, midi, goûter).
5. For the web: `ffmpeg -i cafe.mp4 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart cafe-web.mp4`.

`chars/`: Léa and Hugo with three mouths each (smile, laugh, agape), made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: food from Microsoft Fluent Emoji (MIT).
