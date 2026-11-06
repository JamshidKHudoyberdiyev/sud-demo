// Richer scenes: documents landing in the other system, the complex-check XULOSA as in SudHR,
// and a livelier hiring finish.

// ---------------------------------------------------------------- small effects
function confetti(target, n = 42) {
  const r = target.getBoundingClientRect();
  const colors = ["#14b8a6", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"];
  for (let k = 0; k < n; k++) {
    const p = el(`<i class="confetti" style="background:${colors[k % colors.length]}"></i>`);
    document.body.appendChild(p);
    const x0 = r.left + r.width / 2, y0 = r.top + 30;
    const dx = (Math.random() - 0.5) * 520, dy = -160 - Math.random() * 220;
    const rot = (Math.random() - 0.5) * 900;
    p.animate(
      [
        { transform: `translate(${x0}px,${y0}px) rotate(0)`, opacity: 1 },
        { transform: `translate(${x0 + dx * 0.6}px,${y0 + dy}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x0 + dx}px,${y0 + 260}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: (1400 + Math.random() * 600) * Math.max(SPEED, 0.3), easing: "cubic-bezier(.2,.6,.4,1)", fill: "forwards" },
    );
    setTimeout(() => p.remove(), 2200);
  }
}

function ripple(target) {
  const s = el(`<span class="ripple"></span>`);
  target.appendChild(s);
  setTimeout(() => s.remove(), 1200);
}

// deterministic QR-like pattern for signed documents
function qrSvg(seed = "sudhr") {
  const N = 21, cells = [];
  let h = hash(seed);
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#0f172a"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0f172a"/>`;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h >> 16) & 1) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  return `<svg viewBox="-1 -1 23 23" class="qr"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#0f172a">${cells.join("")}</g>${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}</svg>`;
}

// ---------------------------------------------------------------- a document lands in another system
function flightFx({ title, sub, left, right, trav, landed }) {
  return (async () => {
    const ov = el(`<div class="pubfx flight">
      <div class="pf-title"><b>${title}</b><small>${sub}</small></div>
      <div class="pf-stage">${left}${right}</div>
      <svg class="pf-path" id="pfPath"></svg>
    </div>`);
    document.body.appendChild(ov);
    paintIcons(ov);
    await wait(30);
    ov.classList.add("on");
    await wait(650);

    const doc = $("#pfDoc", ov), slot = $("#pfSlot", ov);
    const c = (n) => {
      const r = n.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    };
    const [ax, ay] = c(doc), [sx, sy] = c(slot);
    const mid = [(ax + sx) / 2, Math.min(ay, sy) - 110];
    const svg = $("#pfPath", ov);
    svg.innerHTML = `<path d="M${ax},${ay} Q${mid[0]},${mid[1] - 60} ${sx},${sy}" />`;
    doc.classList.add("pack");
    await wait(450);
    svg.classList.add("draw");

    const w = doc.offsetWidth, h = doc.offsetHeight;
    const card = el(`<div class="pf-trav">${trav || doc.innerHTML}</div>`);
    card.style.width = w + "px";
    document.body.appendChild(card);
    doc.classList.add("sent");
    const fly2 = card.animate(
      [
        { transform: `translate(${ax - w / 2}px,${ay - h / 2}px) scale(1)` },
        { transform: `translate(${mid[0] - w / 2}px,${mid[1] - h / 2}px) scale(1.08)`, offset: 0.5 },
        { transform: `translate(${sx - w / 2}px,${sy - h / 2}px) scale(1)` },
      ],
      { duration: 1700 * SPEED, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" },
    ).finished.catch(() => {});
    await Promise.race([fly2, new Promise((r) => setTimeout(r, 1700 * SPEED + 200))]);
    card.remove();
    svg.innerHTML = "";

    slot.innerHTML = landed;
    slot.classList.add("landed");
    ripple(slot);
    const cnt = $("#pfCnt", ov);
    if (cnt) countUp(cnt, +cnt.dataset.to, { from: +cnt.textContent, dur: 500 });
    await wait(2100);
    ov.classList.remove("on");
    await wait(400);
    ov.remove();
  })();
}

const pfHrWin = (head, inner) => `<div class="pf-win pf-hr">
    <div class="pf-bar"><i></i><i></i><i></i><span>sudhr.sud.uz</span></div>
    <div class="pf-hrb"><div class="pf-side"><img src="assets/kadr.svg" alt="" /><i></i><i></i><i></i><i></i></div>
      <div class="pf-main"><small>${head}</small>${inner}</div></div>
  </div>`;
const pfVacWin = (inner) => `<div class="pf-win pf-vac">
    <div class="pf-bar"><i></i><i></i><i></i><span>vacancy.sud.uz</span></div>
    <div class="pf-vnav">VACANCY<b>SUDUZ</b></div>
    <div class="pf-vb">${inner}</div>
  </div>`;

// the announcement goes from SudHR to vacancy.sud.uz
function publishFx() {
  const V = DATA.vacancy;
  const doc = `<span class="pf-no">E'lon № ${V.no}</span><b>${esc(V.pos)}</b><em>${esc(DATA.org)}</em><span class="pf-seal">${ic("check", 11)} E-IMZO</span>`;
  return flightFx({
    title: "E'lon vacancy.sud.uz ga tushmoqda",
    sub: "SudHR → ochiq portal",
    left: pfHrWin("Tanlov · E'lonlar", `<div class="pf-doc" id="pfDoc">${doc}</div><div class="pf-ghost"></div><div class="pf-ghost"></div>`),
    right: pfVacWin(`<small><b id="pfCnt" data-to="${DATA.portalTotal + 1}">${DATA.portalTotal}</b> ta vakansiya</small>
      <div class="pf-grid"><div class="pf-slot" id="pfSlot"></div>${'<div class="pf-card"><i></i><i></i><i></i></div>'.repeat(5)}</div>`),
    landed: `<span class="pf-new">Yangi</span><span class="pf-no">E'lon № ${V.no}</span><b>${esc(V.pos)}</b><em>${esc(DATA.org)}</em>`,
  });
}

// the application goes from vacancy.sud.uz to the HR inbox in SudHR
function arizaFx() {
  const C = DATA.candidate, V = DATA.vacancy;
  const doc = `<span class="pf-no">Ariza № ${C.appNo}</span><b>${esc(C.name)}</b><em>${esc(V.pos)}</em>`;
  const n = DATA.inbox.length;
  return flightFx({
    title: "Ariza inson resurslari boshqarmasiga tushmoqda",
    sub: "vacancy.sud.uz → SudHR · Kiruvchi",
    left: pfVacWin(`<small>Ariza yuborish · ${esc(V.pos)}</small><div class="pf-doc" id="pfDoc">${doc}</div><div class="pf-ghost"></div>`),
    right: pfHrWin(`Mening hujjatlarim · Kiruvchi: <b id="pfCnt" data-to="${n + 1}">${n}</b> ta`, `<div class="pf-slot" id="pfSlot"></div><div class="pf-ghost"></div><div class="pf-ghost"></div>`),
    landed: `<span class="pf-new">Yangi</span><span class="pf-no">Ariza № ${C.appNo}</span><b>${esc(C.name)}</b><em>${esc(V.pos)}</em>`,
  });
}

{
  const elon = STEPS.find((s) => s.id === "elon");
  // the announcement goes out without an e-signature: one click publishes it
  elon.actions[1].run = async (sc) => {
    await publishFx();
    const card = $("#elonCard", sc), pill = $("#portalPill", sc);
    card.classList.add("published");
    $("#elonSt", sc).className = "tag ok pop";
    $("#elonSt", sc).innerHTML = `${ic("check", 13)} E'lon qilindi`;
    $(".card-h small", card).textContent = DATA.vacancy.no;
    pill.classList.add("lit");
    $("small", pill).textContent = "1 ta yangi e'lon";
    toast(`${DATA.vacancy.pos}: e'lon vacancy.sud.uz da`);
  };
}

// ---------------------------------------------------------------- 2. complex check as the SudHR XULOSA form
const XROWS = () => {
  const C = DATA.candidate;
  return [
    { sec: "Shaxsga oid maʼlumotlar" },
    // rows follow the official form: the Regulation on the HR-management system, annex 8
    { n: 1, t: "F.I.O.", v: C.name, photo: true },
    { n: 2, t: "Tugʻilgan joyi va sanasi", v: `Toshkent sh., ${C.birth}` },
    { n: 3, t: "Millati", v: "Oʻzbek" },
    { n: 4, t: "Oilaviy holati", v: "Oilali" },
    { n: 5, t: "Maʼlumoti (OTM, tugatgan yil, mutaxassislik)", v: "Toshkent davlat yuridik universiteti, 2019, Yurisprudensiya" },
    { n: 6, t: "Xalq deputatlari, respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning aʼzosimi?", yn: "no" },
    { n: "6.1", t: "Ha boʻlsa, qaysi partiya aʼzosi:", sub: true },
    { n: 7, t: "Umumiy staj / sud organlaridagi staj", v: `${C.exp} / —` },
    { n: 8, t: "Egallab turgan lavozimi", v: "Yurist (xususiy sektor)" },
    { n: 9, t: "Egallab turgan lavozimga tayinlangan sanasi", v: "01.09.2022" },
    { n: 10, t: "Tanlovga qadar sud organlarida ishlaganmi?", yn: "no" },
    { n: "10.1", t: "Ha boʻlsa, oxirgi lavozimi", sub: true },
    { sec: "Javobgarlikka tortilganlik holati" },
    { n: 11, t: "Jinoiy javobgarlikka tortilganmi?", yn: "no" },
    { n: "11.1", t: "Ha boʻlsa, moddasini va sudlanganlik holati olib tashlangan yoki tugatilganligini koʻrsating", sub: true },
    { n: 12, t: "Maʼmuriy javobgarlikka tortilganmi?", yn: "no" },
    { n: "12.1", t: "Ha boʻlsa, moddasini koʻrsating", sub: true },
    { n: 13, t: "Oxirgi bir yilda intizomiy javobgarlik qoʻllanilganmi?", yn: "no" },
    { n: "13.1", t: "Ha boʻlsa, buyruq rekvizitlari va xatti-harakatning qisqacha mazmuni", sub: true },
    { n: 14, t: "Korrupsion huquqbuzarlik bilan bogʻliq ishlarda ayblanuvchi sifatida ishtirok etganmi?", yn: "no" },
    { n: "14.1", t: "Ha boʻlsa, moddasini koʻrsating", sub: true },
    { sec: "Korrupsiyaga qarshi kurashish siyosati va tartib-taomillariga oid maʼlumot" },
    { n: 15, t: "Korrupsiyaga qarshi kurashishga oid qonunchilik va ichki hujjatlarning mazmun va mohiyati bilan tanishmi?", yn: "yes" },
    { n: 16, t: "Korrupsiyaga qarshi kurashish boʻyicha oʻquv mashgʻulotlarida qatnashganmi?", yn: "yes" },
    { n: 17, t: "Kelgusidagi ish faoliyati va unga doir korrupsiyaviy xavf-xatarlar bilan tanishmi?", yn: "yes" },
    { n: 18, t: "Tekshiruv davomida manfaatlar toʻqnashuvi aniqlanganmi?", yn: "no" },
    { n: 19, t: "Xodim (nomzod) oʻziga yuklatilgan vazifalarni bajarish uchun yetarli salohiyatga egami?", yn: "yes" },
    { n: 20, t: "Nomzodning korrupsiyaviy xatti-harakatlari yuzasidan maxsus aloqa kanallari yoki boshqa manbalar orqali xabarlar kelib tushganmi?", yn: "no" },
    { n: "20.1", t: "Ha boʻlsa, aniq holatni koʻrsating", sub: true },
    { n: 21, t: "Nomzodning shaxsi bilan bogʻliq korrupsiyaviy mojarolar OAV yoki internet tarmogʻida aniqlanganmi?", yn: "no" },
    { n: "21.1", t: "Ha boʻlsa, aniq holatni koʻrsating", sub: true },
    { n: 22, t: "Tekshiruv jarayonida umumiy korrupsiya xavfini oshiradigan boshqa xatarlar aniqlanganmi?", yn: "no" },
    { n: "22.1", t: "Ha boʻlsa, aniq holatni koʻrsating", sub: true },
    { n: 23, t: "Xavf darajasini kamaytirish uchun qoʻshimcha choralar koʻrish kerakmi?", yn: "no" },
    { sec: "Tekshirish natijalari" },
    { n: 24, t: "Ichki/tashqi tanlovda ishtirok etishga:", allow: true },
    { sec: "Kompleks tekshiruv oʻtkazgan xodimlar (HR va Komplaens)" },
    ...X_SIGNERS().flatMap((s, k) => [
      { n: 25 + k * 2, t: "F.I.O.", v: s.full, signer: k },
      { n: 26 + k * 2, t: "Egallab turgan lavozimi", v: s.post, signerPost: true },
    ]),
  ];
};

// the conclusion is signed by both checkers, in the form's order: HR first, then compliance
const X_SIGNERS = () => [
  { org: DATA.hr.dept, tag: "HR", name: DATA.hr.short, full: DATA.hr.name, post: DATA.hr.post, date: "30.10.2026" },
  { org: "Komplaens nazorati xizmati", tag: "Komplaens", name: "A.T.NAZAROV", full: "Nazarov Akmal Toirovich", post: "Komplaens nazorati xizmati bosh mutaxassisi", date: "30.10.2026" },
];

// the "Elektron raqamli imzo" cell beside a checker's two rows
function xSignCell(k, on) {
  const s = X_SIGNERS()[k];
  return `<td class="xsig ${on ? "on" : ""}" rowspan="2" data-xs="${k}">
    <small>Elektron raqamli imzo</small>
    <div class="x-qr ${on ? "on" : ""}" data-xqr>${qrSvg(DATA.candidate.appNo + "-" + k)}</div>
    <span class="tag ${on ? "ok" : "muted"}" data-xst>${on ? `${ic("pen", 12)} ${s.date}` : "Imzo kutilmoqda"}</span>
  </td>`;
}

function xulosaHtml(p) {
  const done = p >= 1, signed = p >= 3, C = DATA.candidate;
  const rows = XROWS().map((r, k) => {
    if (r.sec) return `<tr class="x-sec"><td colspan="4">${r.sec}</td></tr>`;
    let cell;
    if (r.yn) cell = `<span class="ck ${done && r.yn === "yes" ? "on" : ""}">Ha</span><span class="ck ${done && r.yn === "no" ? "on" : ""}">Yoʻq</span>`;
    else if (r.allow) cell = `<span class="ck ${done ? "on" : ""}">Ruxsat etiladi</span><span class="ck">Ruxsat etilmaydi</span>`;
    else if (r.sub) cell = `<span class="xv muted">—</span>`;
    else cell = `<span class="xv">${esc(r.v)}</span>`;
    const head = `<td class="xn">${r.n}</td><td class="xt">${r.t}</td>`;
    // a checker's rows leave the last column to the signature
    if (r.signer != null) return `<tr data-x="${k}" class="x-signer">${head}<td class="xc">${cell}</td>${xSignCell(r.signer, p >= 2 + r.signer)}</tr>`;
    if (r.signerPost) return `<tr data-x="${k}" class="x-signer">${head}<td class="xc">${cell}</td></tr>`;
    return `<tr data-x="${k}" class="${r.sub ? "x-subrow" : ""}">${head}<td class="xc" colspan="2">${cell}${r.photo ? `<span class="xph">${av(C.ini, "cand")}</span>` : ""}</td></tr>`;
  }).join("");
  return `<div class="cx solo">
    <div class="cx-doc ${signed ? "signed" : ""}" id="cxDoc">
      <div class="x-ilova">Sud organlarida inson resurslarini boshqarish boʻyicha<br>HR-menejment tizimi toʻgʻrisidagi nizomga 8-ilova</div>
      <div class="x-title">Xodimlarni (nomzodlarni) kompleks tekshirishdan oʻtkazish,<br>shu jumladan korrupsiyaviy xavf-xatarni aniqlash natijalari boʻyicha<br><b>XULOSA</b></div>
      <table class="x-tbl"><tbody>${rows}</tbody></table>
    </div>
  </div>`;
}

{
  const t = STEPS.find((s) => s.id === "tekshiruv");
  t.title = "Kompleks tekshiruv xulosasi";
  t.short = "Tekshiruv";
  t.lead = "Tekshiruvchi xodim xulosani tizimdagi shaklda to'ldiradi: shaxsiy ma'lumotlar arizadan tayyor turadi, bandlar tizimda belgilanadi (Nizomning 8-ilovasi). Xulosani Kadrlar boshqarmasi va Komplaens E-IMZO bilan imzolaydi.";
  t.actor = { ini: DATA.hr.ini, name: DATA.hr.short, role: DATA.hr.role, sub: DATA.hr.dept };
  t.render = xulosaHtml;
  // a signed form opens on its signature
  t.mount = (sc, p) => {
    if (p >= 2) toFormEnd(sc, "auto");
  };
  t.actions = [
    { label: "Xulosani to'ldirish", icon: "check", run: runXulosa },
    { label: "Kadrlar boshqarmasi imzosi", icon: "pen", run: (sc) => runXulosaSign(sc, 0) },
    { label: "Komplaens imzosi", icon: "pen", run: (sc) => runXulosaSign(sc, 1) },
  ];
}

// the end of the form, with its signature, in view
const toFormEnd = (sc, behavior = "smooth") => {
  const page = $(".hr-page", sc);
  if (page) page.scrollTo({ top: page.scrollHeight, behavior });
};

// the form fills itself while the page slowly moves down
async function runXulosa(sc) {
  for (const tr of $$("tr[data-x]", sc)) {
    const r = XROWS()[+tr.dataset.x];
    tr.scrollIntoView({ block: "center", behavior: "smooth" });
    tr.classList.add("flash");
    // the form is long now: answers tick quickly, empty "Ha bo'lsa" rows only blink
    if (r.yn || r.allow) {
      await wait(170);
      $$(".ck", tr)[r.allow || r.yn === "yes" ? 0 : 1].classList.add("on", "pop");
      await wait(150);
    } else await wait(r.sub ? 90 : 220);
    setTimeout(() => tr.classList.remove("flash"), 450);
  }
  toFormEnd(sc);
  await wait(600);
  toast("Xulosa to'ldirildi: to'sqinlik qiluvchi holat yo'q");
}

async function runXulosaSign(sc, k) {
  const s = X_SIGNERS()[k];
  toFormEnd(sc);
  await signFx(`${s.name} · ${s.org}`, k ? "Xulosa imzolandi" : "Kadrlar boshqarmasi imzosi qo'yildi", "Kompleks tekshiruv xulosasi tasdiqlanmoqda");
  const box = $(`[data-xs="${k}"]`, sc), qr = $("[data-xqr]", box), st = $("[data-xst]", box);
  await wait(450);
  box.classList.add("on");
  qr.classList.add("on");
  st.className = "tag ok pop";
  st.innerHTML = `${ic("pen", 12)} ${s.date}`;
  if (k === 1) $("#cxDoc", sc).classList.add("signed");
  await wait(600);
  toast(k ? "Xulosa Kadrlar boshqarmasi va Komplaens imzosi bilan tasdiqlandi" : "Kadrlar boshqarmasi imzoladi, navbat Komplaensda");
}

// ---------------------------------------------------------------- 3. a livelier hiring finish
{
  const q = STEPS.find((s) => s.id === "qabul");
  q.actions[2].run = async (sc) => {
    const C = DATA.candidate;
    const paper = $("#paper", sc), slot = $("#slot", sc);
    paper.classList.add("emit");
    await wait(450);
    await fly(paper, slot, `${av(C.ini, "md cand")}<div><b>${esc(C.name)}</b><small>${esc(DATA.vacancy.pos)}</small></div>`, "person big");
    paper.classList.remove("emit");
    slot.classList.add("busy", "land");
    ripple(slot);
    $("#slotWho", sc).innerHTML = `${av(C.ini, "sm cand")}${esc(C.short)}`;
    const st = $("#slotSt", sc);
    st.className = "tag ok pop";
    st.textContent = "Band";
    const K = DATA.hire.kpi;
    countUp($("#vacK", sc), K.vacant - 1, { from: K.vacant, dur: 700 });
    await countUp($("#busyK", sc), K.busy + 1, { from: K.busy, dur: 700 });
    await wait(200);
    const emp = $("#emp", sc);
    emp.scrollIntoView({ block: "nearest", behavior: "smooth" });
    emp.classList.add("on", "flipin");
    await wait(500);
    confetti(emp);
    const last = $('[data-fs="4"]', sc);
    last.className = "fs-n ok pop";
    $("span", last).innerHTML = ic("check", 14);
    await wait(1100);
    await bigOk("Xodim ishga qabul qilindi", `${C.name} · ${DATA.hire.org}, ${DATA.vacancy.pos.toLowerCase()}. Shtat birligi band, buyruq va xodim kartasi tayyor.`);
  };
}
