/* أدوات معالجة النص العربي للروبوت الموحد */

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ماهي/g, "ما هي")
    .replace(/ماهو/g, "ما هو")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "ما",
  "هي",
  "هو",
  "من",
  "في",
  "عن",
  "على",
  "الى",
  "هل",
  "كيف",
  "متى",
  "اين",
  "لماذا"
]);

function tokens(text) {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w));
}
