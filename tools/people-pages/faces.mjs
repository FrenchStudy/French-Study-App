// node tools/people-pages/faces.mjs tools/people-pages/faces.json media/people
// Needs the DiceBear core (@dicebear/core) and the toon-head style JSON: set DICEBEAR (core index.js) and TOONHEAD (style JSON).
const C = await import(process.env.DICEBEAR || '/tmp/dbjs/index.js');
import fs from 'fs';
const S=new C.Style(JSON.parse(fs.readFileSync(process.env.TOONHEAD || '/tmp/dd/src/toon-head.json','utf8')));
const base={rearHairProbability:100,beardProbability:0};
const P={
 paul:{hairVariant:['undercut'],rearHairProbability:0,clothesVariant:['tShirt'],clothesColor:['2563eb'],hairColor:['3b2a20'],skinColor:['f1c3a5']},
 rose:{hairVariant:['bun'],rearHairProbability:0,clothesVariant:['dress'],clothesColor:['7c3aed'],hairColor:['c9c9c9'],skinColor:['f1c3a5']},
 hugo:{hairProbability:0,rearHairProbability:0,beardProbability:100,beardVariant:['fullBeard'],clothesVariant:['shirt'],clothesColor:['16a34a'],hairColor:['5a3825'],skinColor:['c68e7a']},
 julie:{hairVariant:['sideComed'],rearHairVariant:['longStraight'],clothesVariant:['turtleNeck'],clothesColor:['f97316'],hairColor:['b55239'],skinColor:['f1c3a5']},
 tom:{hairVariant:['spiky'],rearHairProbability:0,clothesVariant:['tShirt'],clothesColor:['0ea5e9'],hairColor:['e0c070'],skinColor:['f1c3a5']},
 lea:{hairVariant:['sideComed'],rearHairVariant:['longWavy'],clothesVariant:['turtleNeck'],clothesColor:['b11f1f'],hairColor:['724133'],skinColor:['f1c3a5']},
};
const specs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));   // [[file, person, mouth, eyes, brows]]
const out=process.argv[3]; fs.mkdirSync(out,{recursive:true});
for (const [file, who, m, e, b] of specs)
  fs.writeFileSync(`${out}/${file}.svg`, new C.Avatar(S,{seed:'x',...base,...P[who],mouthVariant:[m],eyesVariant:[e],eyebrowsVariant:[b]}).toString());
console.log(specs.length,'faces');
