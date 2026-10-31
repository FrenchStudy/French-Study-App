# Hotel video (Vocab theme 23)

The hotel is full, so Léa finds a room in Mme Leroy's chambre d'hôte by the sea: two nights, a single room with a sea view, the price per night, breakfast included (no half board), the deposit and the time to leave. In the room she swaps the air conditioning for the heating and phones for a towel, a pillow and a blanket. Makes `media/hotel/hotel.mp4`, its poster and the three quiz pictures.

1. Put the Piper program (`piper/`, release 2023.11.14-2) and the voice `voices/fr-siwis-medium/` (release v0.0.2) in this folder.
2. `python3 build_audio.py`: the script is at the top. Everyone is the same voice at a different pitch and speed (`VOICE`); `Q` is Mme Leroy on the phone. Writes `timeline.json` and `audio.wav`.
3. `python3 render.py video`: draws `scene.html` frame by frame (one file per scene, joined, then the sound). The camera takes one sample per frame on a fixed time grid, so it glides and never steps.
4. `NOSUB=1 python3 render.py stills 19.5 72 117 77`: the quiz pictures (hotel, accueil, chambre) and the poster.
5. For the web: `ffmpeg -i hotel.mp4 -c:v libx264 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart hotel-web.mp4`.

`chars/`: the people with four mouths and four eyes, made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: Microsoft Fluent Emoji (MIT).
