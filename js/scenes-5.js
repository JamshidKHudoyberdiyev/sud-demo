// Additions: dashboard after login, attendance rating, live data fill in integrations, step order.

// ---------------------------------------------------------------- dashboard shown right after the ERI login
const DASH = {
  kpi: [
    ["Umumiy shtatlar", 250, "briefcase", "t-teal", "Shtat jadvali bo'yicha"],
    ["Band bo'lgan shtatlar", 242, "check", "t-teal", "Shtatlarning 97% band"],
    ["Bo'sh ish o'rni", 8, "user", "t-amber", "Shtatlarning 3% bo'sh"],
    ["Asosiy va o'rindosh xodimlar", 242, "users", "t-blue", "Erkaklar: 178 · Ayollar: 64"],
    ["Ta'tildagi xodimlar", 11, "calendar", "t-violet", "Bugungi holat"],
    ["Ochiq e'lonlar", 5, "globe", "t-blue", "vacancy.sud.uz da"],
  ],
  bars: [["Bo'sh ish o'rni", 8, "#f5a623"], ["Umumiy shtatlar", 250, "#4f86e8"], ["Band shtatlar", 242, "#2f9a8a"]],
  age: [["18-25", 21], ["25-40", 121], ["40-60", 88], ["60+", 12]],
};

function dashHtml(grown) {
  const max = 250;
  const vbar = (v, m, color) => `<i style="--h:${(v / m) * 100}%;background:${color};height:${grown ? (v / m) * 100 : 0}%"></i>`;
  return `<div class="dash">
    <div class="hp-h"><h2>Kadrlar tarkibi</h2><small>${esc(DATA.org)} · shtatlar, xodimlar va ularning tarkibi bo'yicha umumiy ko'rsatkichlar</small></div>
    <div class="dash-kpis">${DASH.kpi.map(([t, v, i, tone, f], k) => `<div class="dash-kpi" style="--i:${k}"><div class="dk-h"><small>${t}</small><span class="dk-ic ${tone}">${ic(i, 17)}</span></div><b data-v="${v}">${grown ? v : 0}</b><em>${f}</em></div>`).join("")}</div>
    <div class="dash-charts">
      <div class="dash-c" style="--i:6"><div class="dc-h"><span class="dk-ic t-teal">${ic("briefcase", 15)}</span><b>Shtatlar va vakantlar</b></div>
        <div class="vbars">${DASH.bars.map(([t, v, c]) => `<div class="vb"><div class="vb-col">${vbar(v, max, c)}</div><b>${v}</b><small>${t}</small></div>`).join("")}</div></div>
      <div class="dash-c" style="--i:7"><div class="dc-h"><span class="dk-ic t-blue">${ic("users", 15)}</span><b>Erkaklar va ayollar</b></div>
        <div class="hbars"><div class="hb"><small>Erkaklar</small><div><i style="--w:${(178 / 242) * 100}%;width:${grown ? (178 / 242) * 100 : 0}%;background:#4f86e8"></i></div><b>178</b></div>
        <div class="hb"><small>Ayollar</small><div><i style="--w:${(64 / 242) * 100}%;width:${grown ? (64 / 242) * 100 : 0}%;background:#8b5cf6"></i></div><b>64</b></div></div></div>
      <div class="dash-c" style="--i:8"><div class="dc-h"><span class="dk-ic t-teal">${ic("calendar", 15)}</span><b>Yosh bo'yicha</b></div>
        <div class="vbars age">${DASH.age.map(([t, v]) => `<div class="vb"><div class="vb-col">${vbar(v, 121, "#2f9a8a")}</div><b>${v}</b><small>${t}</small></div>`).join("")}</div></div>
    </div>
  </div>`;
}

{
  const login = STEPS.find((s) => s.id === "login");
  const loginRender = login.render;
  login.frame = (p) => (p >= 1 ? { type: "hr", url: "dashboard", menu: "", crumbs: [] } : null);
  login.render = (p) => (p >= 1 ? dashHtml(true) : loginRender(p));
  login.lead = "Kadrlar xodimi ERI kaliti bilan kiradi. Kirgan zahoti bosh sahifada shtat, bo'sh o'rinlar va xodimlar tarkibi tayyor turadi.";
  const loginRun = login.actions[0].run;
  login.actions[0].run = async (sc) => {
    await loginRun(sc);
    // the login page gives way to the system: sidebar slides in, cards and charts come up
    sc.className = "scene framed";
    sc.innerHTML = framed(login.frame(1), dashHtml(false));
    paintIcons(sc);
    fitScene(sc, login, true);
    const app = $(".app", sc);
    app.classList.add("boot");
    await wait(700);
    $$(".dash-kpi b", sc).forEach((b, k) => setTimeout(() => countUp(b, +b.dataset.v, { dur: 900 }), k * 80 * SPEED));
    await wait(900);
    $$(".vb-col i", sc).forEach((i) => (i.style.height = i.style.getPropertyValue("--h")));
    $$(".hb i", sc).forEach((i) => (i.style.width = i.style.getPropertyValue("--w")));
    await wait(1200);
  };
}

// ---------------------------------------------------------------- attendance rating: regions and own departments
const DEPTS = [
  ["Inson resurslari boshqarmasi", 98.6],
  ["Axborot tizimlarini ishlab chiqish bo'limi", 97.9],
  ["Xalqaro-huquqiy aloqalar bo'limi", 97.3],
  ["Devonxona", 96.8],
  ["Buxgalteriya", 96.1],
  ["Murojaatlar bilan ishlash boshqarmasi", 95.4],
  ["Xo'jalik bo'limi", 93.7],
];
const CENTRAL_ACTOR = { ini: DATA2.centralHr.ini, role: DATA2.centralHr.role, name: DATA2.centralHr.name };

STEPS.push({
  id: "dreyting",
  ch: 2,
  short: "Davomat reytingi",
  title: "Davomat reytingi: hududlar va bo'limlar",
  lead: "Turniket ma'lumotidan har kuni reyting tuziladi: respublika kadri hududlarni, har bir kadr esa o'z tashkilotidagi bo'limlarni solishtiradi.",
  actor: CENTRAL_ACTOR,
  frame: { type: "hr", url: "turniket/rating", menu: "turniket", crumbs: ["Turniket", "Davomat reytingi"], user: DATA2.centralHr },
  actions: [
    { label: "Hududlar reytingini tuzish", icon: "chart", run: runRegionRating },
    { label: "Bo'limlar reytingini ko'rish", icon: "layers", run: runDeptRating },
  ],
  render(p) {
    const R = DATA2.regions.map((r) => [r[0], r[3]]);
    const sorted = p >= 1 ? R.slice().sort((a, b) => b[1] - a[1]) : R;
    const row = ([n, v], k, n0, on, total) => {
      const cls = on ? (k < 3 ? "gold" : k >= total - 2 ? "low" : "") : "";
      return `<div class="rr ${cls}" data-n="${esc(n)}"><span class="rr-k">${on ? k + 1 : ""}</span><b>${esc(n)}</b><div class="rr-bar"><i style="--w:${(v - n0) / (100 - n0) * 100}%;width:${on ? ((v - n0) / (100 - n0)) * 100 : 0}%"></i></div><span class="rr-v">${on ? fmt(v, 1) + "%" : "—"}</span></div>`;
    };
    const dOn = p >= 2;
    return `<div class="s17">
      <div class="card rr-card">
        <div class="card-h"><div><b>Hududlar bo'yicha davomat</b><small>Oktabr · ish kunlari o'rtachasi</small></div><span class="tag info">14 hudud</span></div>
        <div class="rr-list" id="rrReg">${sorted.map((r, k) => row(r, k, 90, p >= 1, R.length)).join("")}</div>
      </div>
      <div class="card rr-card ${dOn ? "" : "dim"}" id="deptCard">
        <div class="card-h"><div><b>Bo'limlar bo'yicha</b><small>O'zbekiston Respublikasi Oliy sudi · har bir kadr o'z tashkilotini ko'radi</small></div><span class="tag muted">${DEPTS.length} bo'lim</span></div>
        <div class="rr-list" id="rrDept">${DEPTS.map((d, k) => row(d, k, 90, dOn, DEPTS.length)).join("")}</div>
      </div>
    </div>`;
  },
});

async function runRegionRating(sc) {
  const list = $("#rrReg", sc);
  const rows = $$(".rr", list);
  for (const r of rows) {
    const i = $(".rr-bar i", r);
    i.style.width = i.style.getPropertyValue("--w");
    const v = DATA2.regions.find((x) => x[0] === r.dataset.n)[3];
    countUp($(".rr-v", r), v, { from: 90, dur: 700, dec: 1, suffix: "%" });
    await wait(60);
  }
  await wait(900);
  // FLIP into rank order
  const first = new Map(rows.map((r) => [r, r.getBoundingClientRect()]));
  const val = (r) => DATA2.regions.find((x) => x[0] === r.dataset.n)[3];
  const sorted = rows.slice().sort((a, b) => val(b) - val(a));
  sorted.forEach((r) => list.appendChild(r));
  sorted.forEach((r, k) => {
    const a = first.get(r), b = r.getBoundingClientRect();
    r.animate([{ transform: `translateY(${(a.top - b.top) / ZOOM}px)` }, { transform: "none" }], { duration: 700 * SPEED, easing: "cubic-bezier(.3,.8,.3,1)" });
    $(".rr-k", r).textContent = k + 1;
    if (k < 3) r.classList.add("gold");
    if (k >= sorted.length - 2) r.classList.add("low");
  });
  await wait(800);
  toast("Eng yuqori davomat: " + sorted[0].dataset.n);
}

async function runDeptRating(sc) {
  const card = $("#deptCard", sc);
  card.classList.remove("dim");
  const rows = $$(".rr", card);
  for (const [k, r] of rows.entries()) {
    const i = $(".rr-bar i", r);
    i.style.width = i.style.getPropertyValue("--w");
    countUp($(".rr-v", r), DEPTS[k][1], { from: 90, dur: 700, dec: 1, suffix: "%" });
    $(".rr-k", r).textContent = k + 1;
    if (k < 3) r.classList.add("gold");
    if (k >= rows.length - 2) r.classList.add("low");
    await wait(140);
  }
  await wait(600);
}

// ---------------------------------------------------------------- integrations: an employee's data arrives system by system
const FEED = [
  [0, "Pasport", "AD 1234567"],
  [3, "Sudlanganlik", "Mavjud emas"],
  [7, "STIR", "512 345 678"],
  [10, "Oilaviy holati", "Oilali, 1 farzand"],
  [11, "Ish staji", "4 yil 2 oy"],
  [12, "Diplom", "TDYU, 2019"],
  [9, "Ko'chmas mulk", "Mavjud emas"],
  [8, "Nafaqa", "Olmaydi"],
];
{
  const integ = STEPS.find((s) => s.id === "integ");
  const r0 = integ.render;
  integ.render = (p) => {
    const C = DATA.candidate;
    const html = r0(p);
    const filled = p >= 2;
    const feed = `<div class="card feed ${p >= 2 ? "on" : ""}" id="feed">
      <div class="fd-h">${av(C.ini, "md cand")}<div><b>${esc(C.name)}</b><small>Xodim kartasi · tizimlardan</small></div></div>
      ${FEED.map(([n, t, v], k) => `<div class="fd-row ${filled ? "ok" : ""}" data-f="${k}"><span class="fd-src">${esc(DATA2.systems[n].t)}</span><span class="fd-t">${t}</span><b>${filled ? esc(v) : `<span class="skel w60"></span>`}</b></div>`).join("")}
    </div>`;
    return html.replace(`<div class="card legend">`, `${feed}<div class="card legend ${p >= 2 ? "hide" : ""}">`);
  };
  integ.actions.push({ label: "Xodim ma'lumotini olish", icon: "user", run: runFeed });
  integ.lead = "Kadr ma'lumoti qo'lda kiritilmaydi: tizim kerakli manbadan o'zi so'raydi va xodim kartasini to'ldiradi. Bitta platforma — 16 ta tizim bilan almashinuv.";
}

async function runFeed(sc) {
  const legend = $(".legend", sc), feed = $("#feed", sc);
  legend.classList.add("hide");
  feed.classList.add("on");
  await wait(400);
  for (const [k, [n, , v]] of FEED.entries()) {
    const node = $(`.on-node[data-n="${n}"]`, sc), row = $(`[data-f="${k}"]`, sc);
    node.classList.add("ping");
    $(`line[data-n="${n}"]`, sc).classList.add("hot");
    await fly(node, row, ic("check", 12), "dot");
    node.classList.remove("ping");
    $(`line[data-n="${n}"]`, sc).classList.remove("hot");
    row.classList.add("on");
    await typeIn($("b", row), v, 90);
    row.classList.remove("on");
    row.classList.add("ok");
  }
  toast("Xodim kartasi 8 ta tizimdan to'ldirildi");
}

// ---------------------------------------------------------------- chapter 2 is told from the republic HR's seat
{
  CHAPTERS[1].t = "Respublika nazorati";
  const set = (id, o) => Object.assign(STEPS.find((s) => s.id === id), o);
  const cf = (id) => {
    const s = STEPS.find((x) => x.id === id);
    if (s.frame && typeof s.frame === "object") s.frame = { ...s.frame, user: DATA2.centralHr };
  };
  ["region", "smart", "davomat"].forEach(cf);
  set("respublika", { short: "Respublika", title: "Respublika kadri: 14 hudud bir qarashda" });
  set("region", {
    actor: CENTRAL_ACTOR,
    short: "Viloyatga kirish",
    title: "Viloyatni ochish: har bir sud ko'rinadi",
    lead: "Respublika kadri istalgan viloyatni ochib, undagi har bir sudning shtati, bo'sh o'rinlari va e'lonlarini ko'radi.",
  });
  set("davomat", { actor: CENTRAL_ACTOR, lead: "Viloyatdagi har bir sudning turniket qaydlari markazga tushadi: kech qolgan, sababli yo'q va aniqlashtirish kerak bo'lganlar alohida ko'rinadi." });
  set("smart", {
    actor: CENTRAL_ACTOR,
    short: "SMART karta",
    lead: "Ishlab chiqilmoqda: xodim bir qidiruvda topiladi, SMART kartada uning davlat bazalaridagi barcha ma'lumoti bir sahifada.",
  });
  set("reyting", { title: "Eng yaxshi xodimlar: respublika va tizim bo'yicha" });

  const ORDER = ["login", "vacant", "elon", "portal", "ariza", "kiruvchi", "tekshiruv", "qabul", "natija",
    "respublika", "region", "davomat", "dreyting", "integ", "smart", "reyting", "yakun"];
  STEPS.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
}
