// HR inbox, complex check, hiring, result.

// ---------------------------------------------------------------- 5. HR inbox
STEPS.push({
  id: "kiruvchi",
  frame: {type: "hr",url: "docs/receive",menu: "docs",crumbs: ["Mening hujjatlarim","Kelib tushgan hujjatlar"]},
  short: "Kiruvchi",
  title: "Ariza inson resurslari boshqarmasiga tushadi",
  lead: "Kadrlar xodimi arizani tizimda ochadi: hujjatlar va talablarga muvofiqlik oldindan tekshirilgan.",
  actor: HR_ACTOR,
  actions: [
    { label: "Arizani ochish", icon: "eye", run: runInboxOpen },
    { label: "Ro'yxatga olish", icon: "stamp", run: runInboxRegister },
  ],
  render(p) {
    const C = DATA.candidate, open = p >= 1, reg = p >= 2;
    const mine = `<tr class="mine ${open ? "sel" : ""}" id="mineRow"><td>${av(C.ini, "sm cand")}<b>${esc(C.name)}</b></td><td>${esc(DATA.vacancy.pos)}</td><td>30.10.2026</td><td><span class="tag ${reg ? "ok" : "info"}" id="mineSt">${reg ? "Ro'yxatga olindi" : "Yangi"}</span></td></tr>`;
    const others = DATA.inbox.map((r) => `<tr><td>${av(r.ini, "sm")}<b>${esc(r.name)}</b></td><td>${esc(r.pos)}</td><td>${r.date}</td><td><span class="tag ${r.st === "Ro'yxatga olindi" ? "ok" : "warn"}">${r.st}</span></td></tr>`).join("");
    const checks = [
      ["Oliy yuridik ma'lumot", "Diplom OTM reyestrida tasdiqlangan"],
      ["Ish staji: 4 yil 2 oy", "Talab: kamida 1 yil"],
      ["Hujjatlar to'liq", "Obyektivka va pasport nusxasi biriktirilgan"],
      ["Muddat ichida topshirilgan", "Qabul muddati: 14.11.2026 gacha"],
    ];
    return `<div class="s5">
      <div class="card inbox">
        <div class="card-h"><div><b>Kiruvchi arizalar</b><small>${esc(DATA.org)}</small></div><span class="tag info">${ic("bell", 13)} ${reg ? 0 : 1} yangi</span></div>
        <table class="tbl"><thead><tr><th>Nomzod</th><th>Lavozim</th><th>Sana</th><th>Holat</th></tr></thead><tbody>${mine}${others}</tbody></table>
      </div>
      <div class="card appcard ${open ? "open" : ""}" id="appcard">
        <div class="ap-empty">${ic("inbox", 34)}<b>Arizani tanlang</b><small>Ariza ochilganda nomzod ma'lumotlari shu yerda chiqadi</small></div>
        <div class="ap-body">
          <div class="ap-head">${av(C.ini, "lg cand")}<div><b>${esc(C.name)}</b><small>${esc(DATA.vacancy.pos)} · ${C.appNo}</small></div></div>
          <div class="ap-sec">Talablarga muvofiqlik</div>
          ${checks.map(([t, s]) => `<div class="ap-check ${open ? "ok" : ""}">${ic("check", 15)}<div><b>${t}</b><small>${s}</small></div></div>`).join("")}
          <div class="ap-sec">Hujjatlar</div>
          <div class="ap-docs">${DATA.docs.map((d) => `<span class="chip">${ic(d.ic, 13)}${esc(d.t)}</span>`).join("")}</div>
          <div class="stamp ${reg ? "on" : ""}" id="stamp"><b>RO'YXATGA OLINDI</b><span>№ ${C.appNo} · 30.10.2026</span></div>
        </div>
      </div>
    </div>`;
  },
});

async function runInboxOpen(sc) {
  const row = $("#mineRow", sc);
  row.classList.add("press");
  await wait(400);
  row.classList.remove("press");
  row.classList.add("sel");
  $("#appcard", sc).classList.add("open");
  await wait(350);
  for (const c of $$(".ap-check", sc)) {
    c.classList.add("ok", "pop");
    await wait(260);
  }
}

async function runInboxRegister(sc) {
  $("#stamp", sc).classList.add("on");
  await wait(500);
  const st = $("#mineSt", sc);
  st.className = "tag ok pop";
  st.textContent = "Ro'yxatga olindi";
  $(".inbox .card-h .tag", sc).innerHTML = `${ic("bell", 13)} 0 yangi`;
  toast(`Ariza ro'yxatga olindi: № ${DATA.candidate.appNo}`);
  await wait(400);
}

// ---------------------------------------------------------------- 6. complex check
STEPS.push({
  id: "tekshiruv",
  frame: {type: "hr",url: "vacancy/tasks",menu: "tanlov",crumbs: ["Tanlov","Tanlov vazifalarim","Kompleks tekshiruv"]},
  short: "Tekshiruv",
  title: "Kompleks tekshiruv",
  lead: "Bir tugma bilan so'rov ketadi: sudlanganlik, dispanser hisoblari, soliq, ijro ishlari, diplom va ish tarixi bir necha soniyada keladi.",
  actor: { ini: "SH", role: "Integratsiya", name: "Davlat axborot tizimlari", tone: "sys" },
  actions: [
    { label: "So'rov yuborish", icon: "send", run: runChecks },
    { label: "Xulosani imzolash", icon: "pen", run: runCheckSign },
  ],
  render(p) {
    const C = DATA.candidate, done = p >= 1, signed = p >= 2;
    const node = (c, k) => `<div class="node ${done ? "ok" : ""}" data-n="${k}">
        <span class="n-ic">${ic(c.ic, 18)}</span>
        <div><small>${esc(c.sys)}</small><b>${esc(c.t)}</b></div>
        <span class="n-r">${done ? `${ic("check", 13)}${esc(c.r)}` : "Kutilmoqda"}</span>
      </div>`;
    const L = DATA.checks.slice(0, 4), R = DATA.checks.slice(4);
    return `<div class="s6">
      <svg class="wires" id="s6w"></svg>
      <div class="ncol">${L.map((c, k) => node(c, k)).join("")}</div>
      <div class="center6">
        <div class="hub big ${done ? "ok" : ""}" id="hub6"><i class="rg g1"></i><i class="rg g2"></i><i class="rg g3"></i><span class="orb">${av(C.ini, "xl cand")}</span></div>
        <b class="hub-t">${esc(C.name)}</b>
        <small class="hub-s">${C.pin}</small>
        <div class="prog"><div class="pb"><i id="p6" style="width:${done ? 100 : 0}%"></i></div><b id="p6t">${done ? 100 : 0}%</b></div>
      </div>
      <div class="ncol">${R.map((c, k) => node(c, k + 4)).join("")}</div>
      <div class="verdict ${done ? "on" : ""} ${signed ? "signed" : ""}" id="verdict">
        <span class="v-ic">${ic("badge", 24)}</span>
        <div><b>Xulosa: to'sqinlik qiluvchi holat aniqlanmadi</b><small>9 ta tizimdan 9 tasi javob berdi · natija nomzod kartasiga yozildi</small></div>
        <span class="tag ${signed ? "ok" : "muted"}" id="vSt">${signed ? `${ic("pen", 12)} E-IMZO bilan imzolandi` : "Imzo kutilmoqda"}</span>
      </div>
    </div>`;
  },
  mount(sc, p) {
    const svg = $("#s6w", sc);
    if (!svg) return;
    svg.innerHTML = "";
    $$(".node", sc).forEach((n) => {
      const w = wire(svg, $("#hub6", sc), n, p >= 1 ? "done" : "");
      w.dataset.w = n.dataset.n;
    });
  },
});

async function runChecks(sc) {
  const hub = $("#hub6", sc);
  hub.classList.add("spin");
  const total = DATA.checks.length;
  let n = 0;
  const one = async (c, k) => {
    await wait(k * 260);
    const w = $(`path[data-w="${k}"]`, sc), node = $(`[data-n="${k}"]`, sc);
    w.classList.add("live");
    node.classList.add("busy");
    $(".n-r", node).innerHTML = `<i class="mini-spin"></i>So'rov…`;
    await wait(700 + (k % 3) * 220);
    node.classList.remove("busy");
    node.classList.add("ok", "pop");
    $(".n-r", node).innerHTML = `${ic("check", 13)}${esc(c.r)}`;
    w.classList.replace("live", "done");
    n++;
    $("#p6", sc).style.width = (n / total) * 100 + "%";
    $("#p6t", sc).textContent = Math.round((n / total) * 100) + "%";
  };
  await Promise.all(DATA.checks.map(one));
  hub.classList.remove("spin");
  hub.classList.add("ok");
  await wait(300);
  $("#verdict", sc).classList.add("on");
  await wait(500);
}

async function runCheckSign(sc) {
  await signFx(`${DATA.hr.name} · Inson resurslari boshqarmasi`, "Xulosa imzolandi", "Kompleks tekshiruv xulosasi tasdiqlanmoqda");
  $("#verdict", sc).classList.add("signed");
  const st = $("#vSt", sc);
  st.className = "tag ok pop";
  st.innerHTML = `${ic("pen", 12)} E-IMZO bilan imzolandi`;
}

// ---------------------------------------------------------------- 8. hiring
STEPS.push({
  id: "qabul",
  frame: {type: "hr",url: "employee/recruitment-office",menu: "xodimlar",crumbs: ["Xodimlar","Ishga qabul qilish"]},
  short: "Ishga qabul",
  title: "Buyruq va ishga qabul",
  lead: "Buyruq ariza va tanlov natijasidan avtomatik tuziladi, imzolanadi, shtat birligi band bo'ladi va xodim kartasi ochiladi.",
  // the regional court hires: its own personnel department draws up the order and fills the position
  actor: { ini: DATA2.regionHr.ini, role: `${DATA.hire.org} · ${DATA.hire.hrDept}`, name: DATA2.regionHr.name },
  actions: [
    { label: "Buyruq loyihasini tuzish", icon: "file", run: runOrderDraft },
    { label: "Imzolash (E-IMZO)", icon: "pen", run: runOrderSign },
    { label: "Shtatga biriktirish", icon: "users", run: runAssign },
  ],
  render(p) {
    const D = DATA, C = D.candidate, O = D.order, V = D.vacancy, H = D.hire;
    const drafted = p >= 1, signed = p >= 2, hired = p >= 3;
    const body = orderText();
    const path = ["Yuborildi", "Ro'yxatga olish", "Kompleks tekshiruv", "Kelishuv (zarur bo'lsa)", "Ishga qabul"];
    return `<div class="s8">
      <div class="flow-st">${path.map((t, k) => `<div class="fs-n ${k < 4 || hired ? "ok" : "cur"}" data-fs="${k}"><span>${k < 4 || hired ? ic("check", 14) : k + 1}</span><small>${t}</small></div>`).join('<i class="fs-l"></i>')}</div>
      <div class="paper ${signed ? "signed" : ""}" id="paper">
        <div class="pp-h"><small>${esc(H.org).toUpperCase()}</small><b>BUYRUQ</b><span>№ ${O.no} · ${O.date}</span></div>
        <div class="pp-sub">Ishga qabul qilish to'g'risida</div>
        ${body.map((t, k) => `<p class="pp-p" data-p="${k}">${drafted ? t : `<span class="skel w100"></span><span class="skel w70"></span>`}</p>`).join("")}
        <div class="pp-sign"><div><b>Sud raisi</b></div>
          <div class="seal qr-seal ${signed ? "on" : ""}" id="seal">${qrSvg(O.no)}<small>E-IMZO · ${O.date}</small></div></div>
      </div>
      <div class="s8-r">
        <div class="card slot ${hired ? "busy" : ""}" id="slot">
          <div class="card-h"><div><b>Shtat birligi</b><small>${esc(H.org)} · ${esc(H.dept)}</small></div><span class="tag ${hired ? "ok" : "warn"}" id="slotSt">${hired ? "Band" : "Bo'sh"}</span></div>
          <div class="slot-row"><span>${ic("briefcase", 16)}</span><b>${esc(V.pos)}</b><span class="slot-who" id="slotWho">${hired ? `${av(C.ini, "sm cand")}${esc(C.short)}` : `<span class="muted">Bo'sh</span>`}</span></div>
          <div class="slot-kpi"><div><small>Bo'sh ish o'rinlari</small><b id="vacK">${hired ? H.kpi.vacant - 1 : H.kpi.vacant}</b></div><div><small>Band shtatlar</small><b id="busyK">${hired ? H.kpi.busy + 1 : H.kpi.busy}</b></div></div>
        </div>
        <div class="card emp ${hired ? "on" : ""}" id="emp">
          <div class="emp-top">${av(C.ini, "lg cand")}<div><span class="tag ok">${ic("check", 12)} Faol xodim</span><b>${esc(C.name)}</b><small>${esc(V.pos)}</small></div></div>
          <div class="emp-grid">
            <div><small>Tabel raqami</small><b>${O.tabel}</b></div>
            <div><small>Ishga kirgan sana</small><b>${O.start}</b></div>
            <div><small>Tashkilot</small><b>${esc(H.org)}</b></div>
            <div><small>Bo'lim</small><b>${esc(H.dept)}</b></div>
            <div><small>Asos</small><b>Buyruq № ${O.no}</b></div>
          </div>
          <div class="emp-orders"><small>Xodim buyruqlari</small><div class="eo">${ic("file", 14)}<b>№ ${O.no}</b><span>Ishga qabul qilish to'g'risida</span><em>${O.date}</em></div></div>
          <div class="emp-foot">${ic("layers", 14)} Xodim kartasi: shaxsiy ma'lumot, tekshiruv xulosasi va hujjatlar bilan</div>
        </div>
      </div>
    </div>`;
  },
});

function orderText() {
  const D = DATA, C = D.candidate, V = D.vacancy, O = D.order, H = D.hire;
  return [
    `1. <mark>${esc(C.name)}</mark> ${O.start}dan ${esc(H.org)} ${esc(H.dept.toLowerCase())}siga <mark>${esc(V.pos.toLowerCase())}</mark> lavozimiga tanlov natijalariga ko'ra ishga qabul qilinsin.`,
    `2. ${esc(H.hrDept)} xodimning shaxsiy ishini rasmiylashtirsin va uni lavozim yo'riqnomasi bilan tanishtirsin.`,
    `Asos: kompleks tekshiruv xulosasi, ${esc(C.short)}ning <mark>${C.appNo}</mark> raqamli arizasi.`,
  ];
}

async function runOrderDraft(sc) {
  const body = orderText();
  for (const [k, t] of body.entries()) {
    const p = $(`[data-p="${k}"]`, sc);
    p.classList.add("on");
    const plain = t.replace(/<[^>]+>/g, "");
    p.textContent = "";
    await typeIn(p, plain, 220);
    p.innerHTML = t;
    p.classList.remove("on");
    await wait(120);
  }
  toast("Buyruq loyihasi ariza va tanlov natijasidan tuzildi");
}

async function runOrderSign(sc) {
  await signFx(`${DATA.hire.org} · Sud raisi`, "Buyruq imzolandi", `Buyruq № ${DATA.order.no} tasdiqlanmoqda`);
  $("#seal", sc).classList.add("on");
  $("#paper", sc).classList.add("signed");
  await wait(500);
}

async function runAssign(sc) {
  const C = DATA.candidate;
  await fly($("#paper", sc), $("#slot", sc), `${av(C.ini, "sm cand")} ${esc(C.short)}`, "person");
  const slot = $("#slot", sc);
  slot.classList.add("busy", "flip");
  $("#slotWho", sc).innerHTML = `${av(C.ini, "sm cand")}${esc(C.short)}`;
  const st = $("#slotSt", sc);
  st.className = "tag ok pop";
  st.textContent = "Band";
  const K = DATA.hire.kpi;
  countUp($("#vacK", sc), K.vacant - 1, { from: K.vacant, dur: 600 });
  await countUp($("#busyK", sc), K.busy + 1, { from: K.busy, dur: 600 });
  await wait(250);
  $("#emp", sc).classList.add("on");
  const last = $('[data-fs="4"]', sc);
  last.className = "fs-n ok pop";
  $("span", last).innerHTML = ic("check", 14);
  await wait(700);
  await bigOk("Xodim ishga qabul qilindi", `${C.name} · ${DATA.vacancy.pos}. Shtat birligi band, xodim kartasi ochildi.`);
}

// ---------------------------------------------------------------- 9. result
STEPS.push({
  id: "natija",
  short: "Natija",
  title: "Butun jarayon — bitta tizimda",
  lead: "Bo'sh o'rindan buyruqgacha: har bosqich elektron, har bir harakat izi va imzosi bilan saqlanadi.",
  actor: null,
  actions: [{ label: "Jarayonni ko'rsatish", icon: "play", run: runResult }],
  render(p) {
    const done = p >= 1;
    const tl = [
      ["search", "Bo'sh o'rin", "Shtat jadvalidan"],
      ["file", "E'lon", "Avto to'ldirish + imzo"],
      ["globe", "vacancy.sud.uz", "Ochiq portal"],
      ["user", "Ariza", "OneID, hujjatlar tizimdan"],
      ["inbox", "Inson resurslari boshqarmasi", "Muvofiqlik tekshiruvi"],
      ["shield", "Kompleks tekshiruv", "Xulosa tizimda, E-IMZO"],
      ["clipboard", "Tanlov", "(suhbat va test)"],
      ["briefcase", "Ishga qabul", "Buyruq, shtat, xodim kartasi"],
    ];
    const stats = [
      ["layers", 8, "bosqich bitta tizimda"],
      ["link", 8, "davlat tizimi bilan integratsiya"],
      ["file", 4, "hujjat avtomatik tuziladi"],
      ["pen", 3, "bosqichda elektron imzo"],
    ];
    return `<div class="s9">
      <div class="tl ${done ? "on" : ""}" id="tl">
        <div class="tl-line"><i id="tlFill" style="width:${done ? 100 : 0}%"></i></div>
        ${tl.map(([i, t, s], k) => `<div class="tl-n ${done ? "on" : ""}" data-t="${k}"><span class="tl-ic">${ic(i, 20)}</span><b>${t}</b><small>${s}</small></div>`).join("")}
      </div>
      <div class="stats">${stats.map(([i, v, t], k) => `<div class="card stat ${done ? "on" : ""}" data-s="${k}"><span class="stat-ic">${ic(i, 22)}</span><b data-v="${v}">${done ? v : 0}</b><small>${t}</small></div>`).join("")}</div>
      <div class="next-ch ${done ? "on" : ""}" id="nextCh" data-go="${STEPS.findIndex((s) => s.ch === 2)}">
        <span class="nc-ic">${ic("arrow-right", 20)}</span>
        <div><small>2-qism · Respublika nazorati</small><b>Viloyat kadri imkoniyatlari · SMART karta · integratsiyalar · nazorat · xodimlar reytingi</b></div>
        <span class="nc-go">Boshlash ${ic("arrow-right", 16)}</span>
      </div>
    </div>`;
  },
});

async function runResult(sc) {
  const nodes = $$(".tl-n", sc);
  for (const [k, n] of nodes.entries()) {
    n.classList.add("on");
    $("#tlFill", sc).style.width = (k / (nodes.length - 1)) * 100 + "%";
    await wait(260);
  }
  for (const s of $$(".stat", sc)) {
    s.classList.add("on");
    const b = $("b", s);
    countUp(b, +b.dataset.v, { dur: 700 });
    await wait(180);
  }
  await wait(400);
  $("#nextCh", sc).classList.add("on");
}
