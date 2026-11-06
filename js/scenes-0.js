// Chapter 1, step 0: signing in to SudHR with an ERI key, as on the live login page.
STEPS.push({
  id: "login",
  short: "Kirish",
  title: "SudHR tizimiga kirish",
  lead: "Kadrlar xodimi tizimga elektron raqamli imzo (ERI) kaliti bilan kiradi: parol yo'q, kirish shaxsan tasdiqlanadi.",
  actor: { ini: DATA.hr.ini, name: DATA.hr.short, role: DATA.hr.role, sub: DATA.hr.dept },
  actions: [{ label: "ERI kaliti bilan kirish", icon: "key", run: runLogin }],
  render(p) {
    const done = p >= 1;
    return `<div class="app login-app" id="loginApp">
      ${browserBar("sudhr.sud.uz/login")}
      <div class="lg-wrap">
        <section class="lg-brand">
          <div class="lg-org"><img src="assets/OLIY-SUD-LOGO.svg" alt="" /><span>O'zbekiston Respublikasi Oliy sudi</span></div>
          <div class="lg-mid">
            <img class="lg-logo" src="assets/logo.svg" alt="SudHR" />
            <h2>O'zbekiston Respublikasi Oliy sudining «SudHR» elektron platformasi</h2>
            <p>Xodimlar, hujjatlar va ichki jarayonlarni yagona elektron muhitda tez va qulay boshqarish.</p>
            <ul><li><span>${ic("shield", 16)}</span>Xavfsiz kirish</li><li><span>${ic("chart", 16)}</span>Tezkor nazorat</li><li><span>${ic("sparkles", 16)}</span>Qulay interfeys</li></ul>
          </div>
          <small>© 2026 O'zbekiston Respublikasi Oliy sudi</small>
        </section>
        <section class="lg-form">
          <span class="lg-lang">${ic("globe", 14)} O'zbek (Lotin)</span>
          <div class="lg-card" id="lgCard">
            <h3>Tizimga kirish</h3>
            <p>Davom etish uchun hisobingizga kiring</p>
            <div class="lg-tabs"><span class="${done ? "" : "on"}" data-t="pw">${ic("key", 13)} Login va parol</span><span class="${done ? "on" : ""}" data-t="eri">${ic("pen", 13)} ERI kaliti</span><span>${ic("shield", 13)} OneID</span></div>
            <div class="lg-pane ${done ? "" : "on"}" data-p="pw">
              <label>Foydalanuvchi nomi (login)</label><div class="lg-inp">${ic("user", 15)}<span class="muted">Login</span></div>
              <label>Parol</label><div class="lg-inp">${ic("lock", 15)}<span class="muted">••••••••</span></div>
              <div class="lg-btn">Kirish</div>
            </div>
            <div class="lg-pane ${done ? "on" : ""}" data-p="eri">
              <small class="lg-hint">Kompyuterga ulangan ERI kalitini tanlang</small>
              <div class="eri-key ${done ? "sel" : ""}" id="eriKey">
                <div class="ek-h"><b>${esc(DATA.hr.name.toUpperCase())}</b><span class="tag ok">Amal qiladi</span></div>
                <p><span>JShShIR:</span> 3 0104 8* *** ** **</p>
                <p><span>Sertifikat:</span> 7A3F…91C2 · 2025–2027</p>
              </div>
              <div class="lg-ok ${done ? "on" : ""}" id="lgOk">${ic("check", 16)} Kalit tasdiqlandi — tizimga kirildi</div>
            </div>
          </div>
        </section>
      </div>
    </div>`;
  },
});

async function runLogin(sc) {
  const tabs = $$(".lg-tabs span", sc);
  tabs[0].classList.remove("on");
  tabs[1].classList.add("on");
  $('[data-p="pw"]', sc).classList.remove("on");
  const eri = $('[data-p="eri"]', sc);
  eri.classList.add("on", "loading");
  await wait(900);
  eri.classList.remove("loading");
  const key = $("#eriKey", sc);
  key.classList.add("pop");
  await wait(600);
  key.classList.add("sel");
  await signFx(`${DATA.hr.short} · ERI kaliti`, "Shaxs tasdiqlandi", "Kirish so'rovi imzolanmoqda");
  $("#lgOk", sc).classList.add("on");
  await wait(500);
}
