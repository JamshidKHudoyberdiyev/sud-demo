// Drawn portrait avatars (no real photos): face, hair and clothes vary by a seed.
// Women are listed by initials; everyone else is drawn as a man. Org/system badges keep initials.
const FEMALE = new Set(["KN", "AM", "ED", "SZ", "RG", "NS", "BK", "GE", "ZI"]);
const NO_FACE = new Set(["SH", "TK", "★"]);

const SKIN = ["#f1c7a5", "#e8b48f", "#d9a17c", "#f3d0b5", "#c98e6b"];
const HAIR = ["#1f1a17", "#2b211c", "#3b2a20", "#4a3426", "#151515"];
const SUIT = ["#1e3a5f", "#334155", "#0f4c5c", "#3f3f46", "#1e40af", "#0b6b61"];
const BG = ["#dbeafe", "#e0f2f1", "#ede9fe", "#fef3c7", "#e2e8f0", "#fce7f3"];

function hash(s) {
  let h = 7;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function portrait(ini) {
  const h = hash(ini);
  const pick = (arr, k) => arr[(h >> k) % arr.length];
  const skin = pick(SKIN, 1), hair = pick(HAIR, 3), suit = pick(SUIT, 5), bg = pick(BG, 7);
  const f = FEMALE.has(ini);
  const shade = "rgba(0,0,0,.08)";
  const back = f ? `<path d="M17 50 C14 34 17 13 32 13 C47 13 50 34 47 50 Z" fill="${hair}"/>` : "";
  const top = f
    ? `<path d="M20.5 28 C20 17 26 14 32 14 C39 14 44.5 18 43.5 28 C41 22 36 20 32.5 19.5 C29 21.5 24 24 20.5 28 Z" fill="${hair}"/>`
    : `<path d="M20.5 27 C19.5 16 25 12.5 32 12.5 C39.5 12.5 45 16 43.5 27 C42.5 22 40 19.5 36 19 C32 18.5 26 19 22.5 22 C21.5 23.5 21 25 20.5 27 Z" fill="${hair}"/>`;
  const collar = f
    ? `<path d="M25 46 Q32 53 39 46" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`
    : `<path d="M26.5 45 L32 53 L37.5 45 Z" fill="#fff"/><path d="M31 47.5 L33 47.5 L34 56 L32 58.5 L30 56 Z" fill="${pick(["#9f1239", "#1e3a8a", "#475569", "#0f766e"], 9)}"/>`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" fill="${bg}"/>
    ${back}
    <path d="M7 66 C9 50 20 45 32 45 C44 45 55 50 57 66 Z" fill="${suit}"/>
    ${collar}
    <rect x="27.5" y="35" width="9" height="11" rx="4" fill="${skin}"/>
    <rect x="27.5" y="37" width="9" height="4" fill="${shade}"/>
    <ellipse cx="32" cy="28" rx="11" ry="12.5" fill="${skin}"/>
    <ellipse cx="21.3" cy="29" rx="1.8" ry="2.6" fill="${skin}"/>
    <ellipse cx="42.7" cy="29" rx="1.8" ry="2.6" fill="${skin}"/>
    ${top}
    <path d="M26 25.6 Q28 24.6 30 25.4 M34 25.4 Q36 24.6 38 25.6" stroke="${hair}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="28" cy="28.6" r="1.25" fill="#1f2937"/><circle cx="36" cy="28.6" r="1.25" fill="#1f2937"/>
    <path d="M31.6 30 Q31 32.4 32.6 32.6" stroke="rgba(0,0,0,.18)" stroke-width="1" fill="none" stroke-linecap="round"/>
    <path d="M29 35 Q32 37.2 35 35" stroke="#9a4a3a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// replaces the initials avatar from core.js: people get a portrait, systems keep their badge
const avInitials = av;
av = (ini, cls = "") => {
  if (NO_FACE.has(ini) || /\b(sys|com)\b/.test(cls)) return avInitials(ini, cls);
  return `<span class="av face ${cls}">${portrait(ini)}</span>`;
};
