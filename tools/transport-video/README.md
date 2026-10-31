# Transport video (Vocab theme 22)

Léa buys a train ticket in Paris, takes the train to Lyon (delay, composter, the ticket inspector, terminus, correspondance), finds her flight home cancelled at the airport, hires a car and drives back to Paris (autoroute, station-service, parking), then goes home by bike. Makes `media/transport/transport.mp4`, its poster and the four quiz pictures.

1. Put the Piper program (`piper/`, release 2023.11.14-2) and the voice `voices/fr-siwis-medium/` (release v0.0.2) in this folder.
2. `python3 build_audio.py`: the script is at the top. Everyone is the same voice at a different pitch and speed (`VOICE`); `A` lines are announcements (loudspeaker sound and a chime before). Writes `timeline.json` and `audio.wav`.
3. `python3 render.py video`: draws `scene.html` frame by frame (one file per scene, joined, then the sound). The camera takes one sample per frame on a fixed time grid, so it glides and never steps.
4. `NOSUB=1 python3 render.py stills 25 64 101 124 56`: the quiz pictures (gare, train, aero, route) and the poster.
5. For the web: `ffmpeg -i transport.mp4 -c:v libx264 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart transport-web.mp4`.

`chars/`: the people with four mouths and four eyes, made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: Microsoft Fluent Emoji (MIT).
