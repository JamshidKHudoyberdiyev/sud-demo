// Steps 1-4: vacant posts, the announcement, vacancy.sud.uz, the candidate's application.
const HR_ACTOR = { ini: DATA.hr.ini, name: DATA.hr.short, role: DATA.hr.role, sub: DATA.hr.dept };
const CAND_ACTOR = {
  ini: DATA.candidate.ini,
  role: "Nomzod",
  name: DATA.candidate.name,
  tone: "cand",
};

// ---------------------------------------------------------------- 1. vacant posts
STEPS.push({
  id: "vacant",
  frame: {
    type: "hr",
    url: "staff/list",
    menu: "shtat",
    crumbs: ["Tuzilma va shtat", "Shtat jadvali"],
  },
  short: "Bo'sh o'rinlar",
  title: "Bo'sh ish o'rinlarini aniqlash",
  lead: "Shtat jadvali tizimda yuritiladi: qaysi lavozim band, qaysi biri bo'sh ekanini tizim o'zi ko'rsatadi.",
  actor: HR_ACTOR,
  actions: [
    { label: "Bo'sh o'rinlarni aniqlash", icon: "search", run: runVacant },
  ],
  render(p) {
    const D = DATA,
      done = p >= 1;
    const kpi = [
      { k: "total", t: "Umumiy shtat", v: D.kpi.total, ic: "users", tone: "" },
      {
        k: "busy",
        t: "Band shtatlar",
        v: done ? D.kpi.busy : "—",
        ic: "check",
        tone: "ok",
      },
      {
        k: "vacant",
        t: "Bo'sh ish o'rni",
        v: done ? D.kpi.vacant : "—",
        ic: "alert",
        tone: "warn",
      },
      {
        k: "pub",
        t: "E'lon qilingan",
        v: D.kpi.announced + (phase("elon") >= 2 ? 1 : 0),
        ic: "globe",
        tone: "info",
      },
    ];
    const rows = D.staff
      .map((r, i) => {
        const st = !done
          ? `<span class="skel w60"></span>`
          : r.person
            ? `<span class="tag ok">Band</span>`
            : `<span class="tag warn">Bo'sh</span>`;
        const cls = [
          done && !r.person ? "vac" : "",
          done && r.target ? "target" : "",
        ].join(" ");
        return `<tr data-row="${i}" class="${cls}">
        <td class="t-dept">${esc(r.dept)}</td>
        <td class="t-pos">${esc(r.pos)}${done && r.target ? `<em class="pick">${ic("sparkles", 13)}E'lon uchun tanlandi</em>` : ""}</td>
        <td>${
          r.person
            ? `<span class="who">${av(
                r.person
                  .split(" ")
                  .map((x) => x[0])
                  .join(""),
                "sm",
              )}${esc(r.person)}</span>`
            : `<span class="muted">—</span>`
        }</td>
        <td class="t-st">${st}</td>
      </tr>`;
      })
      .join("");
    return `<div class="s1">
      <div class="kpis">${kpi.map((k) => `<div class="kpi ${k.tone}" data-k="${k.k}"><div class="kpi-ic">${ic(k.ic, 20)}</div><small>${k.t}</small><b>${k.v}</b></div>`).join("")}</div>
      <div class="card s1-table">
        <div class="card-h"><div><b>${esc(D.org)}</b><small>Shtat jadvali · bo'limlar bo'yicha</small></div><span class="tag muted">${ic("layers", 13)} ${D.staff.length} ta shtat birligi ko'rsatilmoqda</span></div>
        <div class="tbl-wrap">
          <table class="tbl"><thead><tr><th>Bo'lim</th><th>Lavozim</th><th>Xodim</th><th>Holat</th></tr></thead><tbody>${rows}</tbody></table>
          <div class="scanbar" id="scanbar"></div>
        </div>
      </div>
    </div>`;
  },
});

async function runVacant(sc) {
  const bar = $("#scanbar", sc);
  const rows = $$("tbody tr", sc);
  const busyB = $('[data-k="busy"] b', sc),
    vacB = $('[data-k="vacant"] b', sc);
  let busy = DATA.kpi.busy - DATA.staff.filter((r) => r.person).length,
    vac = DATA.kpi.vacant - DATA.staff.filter((r) => !r.person).length;
  busyB.textContent = busy;
  vacB.textContent = vac;
  bar.classList.add("on");
  for (const tr of rows) {
    const r = DATA.staff[+tr.dataset.row];
    bar.style.transform = `translateY(${tr.offsetTop}px)`;
    bar.style.height = tr.offsetHeight + "px";
    await wait(170);
    const st = $(".t-st", tr);
    st.innerHTML = r.person
      ? `<span class="tag ok pop">Band</span>`
      : `<span class="tag warn pop">Bo'sh</span>`;
    if (r.person) busyB.textContent = ++busy;
    else {
      tr.classList.add("vac");
      vacB.textContent = ++vac;
      $('[data-k="vacant"]', sc).classList.add("bump");
      setTimeout(
        () => $('[data-k="vacant"]', sc).classList.remove("bump"),
        300,
      );
    }
  }
  bar.classList.remove("on");
  await countUp(busyB, DATA.kpi.busy, { from: busy, dur: 500 });
  await wait(250);
  const t =
    $("tr[data-row].vac", sc) &&
    rows.find((tr) => DATA.staff[+tr.dataset.row].target);
  t.classList.add("target");
  $(".t-pos", t).insertAdjacentHTML(
    "beforeend",
    `<em class="pick pop">${ic("sparkles", 13)}E'lon uchun tanlandi</em>`,
  );
  t.scrollIntoView({ block: "nearest", behavior: "smooth" });
  toast(`${DATA.kpi.vacant} ta bo'sh ish o'rni aniqlandi`);
}

// ---------------------------------------------------------------- 2. announcement
STEPS.push({
  id: "elon",
  frame: {
    type: "hr",
    url: "vacancy/announcement/create",
    menu: "tanlov",
    crumbs: ["Tanlov", "E'lonlar", "Yangi e'lon"],
  },
  short: "E'lon",
  title: "Vakansiya e'lonini tayyorlash",
  lead: "E'lon shtat birligidan avtomatik to'ldiriladi, elektron imzo bilan tasdiqlanib, bir bosishda portalga chiqadi.",
  actor: HR_ACTOR,
  actions: [
    {
      label: "E'lonni avtomatik to'ldirish",
      icon: "sparkles",
      run: runElonFill,
    },
    { label: "Imzolash va e'lon qilish", icon: "send", run: runElonPublish },
  ],
  render(p) {
    const V = DATA.vacancy,
      f = p >= 1,
      pub = p >= 2;
    const src = [
      ["Lavozim", V.pos],
      ["Bo'lim", V.dept],
      ["Tashkilot", DATA.org],
      ["Stavka", V.rate],
    ];
    const fields = [
      ["pos", "Lavozim", V.pos],
      ["dept", "Bo'lim", V.dept],
      ["org", "Tashkilot", DATA.org],
      ["type", "Tanlov turi", V.type],
      ["term", "Hujjat qabul qilish muddati", V.term],
    ];
    return `<div class="s2">
      <div class="card s2-src">
        <div class="card-h"><div><b>Shtat birligi</b><small>Manba: shtat jadvali</small></div><span class="tag warn">Bo'sh</span></div>
        ${src.map(([k, v], i) => `<div class="kv" data-src="${i}"><span>${k}</span><b>${esc(v)}</b></div>`).join("")}
        <div class="s2-note">${ic("link", 14)} E'lon shu shtat birligiga bog'lanadi: nomzod qabul qilinganda shtat avtomatik band bo'ladi.</div>
      </div>
      <div class="s2-arrow">${ic("arrow-right", 26)}</div>
      <div class="card s2-form ${pub ? "published" : ""}" id="elonCard">
        <div class="card-h"><div><b>Vakansiya e'loni</b><small>${pub ? DATA.vacancy.no : "Qoralama"}</small></div>
          <span class="tag ${pub ? "ok" : "muted"}" id="elonSt">${pub ? `${ic("check", 13)} E'lon qilindi` : "Qoralama"}</span></div>
        <div class="fields">
          ${fields.map(([k, t, v]) => `<label class="fld" data-f="${k}"><span>${t}</span><b class="val ${f ? "" : "empty"}">${f ? esc(v) : ""}</b></label>`).join("")}
        </div>
        <div class="reqs"><span class="reqs-t">Talablar</span><div class="chips">${V.reqs.map((r) => `<span class="chip ${f ? "" : "hide"}">${ic("check", 13)}${esc(r)}</span>`).join("")}</div></div>
      </div>
      <div class="portal-pill ${pub ? "lit" : ""}" id="portalPill">${ic("globe", 18)}<div><b>vacancy.sud.uz</b><small>${pub ? "1 ta yangi e'lon" : "Ochiq portal"}</small></div></div>
    </div>`;
  },
});

async function runElonFill(sc) {
  const V = DATA.vacancy;
  const map = {
    pos: [0, V.pos],
    dept: [1, V.dept],
    org: [2, DATA.org],
    type: [null, V.type],
    term: [null, V.term],
  };
  for (const [k, [si, v]] of Object.entries(map)) {
    const fld = $(`[data-f="${k}"]`, sc);
    const val = $(".val", fld);
    if (si !== null) {
      const src = $(`[data-src="${si}"]`, sc);
      src.classList.add("flash");
      await fly(src, fld, ic("sparkles", 14), "dot");
      src.classList.remove("flash");
    }
    fld.classList.add("on");
    val.classList.remove("empty");
    await typeIn(val, v, 90);
    fld.classList.remove("on");
  }
  for (const c of $$(".chip", sc)) {
    c.classList.remove("hide");
    c.classList.add("pop");
    await wait(140);
  }
  toast("E'lon shtat birligidan to'ldirildi");
}

async function runElonPublish(sc) {
  await signFx(
    `${DATA.hr.short} · ${DATA.hr.dept}`,
    "Imzolandi",
    "E'lon elektron raqamli imzo bilan tasdiqlanmoqda",
  );
  const card = $("#elonCard", sc),
    pill = $("#portalPill", sc);
  await fly(card, pill, `${ic("file", 16)} E'lon ${DATA.vacancy.no}`, "doc");
  card.classList.add("published");
  $("#elonSt", sc).className = "tag ok pop";
  $("#elonSt", sc).innerHTML = `${ic("check", 13)} E'lon qilindi`;
  $(".card-h small", card).textContent = DATA.vacancy.no;
  pill.classList.add("lit");
  $("small", pill).textContent = "1 ta yangi e'lon";
  await bigOk(
    "E'lon joylashtirildi",
    `${DATA.vacancy.pos} lavozimiga e'lon vacancy.sud.uz portalida hamma uchun ochiq`,
  );
}

// ---------------------------------------------------------------- 3. vacancy.sud.uz
const vcardHtml = (v, cls = "") => `<div class="vcard ${cls}">
    <div class="vc-h"><b>${esc(v.pos)}</b>${cls.includes("new") ? `<span class="vc-new">Yangi</span>` : ""}</div>
    <div class="vc-no">E'lon № ${v.no} · ${v.date}</div>
    <div class="vc-org"><span>${ic("building", 14)}</span><div><b>${esc(v.org)}</b><small>${esc(v.dept)}</small></div></div>
    <span class="vc-seat">• 1 O'RIN</span>
    <div class="vc-foot">${ic("calendar", 13)} Muddati: ${v.until}</div>
  </div>`;
const MY_VAC = () => ({
  org: DATA.org,
  pos: DATA.vacancy.pos,
  dept: DATA.vacancy.dept,
  no: DATA.vacancy.no,
  date: DATA.vacancy.date,
  until: DATA.vacancy.until,
});

function vacDetailHtml(btnId) {
  const V = DATA.vacancy;
  return `<div class="vd-grid">
      <div class="vd-card">
        <div class="vc-no big">E'lon № ${V.no} · ${V.date}</div>
        <span class="vd-seat">1 o'rin</span>
        <div class="vd-kv">
          <div><span>${ic("building", 15)}</span><small>Tashkilot</small><b>${esc(DATA.org)}</b></div>
          <div><span>${ic("layers", 15)}</span><small>Bo'lim</small><b>${esc(V.dept)}</b></div>
          <div><span>${ic("pin", 15)}</span><small>Hudud</small><b>Toshkent shahri</b></div>
          <div><span>${ic("calendar", 15)}</span><small>Muddati</small><b>${V.until}</b></div>
        </div>
        <div class="vd-sec">Malaka talablari</div>
        <div class="vd-min"><b>Ma'lumot va mutaxassislik:</b> ${esc(V.edu)}. <b>Ish staji:</b> ${esc(V.minExp)}.</div>
        <ol class="vd-list">${V.minReqs.map((r) => `<li>${esc(r)}.</li>`).join("")}</ol>
        <div class="vd-sec">Bog'lanish</div>
        <div class="vd-kv"><div><span>${ic("phone", 15)}</span><small>Telefon</small><b>+998 71 000-00-00</b></div><div><span>${ic("mail", 15)}</span><small>Elektron pochta</small><b>kadrlar@namuna.uz</b></div></div>
      </div>
      <div class="vd-side"><button class="vd-apply" id="${btnId}">${ic("send", 15)} Ariza yuborish</button>
        <div class="vd-org"><span>${ic("building", 14)}</span><div><b>${esc(DATA.org)}</b><small>${esc(V.dept)}</small></div></div></div>
    </div>`;
}

STEPS.push({
  id: "portal",
  short: "vacancy.sud.uz",
  title: "Nomzod e'lonni vacancy.sud.uz da topadi",
  lead: "Barcha sudlardagi bo'sh ish o'rinlari bitta ochiq portalda: hududi, tashkiloti, muddati va talablari bilan.",
  actor: CAND_ACTOR,
  frame: (p) => ({ type: "vac", url: p >= 2 ? "vacancies/7231" : "vacancies" }),
  actions: [
    { label: "Portalni yangilash", icon: "rotate", run: runPortalRefresh },
    { label: "E'lonni ochish", icon: "eye", run: runPortalOpen },
  ],
  render(p) {
    const D = DATA,
      isNew = p >= 1,
      open = p >= 2;
    return `<div class="s3 ${open ? "detail" : ""}" id="s3">
      <div class="vp-list">
        <div class="vac-hero"><span class="vh-tag">OCHIQ LAVOZIMLAR</span><h2>Vakansiyalar</h2><p>Sud tizimida o'zingizga mos imkoniyatni toping va karyera yo'lingizni boshlang</p></div>
        <div class="vac-body">
          <div class="vs-row"><div class="vs-in">${ic("search", 17)} <span>Lavozim yoki tashkilot nomi bo'yicha qidirish</span></div><span class="vs-f">Hudud ▾</span><span class="vs-f">Sud turi ▾</span><span class="vs-f">Tashkilot ▾</span></div>
          <div class="vs-meta"><small class="vs-cnt"><b id="vCnt">${D.portalTotal + (isNew ? 1 : 0)}</b> ta vakansiya</small><span class="vs-note">${ic("shield", 13)} Sudyalik lavozimlari portalda e'lon qilinmaydi</span></div>
          <div class="vgrid" id="vgrid">${isNew ? vcardHtml(MY_VAC(), "new mine") : ""}${D.portal.map((v) => vcardHtml(v)).join("")}</div>
        </div>
      </div>
      <div class="vp-detail">
        <div class="vac-hero sm"><span class="vh-back">${ic("arrow-left", 13)} Orqaga</span><h2>${esc(D.vacancy.pos)}</h2></div>
        <div class="vac-body">${vacDetailHtml("applyBtn3")}</div>
      </div>
    </div>`;
  },
});

async function runPortalRefresh(sc) {
  const grid = $("#vgrid", sc);
  grid.classList.add("loading");
  await wait(800);
  grid.classList.remove("loading");
  grid.prepend(el(vcardHtml(MY_VAC(), "new mine drop")));
  await countUp($("#vCnt", sc), DATA.portalTotal + 1, {
    from: DATA.portalTotal,
    dur: 600,
  });
  toast("Portalda yangi e'lon paydo bo'ldi");
}

async function runPortalOpen(sc) {
  const card = $(".vcard.mine", sc);
  card.classList.add("press");
  await wait(450);
  $(".b-url", sc).innerHTML =
    `${ic("lock", 12)}<b>vacancy.sud.uz</b>/vacancies/7231`;
  $("#s3", sc).classList.add("detail");
  await wait(600);
}

// ---------------------------------------------------------------- 4. application
STEPS.push({
  id: "ariza",
  short: "Ariza",
  title: "Nomzod OneID orqali kirib ariza yuboradi",
  lead: "Ro'yxatdan o'tish yo'q: OneID orqali kiriladi, shaxsiy ma'lumotlar davlat reyestridan keladi. Obyektivka profildan o'zi tuziladi, nomzod faqat pasport nusxasini yuklaydi va ariza oldidan tanlov shartlariga rozilik bildiradi.",
  actor: CAND_ACTOR,
  frame: (p) => ({
    type: "vac",
    url: p >= 1 ? "vacancies/7231/apply" : "vacancies/7231",
    user: p >= 1,
  }),
  actions: [
    { label: "OneID orqali kirish", icon: "key", run: runOneId },
    { label: "Hujjatlarni tayyorlash", icon: "upload", run: runDocs },
    { label: "Tanlov shartlariga rozilik", icon: "file", run: runTerms },
    { label: "Ariza yuborish", icon: "send", run: runSend },
  ],
  render(p) {
    const C = DATA.candidate,
      V = DATA.vacancy,
      id = p >= 1,
      docs = p >= 2,
      agreed = p >= 3,
      sent = p >= 4;
    const rows = [
      ["hash", "JShShIR", C.pin],
      ["calendar", "Tug'ilgan sana", C.birth],
      ["id", "Pasport", C.passport],
      ["home", "Doimiy manzil", C.address],
    ];
    const docRow = (
      d,
      k,
    ) => `<div class="doc ${docs ? "ok" : ""}" data-doc="${k}">
        <span class="doc-ic ${k === 0 ? "paper-ic" : ""}">${k === 0 ? `<i></i><i></i><i></i><i></i>` : ic("upload", 17)}</span>
        <div><b>${esc(d.t)}</b><small>${docs ? esc(d.s) : k === 0 ? "Profilingiz asosida avtomatik tuziladi (PDF)" : "PDF yoki rasm yuklang"}</small><div class="pbar"><i style="width:${docs ? 100 : 0}%"></i></div></div>
        ${docs ? `<span class="tag ok">${ic("check", 12)} Tayyor</span>` : k === 0 ? `<span class="tag warn">Tuzilmoqda…</span>` : `<span class="up-btn">${ic("upload", 13)} Yuklash</span>`}
      </div>`;
    return `<div class="s4 ${id ? "in" : ""}" id="s4">
      <div class="vp-detail">
        <div class="vac-hero sm"><span class="vh-back">${ic("arrow-left", 13)} Orqaga</span><h2>${esc(V.pos)}</h2></div>
        <div class="vac-body">${vacDetailHtml("applyBtn4")}</div>
      </div>
      <div class="vp-apply">
        <div class="vac-hero sm"><span class="vh-back">${ic("arrow-left", 13)} Orqaga</span><h2>Ariza yuborish · ${esc(V.pos)}</h2></div>
        <div class="vac-body">
          <div class="ap-grid">
            <div class="ap-l">
              <div class="vd-card prof ${id ? "ok" : ""}" id="idcard">
                <div class="id-top">${av(C.ini, "lg cand " + (id ? "" : "blur"))}<div><span class="tag info">${ic("shield", 12)} OneID · davlat reyestri</span><b class="id-name">${id ? esc(C.name) : `<span class="skel w80"></span>`}</b></div></div>
                ${rows.map(([i, t, v], k) => `<div class="id-row ${id ? "ok" : ""}" data-id="${k}"><span class="id-ic">${ic(i, 15)}</span><span class="id-t">${t}</span><b>${id ? esc(v) : `<span class="skel"></span>`}</b><i class="id-ck">${ic("check", 13)}</i></div>`).join("")}
              </div>
              <div class="vd-card docs" id="docs"><div class="vd-sec top">Hujjatlar</div>${DATA.docs.map(docRow).join("")}
                <div class="ap-note">${ic("alert", 14)} Ta'lim, mehnat faoliyati, oila a'zolari va tillar profildan olinadi — ularni qayta to'ldirish shart emas.</div></div>
            </div>
            <div class="ap-r">
              <div class="vd-card"><small class="muted">Vakansiya</small><b class="ap-pos">${esc(V.pos)}</b><small>${esc(DATA.org)}<br>${esc(V.dept)}</small><div class="vc-foot">${ic("calendar", 13)} Muddati: ${V.until}</div>
                <div class="of-agreed ${agreed ? "on" : ""}" id="ofAgreed">${ic("check", 13)} Tanlov shartlariga rozilik bildirildi</div>
                <button class="vd-apply wide" id="sendBtn">${ic("send", 15)} Ariza yuborish</button></div>
              <div class="vd-card sent-card ${sent ? "on" : ""}" id="sentCard"><span class="sc-ic">${ic("check", 18)}</span><div><b>Ariza yuborildi</b><small>Kiruvchi raqam: ${C.appNo} · SudHR tizimiga yetib bordi</small></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="oneid" id="oneid">
        <div class="oi-card">
          <div class="oi-logo"><b>One</b>ID</div>
          <small>Yagona identifikatsiya tizimi</small>
          <div class="oi-tabs"><span>Login</span><span class="on">ERI kaliti</span><span>Mobile-ID</span></div>
          <div class="oi-key" id="oiKey"><b>${esc(C.name.toUpperCase())}</b><small>JShShIR: ${C.pin.slice(0, 5)}*********</small></div>
          <div class="oi-st" id="oiSt"><i class="mini-spin"></i> Tasdiqlanmoqda…</div>
        </div>
      </div>
      ${termsHtml()}
      <div class="hr-pill ${sent ? "lit" : ""}" id="hrPill"><img src="assets/logo-dark.svg" alt="" /><div><b>Inson resurslari boshqarmasi · Kiruvchi</b><small>${esc(DATA.org)}</small></div><span class="nbadge">1</span></div>
    </div>`;
  },
});

async function runOneId(sc) {
  const C = DATA.candidate;
  $("#applyBtn4", sc).classList.add("press");
  await wait(350);
  const oi = $("#oneid", sc);
  oi.classList.add("on");
  await wait(900);
  $("#oiKey", sc).classList.add("sel");
  await wait(700);
  $("#oiSt", sc).innerHTML = `${ic("check", 14)} Shaxs tasdiqlandi`;
  $("#oiSt", sc).classList.add("ok");
  await wait(700);
  oi.classList.remove("on");
  $("#s4", sc).classList.add("in");
  $(".b-url", sc).innerHTML =
    `${ic("lock", 12)}<b>vacancy.sud.uz</b>/vacancies/7231/apply`;
  $(".vn-r", sc).innerHTML =
    `<span class="vn-bell">${ic("bell", 15)}<i></i></span><span class="vn-av">${av(C.ini, "sm cand")}</span>`;
  await wait(450);
  const vals = [C.pin, C.birth, C.passport, C.address];
  for (let k = 0; k < 4; k++) {
    const row = $(`[data-id="${k}"]`, sc);
    row.classList.add("on");
    await typeIn($("b", row), vals[k], 80);
    row.classList.remove("on");
    row.classList.add("ok");
  }
  $(".av.blur", sc).classList.remove("blur");
  await typeIn($(".id-name", sc), C.name, 60);
  $("#idcard", sc).classList.add("ok");
}

async function runDocs(sc) {
  for (const d of $$(".doc", sc)) {
    const k = +d.dataset.doc;
    d.classList.add("on");
    $("small", d).textContent =
      k === 0 ? "Profil ma'lumotlaridan tuzilmoqda…" : "Yuklanmoqda…";
    $(".pbar i", d).style.width = "100%";
    await wait(900);
    d.classList.remove("on");
    d.classList.add("ok");
    $("small", d).textContent = DATA.docs[k].s;
    const tag = $(".tag, .up-btn", d);
    tag.outerHTML = `<span class="tag ok pop">${ic("check", 12)} Tayyor</span>`;
  }
}

// the terms of the competition (oferta), shown on vacancy.sud.uz before the Ariza; the acceptance is kept per vacancy
function termsHtml() {
  const items = [
    "O'zbekiston Respublikasining fuqarosi bo'lmagan shaxslar;",
    "o'n olti yoshga to'lmagan shaxslar;",
    "muqaddam korrupsiyaga oid jinoyatlarni sodir etishda sud tomonidan aybdor deb topilgan shaxslar;",
    "notarius, advokat, sudya, huquqni muhofaza qiluvchi yoki boshqa davlat organi faoliyatida nojo'ya xatti-harakatlari uchun lavozimdan bo'shatilgan shaxslar uch yil mobaynida ishga qabul qilish;",
    "qonunchilikda belgilangan tartibda sud tomonidan muomalaga layoqatsiz yoki muomala layoqati cheklangan deb topilgan shaxslar.",
  ];
  return `<div class="oferta" id="oferta">
    <div class="of-card">
      <h3>Tanlovda ishtirok etish tartibi</h3>
      <div class="of-body" id="ofBody">
        <div class="of-warn"><b>DIQQAT!!!</b> Sud organlariga ishga kirish istagida bo'lgan nomzodlarning Oliy sud "vacancy.sud.uz" portali orqali taqdim etilgan shaxsga doir ma'lumotlari "SudHR" elektron platformasida saqlanadi va qayta ishlanadi. Nomzod ushbu ma'lumotlarni belgilangan maqsadlarda qayta ishlashga rozilik bildiradi.</div>
        <p>"vacancy.sud.uz" portali – vakansiyalarni e'lon qilish, nomzodlarni ro'yxatdan o'tkazish, saralash, tanlash va ishga qabul qilish jarayonlarini tizimli tashkil etishga qaratilgan elektron portal.</p>
        <p>"SudHR" elektron platformasi – mehnat munosabatlariga oid xodimlar (nomzodlar)ning ma'lumotlarini yig'ish, saqlash va qayta ishlash hamda kadrlar sohasidagi ish yuritish jarayonlarini kompleks avtomatlashtirish (raqamlashtirish), ushbu sohaga aloqador davlat organlari va tashkilotlari bilan axborot hamkorligini ta'minlashga mo'ljallangan platforma.</p>
        <h4>I. Umumiy qoidalar</h4>
        <p>Sud tizimiga jinsi, irqi, millati, tili, dini, e'tiqodi, ijtimoiy kelib chiqishi va ijtimoiy mavqeidan qat'i nazar, davlat tilini biladigan hamda lavozim uchun belgilangan malaka talablariga muvofiq bo'lgan O'zbekiston Respublikasi fuqarolari qabul qilinishi mumkin.</p>
        <p>Quyidagi shaxslar sud organlariga ishga qabul qilinishi mumkin emas:</p>
        ${items.map((t, k) => `<p class="of-li">${"abcde"[k]}) ${t}</p>`).join("")}
      </div>
      <div class="of-read"><i id="ofBar"></i></div>
      <div class="of-foot"><button class="of-no">Rozi emasman</button><button class="of-yes" id="ofYes" disabled>Tanishdim va roziman</button></div>
      <div class="of-done" id="ofDone"><span class="sc-ic">${ic("check", 18)}</span><b>Rozilik qayd etildi</b><small>Bu vakansiya shartlari qayta so'ralmaydi</small></div>
    </div>
  </div>`;
}

async function runTerms(sc) {
  const btn = $("#sendBtn", sc);
  btn.classList.add("press");
  await wait(300);
  btn.classList.remove("press");
  const of = $("#oferta", sc), body = $("#ofBody", sc), bar = $("#ofBar", sc), yes = $("#ofYes", sc);
  body.scrollTop = 0;
  of.classList.add("on");
  await wait(900);
  // the applicant reads to the end: the text scrolls down, the bar under it fills
  const end = body.scrollHeight - body.clientHeight, n = 60;
  for (let k = 1; k <= n; k++) {
    const t = k / n, e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    body.scrollTop = end * e;
    bar.style.width = t * 100 + "%";
    await wait(40);
  }
  await wait(300);
  yes.disabled = false;
  yes.classList.add("ready");
  await wait(700);
  yes.classList.add("press");
  await wait(250);
  of.classList.add("done");
  await wait(1300);
  of.classList.remove("on", "done");
  yes.classList.remove("press", "ready");
  $("#ofAgreed", sc).classList.add("on");
  toast("Tanlov shartlariga rozilik qayd etildi — endi ariza yuborish mumkin");
}

async function runSend(sc) {
  const btn = $("#sendBtn", sc);
  btn.classList.add("press");
  await wait(300);
  await arizaFx();
  $("#hrPill", sc).classList.add("lit");
  $("#sentCard", sc).classList.add("on");
  toast(
    `Ariza ${DATA.candidate.appNo} inson resurslari boshqarmasining «Kiruvchi» hujjatlariga tushdi`,
  );
}
