# Weather video (Vocab theme 8)

Makes `media/meteo/meteo.mp4`, its poster and the pictures for Check yourself.

1. Get the voice program and two French voices (from the Piper releases on GitHub) into this folder:
   - `piper/` from `piper_linux_x86_64.tar.gz` (release 2023.11.14-2)
   - `voices/fr-siwis-medium/` (Léa) and `voices/fr-gilles-low/` (Hugo) from release v0.0.2
2. `python3 build_audio.py` records every line and writes `timeline.json` and `audio.wav`.
   The script, subtitles and events (clouds, rain, storm, fog, wind, snow, frost) are at the top of this file.
3. `python3 render.py video` draws `scene.html` frame by frame with Playwright and joins it with the sound (ffmpeg).
4. `NOSUB=1 python3 render.py stills 19 22.4 27.9 30 36.5 37.9 41 51 54.5 63 66.8` makes the quiz pictures (no subtitles).
5. Make it smaller for the web: `ffmpeg -i meteo.mp4 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart meteo-web.mp4`.
