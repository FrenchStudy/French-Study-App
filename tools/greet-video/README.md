# Greetings video (Vocab theme 1)

Léa says hello to her neighbour Mme Dubois in the morning (vous), meets Mme Martin at the reception of a new office (vous, prénom and nom de famille, « parlez plus lentement »), and meets her friend Camille and Camille's little sister Zoé in a café in the evening (bonsoir, la bise, tu). Makes `media/greet/greet.mp4`, its poster and the three quiz pictures.

1. Put the Piper program (`piper/`, release 2023.11.14-2) and the voice `voices/fr-siwis-medium/` (release v0.0.2) in this folder.
2. `python3 build_audio.py`: the script is at the top. Every line is one whole sentence. Everyone is the same voice at a different pitch and speed (`VOICE`); a line can have its own speed (Mme Martin's too-fast and slow directions). Writes `timeline.json` and `audio.wav`.
3. `python3 render.py video`: draws `scene.html` frame by frame (one file per scene, joined, then the sound). In the street and the office the camera goes to whoever speaks; in the café it holds one steady shot of the table.
4. `NOSUB=1 python3 render.py stills 21 57.8 69.6 86`: the quiz pictures (matin, bureau, soir) and the poster.
5. For the web: `ffmpeg -i greet.mp4 -c:v libx264 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart greet-web.mp4`.

`chars/`: the five people with three mouths and three eyes, made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: Microsoft Fluent Emoji (MIT).
