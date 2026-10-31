# Money video (Vocab theme 24)

Léa's card is refused in a café (sans contact, billet, pièce, centimes, service compris, TVA, gardez la monnaie, pourboire), she uses the cash machine and the bank (code, solde, virement, compte, frais, déposer, prêt), changes euros into dollars (taux de change, tarif, gratuit) and lends Camille 20 € (dépenser, économiser, prêter, emprunter, devoir). Makes `media/argent/argent.mp4`, its poster and the four quiz pictures.

1. Put the Piper program (`piper/`, release 2023.11.14-2) and the voice `voices/fr-siwis-medium/` (release v0.0.2) in this folder.
2. `python3 build_audio.py`: the script is at the top. Everyone is the same voice at a different pitch and speed (`VOICE`); Writes `timeline.json` and `audio.wav`.
3. `python3 render.py video`: draws `scene.html` frame by frame (one file per scene, joined, then the sound). The camera takes one sample per frame on a fixed time grid, so it glides and never steps.
4. `NOSUB=1 python3 render.py stills 14 48 83 112 26`: the quiz pictures (cafe, banque, change, soir) and the poster.
5. For the web: `ffmpeg -i argent.mp4 -c:v libx264 -crf 25 -preset veryfast -c:a aac -b:a 96k -movflags +faststart argent-web.mp4`.

`chars/`: the people with four mouths and four eyes, made with DiceBear toon-head (CC BY 4.0, Johan Melin).
`pics/`: Microsoft Fluent Emoji (MIT).
