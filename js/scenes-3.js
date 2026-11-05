// Chapter 2, steps 1-3: the regional HR dashboard, employee search + SMART card, integrations.
const REG_ACTOR = { ini: DATA2.regionHr.ini, role: DATA2.regionHr.role, name: DATA2.regionHr.name };
const pct = (a, b) => (b ? (a / b) * 100 : 0);

// ---------------------------------------------------------------- 2.1 region dashboard
STEPS.push({
  id: "region",
  frame: {type: "hr",url: "dashboard/region",menu: "boshqarish",crumbs: ["Boshqarish","Viloyat kesimida"]},
  ch: 2,
  short: "Viloyat paneli",
  title: "Viloyat kadri: barcha sudlar bitta ekranda",
  lead: "Viloyat kadrlar bo'limi o'z hududidagi har bir sudning shtati, bo'sh o'rinlari va e'lonlarini real vaqtda ko'radi.",
  actor: REG_ACTOR,
  actions: [
    { label: "Viloyat ma'lumotlarini yig'ish", icon: "layers", run: runRegionCollect },
    { label: "Eng ko'p bo'sh o'rinli sudni ochish", icon: "eye", run: runRegionDrill },
  ],
  render(p) {
    const C = DATA2.courts, got = p >= 1, open = p >= 2;
    const tot = C.reduce((a, c) => [a[0] + c[1], a[1] + c[2], a[2] + c[3]], [0, 0, 0]);
    const kpi = [
      ["staff", "Sudlar shtati", tot[0], "users", ""],
      ["filled", "Band", tot[1], "check", "ok"],
      ["vac", "Bo'sh ish o'rni", tot[0] - tot[1], "alert", "warn"],
      ["ann", "Ochiq e'lonlar", tot[2], "globe", "info"],
    ];
    const rows = C.map(([n, s, f, a], k) => {
      const v = s - f, fp = pct(f, s);
      const target = n === DATA2.drill.court;
      return `<tr data-c="${k}" class="${got && target ? "target" : ""} ${open && target ? "sel" : ""}">
        <td><span class="ct-ic">${ic("building", 15)}</span><b>${esc(n)}</b></td>
        <td class="num">${got ? s : `<span class="skel w30"></span>`}</td>
        <td class="num">${got ? f : `<span class="skel w30"></span>`}</td>
        <td class="num">${got ? `<span class="tag ${v >= 4 ? "warn" : v ? "muted" : "ok"}">${v}</span>` : `<span class="skel w30"></span>`}</td>
        <td><div class="fillbar ${fp < 88 ? "low" : ""}"><i style="width:${got ? fp : 0}%"></i></div></td>
        <td class="num pc">${got ? fmt(fp, 1) + "%" : ""}</td>
      </tr>`;
    }).join("");
    const D = DATA2.drill;
    const dc = C.find((c) => c[0] === D.court);
    return `<div class="s10">
      <div class="kpis">${kpi.map(([k, t, v, i, tone]) => `<div class="kpi ${tone}" data-k="${k}"><div class="kpi-ic">${ic(i, 20)}</div><small>${t}</small><b data-v="${v}">${got ? fmt(v) : "—"}</b></div>`).join("")}</div>
      <div class="s10-grid ${open ? "open" : ""}" id="s10g">
        <div class="card courts">
          <div class="card-h"><div><b>${DATA2.region} sudlari</b><small>${C.length} ta sud · shtat jadvallari bo'yicha</small></div><span class="tag info">${ic("clock", 12)} Real vaqtda</span></div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sud</th><th class="num">Shtat</th><th class="num">Band</th><th class="num">Bo'sh</th><th>To'ldirilganlik</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>
        <aside class="card drill">
          <div class="card-h"><div><b>${esc(D.court)}</b><small>Bo'sh lavozimlar · ${D.vacant.length} ta</small></div><span class="tag warn">${fmt(pct(dc[2], dc[1]), 1)}%</span></div>
          ${D.vacant.map((v) => `<div class="dv"><span class="dv-ic">${ic("briefcase", 16)}</span><div><b>${esc(v.pos)}</b><small>${esc(v.dept)} · ${v.days} kundan beri bo'sh</small></div><span class="tag ${v.days > 30 ? "warn" : "muted"}">${v.days > 30 ? "E'lon yo'q" : "Yangi"}</span></div>`).join("")}
          <div class="dv-act">${ic("sparkles", 15)} Viloyat kadri sudga topshiriq beradi yoki e'lonni o'zi joylashtiradi — 1-qismdagi jarayon</div>
        </aside>
      </div>
    </div>`;
  },
});

async function runRegionCollect(sc) {
  const C = DATA2.courts;
  for (const [k, [, s, f]] of C.entries()) {
    const tr = $(`[data-c="${k}"]`, sc);
    tr.classList.add("scan");
    const tds = $$("td", tr);
    tds[1].textContent = s;
    tds[2].textContent = f;
    const v = s - f;
    tds[3].innerHTML = `<span class="tag ${v >= 4 ? "warn" : v ? "muted" : "ok"} pop">${v}</span>`;
    $(".fillbar i", tr).style.width = pct(f, s) + "%";
    tds[5].textContent = fmt(pct(f, s), 1) + "%";
    await wait(180);
    tr.classList.remove("scan");
  }
  await Promise.all($$(".kpi b", sc).map((b) => countUp(b, +b.dataset.v, { dur: 700 })));
  const t = $$("tr[data-c]", sc).find((tr) => C[+tr.dataset.c][0] === DATA2.drill.court);
  t.classList.add("target");
  toast(`Eng past to'ldirilganlik: ${DATA2.drill.court}`);
}

async function runRegionDrill(sc) {
  const t = $("tr.target", sc);
  t.classList.add("press");
  await wait(350);
  t.classList.remove("press");
  t.classList.add("sel");
  $("#s10g", sc).classList.add("open");
  await wait(500);
}

// ---------------------------------------------------------------- 2.2 search + SMART card
STEPS.push({
  id: "smart",
  frame: {type: "hr",url: "employee/smart-card",menu: "xodimlar",crumbs: ["Xodimlar","SMART varaqa"]},
  ch: 2,
  short: "SMART karta",
  title: "Xodimni topish va SMART karta",
  lead: "Viloyatdagi istalgan xodim bir qidiruvda topiladi. SMART kartada uning davlat bazalaridagi barcha ma'lumoti bir sahifada.",
  actor: REG_ACTOR,
  actions: [
    { label: "Xodimni qidirish", icon: "search", run: runSmartSearch },
    { label: "SMART kartani ochish", icon: "shield", run: runSmartOpen },
  ],
  render(p) {
    const found = p >= 1, open = p >= 2, C = DATA.candidate, M = DATA2.smart;
    const res = DATA2.search.map((r, k) => `<div class="sr ${r.me ? "me" : ""} ${open && r.me ? "sel" : ""}" data-r="${k}">${av(r.ini, "md " + (r.me ? "cand" : ""))}<div><b>${esc(r.name)}</b><small>${esc(r.pos)} · ${esc(r.court)}</small></div>${ic("arrow-right", 16)}</div>`).join("");
    const ring = (title, val, parts, cls) => `<div class="sm-g" data-g="${cls}">
        <div class="sm-gt">${title}</div>
        <div class="sm-ring"><svg viewBox="0 0 120 120"><circle class="bgc" cx="60" cy="60" r="50"/><circle class="fgc" cx="60" cy="60" r="50" style="stroke-dasharray:${open ? 2 * Math.PI * 50 : 0} ${2 * Math.PI * 50}"/></svg><b>${open ? val : 0}%</b></div>
        <span class="sm-state">Yaxshi holatda</span>
        <ul>${parts.map(([l, v]) => `<li><span>${l}</span><b>${v}</b></li>`).join("")}</ul>
      </div>`;
    return `<div class="s11 ${open ? "open" : ""}" id="s11">
      <div class="card sq">
        <div class="sq-in">${ic("search", 18)}<span id="q">${found ? "Rahimov" : ""}</span><i class="caret"></i></div>
        <div class="sq-f"><span class="chip">${ic("pin", 13)} Butun respublika</span><span class="chip">${ic("building", 13)} Barcha sudlar</span></div>
        <div class="sq-res" id="sqres">${found ? `<small class="sq-cnt">3 ta xodim topildi</small>${res}` : `<div class="sq-empty">${ic("users", 30)}<small>Ism, JShShIR yoki tabel raqami bo'yicha</small></div>`}</div>
      </div>
      <div class="card smart" id="smart">
        <div class="sm-wait">${ic("shield", 40)}<b>SMART karta</b><small>Xodim tanlanganda shu yerda ochiladi</small></div>
        <div class="sm-body">
          <div class="sm-head"><b>${ic("shield", 16)} Sud uchun fuqarolik varaqasi</b><span class="sm-tags"><span class="tag warn">Ishlab chiqilmoqda</span><span class="tag ok">${ic("check", 12)} Davlat bazalaridan</span></span></div>
          <div class="sm-top">
            <div class="sm-person">
              ${av(C.ini, "xl cand")}
              <div class="sm-pm"><b>${esc(C.name)}</b>
                <div class="sm-chips"><span>${ic("hash", 12)} ${C.pin}</span><span>${ic("calendar", 12)} ${C.birth}</span></div>
                <dl>${M.rows.map(([l, v, t]) => `<div><dt>${l}</dt><dd class="${t || ""}">${esc(v)}</dd></div>`).join("")}</dl>
              </div>
            </div>
            ${ring("Ijtimoiy xavf darajasi", 100, M.risk, "risk")}
            ${ring("Ijtimoiy daraja", 99, M.social, "soc")}
          </div>
          <div class="sm-grid">${M.boxes.map((b) => `<section class="sm-box"><header><span>${ic(b.ic, 15)}</span>${b.t}</header>${b.rows.map(([l, v]) => `<div class="sm-row"><span>${l}</span><b>${esc(v)}</b></div>`).join("")}</section>`).join("")}</div>
          <div class="sm-none"><small>Ma'lumot yo'q:</small>${M.empty.map(([i, t]) => `<span>${ic(i, 13)}${t}</span>`).join("")}</div>
        </div>
      </div>
    </div>`;
  },
});

async function runSmartSearch(sc) {
  const q = $("#q", sc);
  $(".sq-in", sc).classList.add("on");
  await typeIn(q, "Rahimov", 9);
  const res = $("#sqres", sc);
  res.innerHTML = `<div class="sq-load"><i class="mini-spin"></i> Qidirilmoqda…</div>`;
  await wait(600);
  res.innerHTML = `<small class="sq-cnt">3 ta xodim topildi</small>`;
  for (const [k, r] of DATA2.search.entries()) {
    const n = el(`<div class="sr ${r.me ? "me" : ""} pop" data-r="${k}">${av(r.ini, "md " + (r.me ? "cand" : ""))}<div><b>${esc(r.name)}</b><small>${esc(r.pos)} · ${esc(r.court)}</small></div>${ic("arrow-right", 16)}</div>`);
    res.appendChild(n);
    await wait(160);
  }
  $(".sq-in", sc).classList.remove("on");
}

async function runSmartOpen(sc) {
  const me = $(".sr.me", sc);
  me.classList.add("press");
  await wait(300);
  me.classList.remove("press");
  me.classList.add("sel");
  const smart = $("#smart", sc);
  smart.classList.add("loading");
  await wait(1100);
  smart.classList.remove("loading");
  $("#s11", sc).classList.add("open");
  await wait(250);
  const R = 2 * Math.PI * 50;
  for (const [cls, v] of [["risk", 100], ["soc", 99]]) {
    const g = $(`[data-g="${cls}"]`, sc);
    $(".fgc", g).style.strokeDasharray = `${(v / 100) * R} ${R}`;
    countUp($(".sm-ring b", g), v, { dur: 900, suffix: "%" });
  }
  await wait(1000);
}

// ---------------------------------------------------------------- 2.3 integrations
const GROUP_TONES = ["blue", "red", "amber", "violet", "teal"];
STEPS.push({
  id: "integ",
  ch: 2,
  short: "Integratsiyalar",
  title: "SudHR davlat tizimlari bilan bog'langan",
  lead: "Kadr ma'lumoti qo'lda kiritilmaydi: tizim kerakli manbadan o'zi so'raydi. Bitta platforma — 16 ta tizim bilan almashinuv.",
  actor: { ini: "SH", role: "Integratsiya", name: `${DATA2.systems.length} ta tizim`, tone: "sys" },
  actions: [{ label: "Ulanishlarni ko'rsatish", icon: "link", run: runInteg }],
  render(p) {
    const on = p >= 1, N = DATA2.systems.length;
    const nodes = DATA2.systems.map((s, k) => {
      const a = (k / N) * 2 * Math.PI - Math.PI / 2;
      const x = 50 + 42 * Math.cos(a), y = 50 + 41 * Math.sin(a);
      return `<div class="on-node t-${GROUP_TONES[s.g]} ${on ? "lit" : ""}" data-n="${k}" style="left:${x}%;top:${y}%"><span class="on-ic">${ic(s.ic, 16)}</span><div><b>${esc(s.t)}</b><small>${esc(s.s)}</small></div></div>`;
    }).join("");
    const legend = DATA2.groups.map((g, k) => `<div class="lg t-${GROUP_TONES[k]}"><i></i><span>${g}</span><b>${DATA2.systems.filter((s) => s.g === k).length}</b></div>`).join("");
    return `<div class="s12">
      <div class="orbit" id="orbit">
        <svg class="wires" id="s12w"></svg>
        <div class="core ${on ? "lit" : ""}" id="core"><i class="rg g1"></i><i class="rg g2"></i><span class="core-o">${ic("shield", 30)}<b>SudHR</b></span></div>
        ${nodes}
      </div>
      <div class="card legend">
        <div class="card-h"><div><b>Ulangan tizimlar</b><small>Guruhlar bo'yicha</small></div></div>
        ${legend}
        <div class="lg-total"><b id="sysN">${on ? N : 0}</b><small>ta tizim bilan avtomatik almashinuv</small></div>
      </div>
    </div>`;
  },
  mount(sc, p) {
    const svg = $("#s12w", sc), core = $("#core", sc);
    if (!svg) return;
    svg.innerHTML = "";
    const h = svg.getBoundingClientRect(), c = core.getBoundingClientRect();
    const cx = (c.left + c.width / 2 - h.left) / ZOOM, cy = (c.top + c.height / 2 - h.top) / ZOOM;
    $$(".on-node", sc).forEach((n) => {
      const r = n.getBoundingClientRect();
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", cx);
      l.setAttribute("y1", cy);
      l.setAttribute("x2", (r.left + r.width / 2 - h.left) / ZOOM);
      l.setAttribute("y2", (r.top + r.height / 2 - h.top) / ZOOM);
      l.setAttribute("class", `spoke t-${GROUP_TONES[DATA2.systems[+n.dataset.n].g]} ${p >= 1 ? "on" : ""}`);
      l.dataset.n = n.dataset.n;
      svg.appendChild(l);
    });
  },
});

async function runInteg(sc) {
  $("#core", sc).classList.add("lit", "boot");
  await wait(500);
  const nEl = $("#sysN", sc);
  let n = 0;
  for (const node of $$(".on-node", sc)) {
    const k = node.dataset.n;
    $(`line[data-n="${k}"]`, sc).classList.add("on", "draw");
    await wait(140);
    node.classList.add("lit", "pop");
    nEl.textContent = ++n;
  }
  $("#core", sc).classList.remove("boot");
  toast(`${n} ta tizim bilan ulanish faol`);
  await wait(400);
}
