// Chapter 2, steps 4-7: attendance, republic-wide oversight, employee rating (proposal), closing.

// ---------------------------------------------------------------- 2.4 attendance
STEPS.push({
  id: "davomat",
  frame: {type: "hr",url: "turniket/dashboard",menu: "turniket",crumbs: ["Turniket","Davomat"]},
  ch: 2,
  short: "Davomat",
  title: "Turniket: viloyat bo'yicha bugungi davomat",
  lead: "Har bir sud kirish-chiqish qaydlari markazga tushadi. Kech qolgan, sababli yo'q va aniqlashtirish kerak bo'lganlar alohida ko'rinadi.",
  actor: REG_ACTOR,
  actions: [
    { label: "Bugungi davomatni olish", icon: "clock", run: runAttendance },
    { label: "Kech qolganlarni ko'rish", icon: "alert", run: runLate },
  ],
  render(p) {
    const A = DATA2.attendance, got = p >= 1, list = p >= 2;
    const t = A.reduce((a, r) => [a[0] + r[1], a[1] + r[2], a[2] + r[3], a[3] + r[4]], [0, 0, 0, 0]);
    const unknown = t[0] - t[1] - t[3];
    const kpi = [
      ["exp", "Kelishi kerak", t[0], "users", ""],
      ["came", "Keldi", t[1], "check", "ok"],
      ["late", "Kech qoldi", t[2], "clock", "warn"],
      ["exc", "Sababli yo'q", t[3], "calendar", "info"],
      ["unk", "Aniqlashtirish", unknown, "alert", "muted"],
    ];
    const rows = A.map(([n, e, c, l, x], k) => {
      const ontime = c - l, u = e - c - x;
      const w = (v) => (got ? pct(v, e) : 0);
      return `<div class="at-row" data-a="${k}"><b>${esc(n)}</b>
        <div class="stack"><i class="s-ok" style="width:${w(ontime)}%"></i><i class="s-late" style="width:${w(l)}%"></i><i class="s-exc" style="width:${w(x)}%"></i><i class="s-unk" style="width:${w(u)}%"></i></div>
        <span class="at-n">${got ? `${c}/${e}` : ""}</span></div>`;
    }).join("");
    const tick = (ev) => `<div class="tk tk-${ev[3]}"><span class="tk-t">${ev[0]}</span><div><b>${esc(ev[2])}</b><small>${esc(ev[1])}</small></div><span class="tag ${ev[3] === "late" ? "warn" : "ok"}">${ev[3] === "late" ? "Kech" : "Kirish"}</span></div>`;
    return `<div class="s13">
      <div class="kpis k5">${kpi.map(([k, tt, v, i, tone]) => `<div class="kpi ${tone}" data-k="${k}"><div class="kpi-ic">${ic(i, 20)}</div><small>${tt}</small><b data-v="${v}">${got ? v : "—"}</b></div>`).join("")}</div>
      <div class="s13-grid">
        <div class="card att">
          <div class="card-h"><div><b>Sudlar bo'yicha</b><small>Bugun · 09:30 holatiga</small></div>
            <div class="lgd"><span><i class="s-ok"></i>O'z vaqtida</span><span><i class="s-late"></i>Kech</span><span><i class="s-exc"></i>Sababli</span><span><i class="s-unk"></i>Aniqlashtirish</span></div></div>
          <div class="at-list">${rows}</div>
        </div>
        <div class="card ticker">
          <div class="card-h"><div><b>Turniket qaydlari</b><small>Jonli oqim</small></div><span class="live"><i></i>LIVE</span></div>
          <div class="tk-list" id="tk">${got ? DATA2.ticker.slice().reverse().map(tick).join("") : `<div class="tk-empty">${ic("clock", 28)}<small>Qaydlar kutilmoqda</small></div>`}</div>
        </div>
      </div>
      <div class="card late ${list ? "on" : ""}" id="late">
        <div class="card-h"><div><b>E'tibor talab qiladiganlar</b><small>Holat avtomatik aniqlanadi: ta'til, safar va ma'lumotnoma hisobga olinadi</small></div></div>
        <div class="late-list">${DATA2.late.map((r) => `<div class="lt">${av(r.name.split(" ").map((x) => x[0]).join(""), "sm")}<div><b>${esc(r.name)}</b><small>${esc(r.court)}</small></div><span class="lt-t">${r.time}</span><span class="tag ${r.tone}">${esc(r.st)}</span></div>`).join("")}</div>
      </div>
    </div>`;
  },
});

async function runAttendance(sc) {
  const tk = $("#tk", sc);
  tk.innerHTML = "";
  const kp = $$(".kpi b", sc);
  kp.forEach((b) => countUp(b, +b.dataset.v, { dur: 2200 }));
  const A = DATA2.attendance;
  $$(".at-row", sc).forEach((row, k) => {
    const [, e, c, l, x] = A[k];
    const parts = [c - l, l, x, e - c - x];
    setTimeout(() => {
      $$(".stack i", row).forEach((i, j) => (i.style.width = pct(parts[j], e) + "%"));
      $(".at-n", row).textContent = `${c}/${e}`;
    }, k * 160 * SPEED);
  });
  for (const ev of DATA2.ticker) {
    const n = el(`<div class="tk tk-${ev[3]} drop"><span class="tk-t">${ev[0]}</span><div><b>${esc(ev[2])}</b><small>${esc(ev[1])}</small></div><span class="tag ${ev[3] === "late" ? "warn" : "ok"}">${ev[3] === "late" ? "Kech" : "Kirish"}</span></div>`);
    tk.prepend(n);
    await wait(230);
  }
  await wait(300);
}

async function runLate(sc) {
  $("#late", sc).classList.add("on");
  $("#late", sc).scrollIntoView({ block: "nearest", behavior: "smooth" });
  await wait(700);
}

// ---------------------------------------------------------------- 2.5 republic oversight
const regIndex = (r) => 0.6 * pct(r[2], r[1]) + 0.4 * r[3];
// the HR department's scale, on the shown (rounded) value: 97-100 green, 95-96.9 yellow, below 95 red
const regTone = (r) => {
  const v = +regIndex(r).toFixed(1);
  return v >= 97 ? "rt-top" : v >= 95 ? "rt-mid" : "rt-low";
};
STEPS.push({
  id: "respublika",
  frame: { type: "hr", url: "dashboard/republic", menu: "boshqarish", crumbs: ["Boshqarish", "Respublika kesimida"], user: DATA2.centralHr },
  ch: 2,
  short: "Respublika",
  title: "Respublika nazorati: 14 hudud bir qarashda",
  lead: "Oliy sud inson resurslari boshqarmasi hududlarni shtat to'ldirilishi va davomat bo'yicha solishtiradi, orqada qolgan hududga topshiriq yuboradi.",
  actor: { ini: DATA2.centralHr.ini, role: DATA2.centralHr.role, name: DATA2.centralHr.name, tone: "sys" },
  actions: [
    { label: "Hududlarni solishtirish", icon: "chart", run: runRegions },
    { label: "Topshiriq yuborish", icon: "send", run: runTask },
  ],
  render(p) {
    const R = DATA2.regions, got = p >= 1, sent = p >= 2;
    const order = got ? R.map((r, k) => k).sort((a, b) => regIndex(R[b]) - regIndex(R[a])) : R.map((r, k) => k);
    const worst = R.map((r, k) => k).sort((a, b) => regIndex(R[a]) - regIndex(R[b]))[0];
    const tile = (k, rank) => {
      const r = R[k], fp = pct(r[2], r[1]);
      const cls = got ? regTone(r) : "";
      return `<div class="rt ${cls} ${sent && k === worst ? "sent" : ""}" data-r="${k}">
        <div class="rt-h"><b>${esc(r[0])}</b><span class="rt-rank">${got ? "#" + (rank + 1) : ""}</span></div>
        <div class="rt-v" data-v="${regIndex(r).toFixed(1)}">${got ? fmt(regIndex(r), 1) : "—"}</div>
        <div class="rt-m"><span>Shtat <b>${got ? fmt(fp, 1) + "%" : "—"}</b></span><span>Davomat <b>${got ? fmt(r[3], 1) + "%" : "—"}</b></span></div>
        <span class="rt-task">${ic("send", 12)} Topshiriq yuborildi</span>
      </div>`;
    };
    const w = R[worst];
    return `<div class="s14">
      <div class="rgrid" id="rgrid">${order.map((k, rank) => tile(k, rank)).join("")}</div>
      <div class="s14-side">
        <div class="card formula"><div class="card-h"><div><b>Hudud indeksi</b><small>Qanday hisoblanadi</small></div></div>
          <div class="fm"><span>Shtat to'ldirilishi</span><b>60%</b></div><div class="fm"><span>Davomat</span><b>40%</b></div>
          <div class="fm-scale"><span class="g">97–100</span><span class="y">95–96,9</span><span class="r">94,9 va past</span></div>
          <div class="fm-note">Ko'rsatkichlar har kuni avtomatik yangilanadi</div></div>
        <div class="card task ${sent ? "sent" : ""}" id="task">
          <div class="task-h">${ic("file", 16)}<b>Topshiriq</b><span class="tag ${sent ? "ok" : "muted"}" id="taskSt">${sent ? "Yuborildi" : "Qoralama"}</span></div>
          <p><b>${esc(w[0])}</b> kadrlar bo'limiga: ${w[1] - w[2]} ta bo'sh ish o'rni bo'yicha 10 kun ichida e'lon berish va davomatni yaxshilash choralarini ko'rish.</p>
          <small>Muddat: 10 kun · Nazoratda</small>
        </div>
      </div>
    </div>`;
  },
});

async function runRegions(sc) {
  const R = DATA2.regions;
  const tiles = $$(".rt", sc);
  for (const t of tiles) {
    const r = R[+t.dataset.r];
    const v = $(".rt-v", t);
    countUp(v, +v.dataset.v, { from: 80, dur: 700, dec: 1 });
    const m = $$(".rt-m b", t);
    m[0].textContent = fmt(pct(r[2], r[1]), 1) + "%";
    m[1].textContent = fmt(r[3], 1) + "%";
    await wait(60);
  }
  await wait(800);
  // FLIP: remember positions, reorder by index, animate from the old place
  const grid = $("#rgrid", sc);
  const first = new Map(tiles.map((t) => [t, t.getBoundingClientRect()]));
  const sorted = tiles.slice().sort((a, b) => regIndex(R[+b.dataset.r]) - regIndex(R[+a.dataset.r]));
  sorted.forEach((t) => grid.appendChild(t));
  sorted.forEach((t, rank) => {
    const a = first.get(t), b = t.getBoundingClientRect();
    t.animate([{ transform: `translate(${(a.left - b.left) / ZOOM}px,${(a.top - b.top) / ZOOM}px)` }, { transform: "none" }], { duration: 700 * SPEED, easing: "cubic-bezier(.3,.8,.3,1)" });
    $(".rt-rank", t).textContent = "#" + (rank + 1);
    t.classList.add(regTone(R[+t.dataset.r]));
  });
  await wait(800);
  toast("Hududlar indeks bo'yicha saralandi");
}

async function runTask(sc) {
  const R = DATA2.regions;
  const worst = R.map((r, k) => k).sort((a, b) => regIndex(R[a]) - regIndex(R[b]))[0];
  const tile = $(`.rt[data-r="${worst}"]`, sc);
  await signFx(`${DATA2.centralHr.name} · Oliy sud`, "Topshiriq imzolandi", "Hududga topshiriq yuborilmoqda");
  await fly($("#task", sc), tile, `${ic("send", 15)} Topshiriq`, "doc");
  tile.classList.add("sent");
  $("#task", sc).classList.add("sent");
  const st = $("#taskSt", sc);
  st.className = "tag ok pop";
  st.textContent = "Yuborildi";
  toast(`${R[worst][0]} kadrlar bo'limiga topshiriq yetib bordi`);
  await wait(500);
}

// ---------------------------------------------------------------- 2.6 rating (proposal)
STEPS.push({
  id: "reyting",
  ch: 2,
  short: "Reyting",
  title: "Eng yaxshi xodimlar reytingi",
  lead: "Taklif: tizimdagi ma'lumotlar asosida xodimlarni ochiq mezonlar bo'yicha baholash. Reyting tavsiya beradi, qarorni rahbar qabul qiladi.",
  actor: { ini: "★", role: "Keyingi bosqich", name: "Taklif etilmoqda", tone: "com" },
  actions: [{ label: "Reytingni hisoblash", icon: "trophy", run: runRating }],
  render(p) {
    const T = DATA2.top, got = p >= 1;
    const pod = [T[1], T[0], T[2]], place = [2, 1, 3];
    return `<div class="rate">
      <div class="card crit">
        <div class="card-h"><div><b>Baholash mezonlari</b><small>Ma'lumot tizimning o'zidan olinadi</small></div><span class="tag warn">Taklif</span></div>
        <div class="crit-list">${DATA2.criteria.map(([t, w]) => `<div class="cr"><div class="cr-t"><span>${t}</span><b>${w}%</b></div><div class="cr-bar"><i style="width:${got ? w * 3 : 0}%" data-w="${w * 3}"></i></div></div>`).join("")}</div>
        <div class="cr-note">${ic("shield", 16)}<span>Jins, millat, yosh va oilaviy holat baholanmaydi</span></div>
      </div>
      <div class="rate-r">
        <div class="rtop ${got ? "on" : ""}" id="podium">
          ${pod.map((m, k) => `<div class="rc rc${place[k]}">
            <span class="rc-n">${place[k] === 1 ? ic("trophy", 18) : place[k]}</span>
            ${av(m.ini, "lg " + (place[k] === 1 ? "gold" : ""))}
            <b>${esc(m.name)}</b>
            <small>${esc(m.pos)}</small>
            <small>${esc(m.court)}</small>
            <em class="rc-s" data-v="${m.score}">${got ? fmt(m.score, 1) : "—"}</em>
            <div class="rc-bar"><i style="width:${got ? m.score : 0}%" data-w="${m.score}"></i></div>
          </div>`).join("")}
        </div>
        <div class="card board">
          <div class="card-h"><div><b>Respublika bo'yicha</b><small>Barcha sudlar · joriy chorak</small></div><span class="tag muted">${T.length} ta xodim</span></div>
          <div class="bd-list">${T.slice(3).map((m, k) => `<div class="bd"><span class="bd-n">${k + 4}</span>${av(m.ini, "sm")}<div><b>${esc(m.name)}</b><small>${esc(m.pos)} · ${esc(m.court)}</small></div><div class="bd-bar"><i style="width:${got ? m.score : 0}%" data-w="${m.score}"></i></div><span class="bd-s">${got ? fmt(m.score, 1) : "—"}</span></div>`).join("")}</div>
        </div>
      </div>
    </div>`;
  },
});

async function runRating(sc) {
  for (const i of $$(".cr-bar i", sc)) {
    i.style.width = i.dataset.w + "%";
    await wait(150);
  }
  await wait(250);
  $("#podium", sc).classList.add("on");
  for (const c of [".rc1", ".rc2", ".rc3"].map((s) => $(s, sc))) {
    const i = $(".rc-bar i", c);
    i.style.width = i.dataset.w + "%";
    countUp($(".rc-s", c), +$(".rc-s", c).dataset.v, { from: 60, dur: 800, dec: 1 });
    await wait(260);
  }
  await wait(300);
  for (const r of $$(".bd", sc)) {
    const i = $(".bd-bar i", r);
    i.style.width = i.dataset.w + "%";
    countUp($(".bd-s", r), +i.dataset.w, { from: 60, dur: 600, dec: 1 });
    await wait(120);
  }
  await wait(500);
}

// ---------------------------------------------------------------- 2.7 closing
STEPS.push({
  id: "yakun",
  ch: 2,
  short: "Yakun",
  title: "SudHR: yagona kadrlar platformasi",
  lead: "Tanlovdan ishga qabulgacha, sud darajasidan respublika darajasigacha — bitta tizim, bitta ma'lumot, to'liq nazorat.",
  actor: null,
  actions: [{ label: "Yakuniy xulosa", icon: "sparkles", run: runFinal }],
  render(p) {
    const on = p >= 1;
    const c1 = ["Bo'sh o'rinlar shtatdan avtomatik", "E'lon bir bosishda vacancy.sud.uz da", "Ariza OneID orqali, qog'ozsiz", "Kompleks tekshiruv xulosasi tizimda", "Ball va natija avtomatik", "Buyruq, shtat va xodim kartasi"];
    const c2 = ["Respublikadan 14 hududni nazorat qilish", "Viloyat va sud kesimida shtat, bo'sh o'rinlar", "Turniket: davomat va reytinglar", "16 ta tizimdan ma'lumot avtomatik", "SMART karta (ishlab chiqilmoqda)", "Xodimlar reytingi (taklif)"];
    const card = (t, n, list, go) => `<div class="card fin ${on ? "on" : ""}" data-go="${go}"><div class="fin-h"><span>${n}-qism</span><b>${t}</b></div>${list.map((x) => `<div class="fin-i">${ic("check", 15)}<span>${x}</span></div>`).join("")}</div>`;
    const stats = [["14", "hudud"], ["16", "integratsiya"], ["1", "platforma"], ["3", "bosqichda E-IMZO"]];
    return `<div class="s16">
      <div class="fin-grid">${card("Tanlov va ishga qabul", 1, c1, 0)}${card("Respublika nazorati", 2, c2, STEPS.findIndex((s) => s.ch === 2))}</div>
      <div class="fin-stats">${stats.map(([v, t]) => `<div class="fs ${on ? "on" : ""}"><b data-v="${v}">${on ? v : 0}</b><small>${t}</small></div>`).join("")}</div>
      <div class="fin-line ${on ? "on" : ""}">${ic("shield", 22)}<b>SudHR</b><span>sudlar uchun yagona kadrlar boshqaruvi tizimi</span></div>
    </div>`;
  },
});

async function runFinal(sc) {
  for (const c of $$(".fin", sc)) {
    c.classList.add("on");
    await wait(300);
  }
  for (const f of $$(".fs", sc)) {
    f.classList.add("on");
    const b = $("b", f);
    countUp(b, +b.dataset.v, { dur: 800 });
    await wait(150);
  }
  await wait(500);
  $(".fin-line", sc).classList.add("on");
  await wait(400);
}
