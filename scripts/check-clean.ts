import { cleanSecret } from "../src/data/clean";
const good = "eyJhbGci.eyJpc3Mi-abc_def.rTqz-Uu02";
const bad = "eyJhbGci.eyJpc3Mi‑abc_def.rTqz–Uu02 ​\n";
console.log("parandab kriipsud:", cleanSecret(bad) === good, "| ASCII-le:", /^[\x21-\x7E]+$/.test(cleanSecret(bad)));
