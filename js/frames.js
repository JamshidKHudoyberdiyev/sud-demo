// Window frames that copy the look of the real sites: the SudHR admin shell and vacancy.sud.uz.

// SudHR sidebar, same sections and order as the live system
const HR_MENU = [
  ["ASOSIY MENYU", [
    ["docs", "file", "Mening hujjatlarim", 8],
    ["boshqarish", "settings", "Boshqarish"],
    ["xodimlar", "users", "Xodimlar"],
    ["shtat", "building", "Tuzilma va shtat"],
  ]],
  ["HUJJATLAR JURNALI", [
    ["ariza", "clipboard", "Ariza va buyruqlar"],
    ["shartnoma", "clipboard", "Shartnoma va guvohnomalar"],
    ["tatil", "clipboard", "Ta'til va xizmat safari"],
    ["malumot", "clipboard", "Xodimlar ma'lumoti"],
    ["intizom", "clipboard", "Intizom va rag'batlantirish"],
    ["turniket", "clipboard", "Turniket"],
    ["reyestr", "clipboard", "Reyestrlar va hisobotlar"],
  ]],
  ["MA'LUMOTNOMA", [
    ["tanlov", "folder", "Tanlov"],
    ["buyruqlar", "folder", "Buyruqlar va hujjatlar"],
    ["tashkilot", "folder", "Tashkilotlar va hududlar"],
  ]],
];

function browserBar(url) {
  const [host, ...rest] = url.split("/");
  return `<div class="b-bar"><i></i><i></i><i></i><span class="b-url">${ic("lock", 12)}<b>${esc(host)}</b>${rest.length ? "/" + esc(rest.join("/")) : ""}</span></div>`;
}

function hrFrame(f, user, body) {
  const side = HR_MENU.map(([t, items]) => `<div class="hs-sec">${t}</div>${items.map(([k, i, n, badge]) => `<div class="hs-it ${k === f.menu ? "on" : ""}">${ic(i, 17)}<span>${n}</span>${badge ? `<em>${badge}</em>` : ic("chevron", 13, "chev")}</div>`).join("")}`).join("");
  const crumbs = ["Menyu", ...f.crumbs].map((c, k, a) => `<span class="${k === a.length - 1 ? "cur" : ""}">${esc(c)}</span>`).join(ic("chevron", 12, "sep"));
  return `<div class="app hr-app">
    ${browserBar("sudhr.sud.uz/" + f.url)}
    <div class="hr-shell">
      <aside class="hr-side"><img class="hs-logo" src="assets/kadr.svg" alt="KADRSUDUZ" /><div class="hs-menu">${side}</div><div class="hs-foot">${ic("panel", 15)} Menyuni yig'ish</div></aside>
      <div class="hr-main">
        <div class="hr-top">
          <span class="ht-ic">${ic("panel", 16)}</span><span class="ht-ic">${ic("home", 15)}</span>
          <nav class="ht-crumbs">${crumbs}</nav>
          <span class="ht-pop">${ic("grid", 14)} Ommabop arizalar</span>
          <span class="ht-bell">${ic("bell", 17)}<em>8</em></span>
          <span class="ht-lang">${ic("globe", 14)} O'zbek (Lotin)</span>
          <span class="ht-user"><i>${esc(user.name[0])}</i>${esc(user.short || user.name.toUpperCase())}</span>
        </div>
        <div class="hr-page">
          ${f.page ? `<div class="hp-h"><h2>${esc(f.page)}</h2>${f.sub ? `<small>${esc(f.sub)}</small>` : ""}</div>` : ""}
          ${body}
        </div>
      </div>
    </div>
  </div>`;
}

function vacFrame(f, body) {
  const user = f.user
    ? `<span class="vn-bell">${ic("bell", 15)}<i></i></span><span class="vn-av">${av(DATA.candidate.ini, "sm cand")}</span>`
    : `<span class="vn-login">${ic("lock", 13)} KIRISH</span>`;
  return `<div class="app vac-app">
    ${browserBar("vacancy.sud.uz/" + f.url)}
    <div class="vac-nav">
      <span class="vn-logo">${ic("users", 18)}<b>VACANCY</b>SUDUZ</span>
      <nav><span>BOSH SAHIFA</span><span class="on">VAKANSIYALAR</span><span>BOG'LANISH</span></nav>
      <div class="vn-r">${user}</div>
    </div>
    <div class="vac-page">${body}</div>
  </div>`;
}

// show() calls this: steps with a `frame` are drawn inside the matching site window
function framed(f, html) {
  if (!f) return html;
  if (f.type === "vac") return vacFrame(f, html);
  const user = f.user || DATA.hr;
  return hrFrame(f, user, html);
}
