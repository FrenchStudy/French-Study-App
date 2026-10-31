# Work & School video (Vocab theme 27)

Léa at school (a memory: élèves, cahier, stylo, tableau, matière, devoirs, cantine), at university (étudiante en, étudier, passer un examen, note, réussir, échouer, diplôme), looking for a job (chômage, entreprise, CV, entretien), at the interview (patronne, métier, à plein temps / à temps partiel, salaire, gagner, contrat) and on her first day (collègue, bureau, je travaille chez, réunion, vacances, retraite). Makes `media/travail/travail.mp4`, its poster and the five quiz pictures. The school scene has a light sepia filter (a memory).

1. Put the Piper program (`piper/`, release 2023.11.14-2) and the voice `voices/fr-siwis-medium/` (release v0.0.2) in this folder.
2. `python3 build_audio.py`: the script is at the top. Everyone is the same voice at a different pitch and speed (`VOICE`); Writes `timeline.json` and `audio.wav`.
3. `python3 render.py video`: draws `scene.html` frame by frame (one file per scene, joined, then the sound). The camera takes one sample per frame on a fixed time grid, so it glides and never steps.
4. `NOSUB=1 python3 render.py stills 11 44 60 97 112 63`: the quiz pictures (ecole, fac, emploi, entretien, bureau) and the poster.
5. For the web: `ffmpeg -i travail.mp4 -c:v libx264 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart travail-web.mp4`.

`chars/`: the people with four mouths and four eyes, made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: Microsoft Fluent Emoji (MIT).
