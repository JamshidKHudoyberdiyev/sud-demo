// Core: state, step navigation, footer, and the shared animation helpers.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SPEED = REDUCED ? 0.12 : 1;
const wait = (ms) => new Promise((r) => setTimeout(r, ms * SPEED));
const STEPS = [];
const KEY = "sudhr-steps-v2";

// done[stepId] = how many actions of that step were played
const S = { i: 0, busy: false, done: {} };

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ i: S.i, done: S.done }));
  } catch (e) {}
}
function restore() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && typeof v.i === "number") {
      S.i = Math.min(Math.max(v.i, 0), STEPS.length - 1);
      S.done = v.done || {};
    }
  } catch (e) {}
}
const phase = (id) => S.done[id] || 0;

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fmt = (n, dec = 0) => Number(n).toFixed(dec).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
let av = (ini, cls = "") => `<span class="av ${cls}">${esc(ini)}</span>`;

// ---------- animation helpers ----------
function countUp(node, to, { from = 0, dur = 900, dec = 0, suffix = "" } = {}) {
  return new Promise((res) => {
    const d = Math.max(dur * SPEED, 1);
    const t0 = performance.now();
    let fin = false;
    // a throttled frame loop must not stretch the animation: a timer finishes it on time
    const guard = setTimeout(() => {
      fin = true;
      node.textContent = fmt(to, dec) + suffix;
      res();
    }, d + 250);
    const tick = (t) => {
      if (fin) return;
      const k = Math.min((t - t0) / d, 1);
      const e = 1 - Math.pow(1 - k, 3);
      node.textContent = fmt(from + (to - from) * e, dec) + suffix;
      if (k < 1) requestAnimationFrame(tick);
      else {
        fin = true;
        clearTimeout(guard);
        res();
      }
    };
    requestAnimationFrame(tick);
  });
}

async function typeIn(node, text, cps = 70) {
  node.textContent = "";
  node.classList.add("typing");
  const step = text.length > 40 ? 3 : text.length > 20 ? 2 : 1;
  for (let i = 0; i < text.length; i += step) {
    node.textContent = text.slice(0, i + step);
    await wait(1000 / cps);
  }
  node.textContent = text;
  node.classList.remove("typing");
}

// a chip flies from one element to another (both stay in place)
function fly(from, to, html, cls = "") {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const chip = el(`<div class="fly ${cls}">${html}</div>`);
  document.body.appendChild(chip);
  const w = chip.offsetWidth, h = chip.offsetHeight;
  const x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - h / 2;
  const x1 = b.left + b.width / 2 - w / 2, y1 = b.top + b.height / 2 - h / 2;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 80;
  const anim = chip.animate(
    [
      { transform: `translate(${x0}px,${y0}px) scale(.8)`, opacity: 0 },
      { transform: `translate(${x0}px,${y0}px) scale(1)`, opacity: 1, offset: 0.12 },
      { transform: `translate(${mx}px,${my}px) scale(1.06)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${x1}px,${y1}px) scale(.55)`, opacity: 0.2 },
    ],
    { duration: 1100 * SPEED, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" },
  );
  // a stalled animation (background tab) must never block the demo
  const limit = new Promise((r) => setTimeout(r, 1500 * SPEED + 100));
  return Promise.race([anim.finished.catch(() => {}), limit]).then(() => chip.remove());
}

// curved wire between two elements inside an absolutely placed <svg> that covers `host`
function wire(svg, a, b, cls = "") {
  const h = svg.getBoundingClientRect();
  const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
  const left = r1.left < r2.left;
  const x1 = ((left ? r1.right : r1.left) - h.left) / ZOOM, y1 = (r1.top + r1.height / 2 - h.top) / ZOOM;
  const x2 = ((left ? r2.left : r2.right) - h.left) / ZOOM, y2 = (r2.top + r2.height / 2 - h.top) / ZOOM;
  const dx = (x2 - x1) * 0.5;
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`);
  p.setAttribute("class", "wire " + cls);
  svg.appendChild(p);
  const len = p.getTotalLength();
  p.style.setProperty("--len", len);
  return p;
}

async function signFx(owner, title, sub) {
  const box = $("#signFx");
  $("#sgOwner").textContent = owner;
  $("#sgT").textContent = "Imzolanmoqda…";
  $("#sgS").textContent = sub;
  box.className = "signfx on";
  await wait(1500);
  box.classList.add("ok");
  $("#sgT").textContent = title;
  await wait(1000);
  box.className = "signfx";
  await wait(250);
}

function bigOk(title, text) {
  return new Promise((res) => {
    const box = $("#bigOk");
    $("#bigOkT").textContent = title;
    $("#bigOkP").textContent = text;
    box.classList.add("on");
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      box.classList.remove("on");
      box.removeEventListener("click", close);
      setTimeout(res, 250);
    };
    box.addEventListener("click", close);
    setTimeout(close, 2300 * Math.max(SPEED, 0.4));
  });
}

let toastT;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("on"), 2600);
}

// ---------- screen fit ----------
// On a smaller screen or a projector the step window is zoomed out a little, like browser zoom,
// so the whole step fits; whatever is still taller is followed by scrolling while an action plays.
const ZMIN = 0.8;
let ZOOM = 1;

// height the step wants at zoom 1: for a site window, its chrome plus the full page
function needOf(box, isFramed) {
  const page = isFramed && $(".hr-page, .vac-page", box);
  return page ? box.offsetHeight - page.clientHeight + page.scrollHeight : box.scrollHeight;
}

// the finished state is often taller, so it is measured too, off screen
function finalNeed(scene, s) {
  const last = s.actions.length;
  if (!last || phase(s.id) >= last) return 0;
  const fr = typeof s.frame === "function" ? s.frame(last) : s.frame;
  const g = document.createElement("div");
  g.className = scene.className;
  g.style.cssText = `position:fixed;left:-10000px;top:0;visibility:hidden;width:${scene.offsetWidth}px;height:${scene.offsetHeight}px`;
  g.innerHTML = framed(fr, s.render(last));
  document.body.appendChild(g);
  const n = g.firstElementChild ? needOf(g.firstElementChild, !!fr) : 0;
  g.remove();
  return n;
}

function fitScene(scene, s, isFramed) {
  ZOOM = 1;
  const box = scene.firstElementChild;
  if (!box) return;
  const cs = getComputedStyle(scene);
  const w = scene.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = scene.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const need = Math.max(needOf(box, isFramed), finalNeed(scene, s));
  if (need <= h + 1) return;
  ZOOM = Math.max(ZMIN, Math.floor((h / need) * 100) / 100);
  box.style.zoom = ZOOM;
  box.style.width = w / ZOOM + "px";
  if (isFramed) {
    box.style.height = h / ZOOM + "px";
    box.style.minHeight = "0";
  }
}

// while an action plays, keep the part that changes in view
function follow(scene) {
  let target = null, timer = 0, lastAt = 0;
  const go = () => {
    timer = 0;
    const n = target;
    target = null;
    if (!n || !n.isConnected) return;
    const box = n.closest(".hr-page, .vac-page") || scene;
    const b = box.getBoundingClientRect(), r = n.getBoundingClientRect();
    const pad = 28;
    if (!r.height || r.height > b.height - pad * 2) return;
    let dy = 0;
    if (r.top < b.top + pad) dy = r.top - b.top - pad;
    else if (r.bottom > b.bottom - pad) dy = r.bottom - b.bottom + pad;
    if (!dy) return;
    lastAt = performance.now();
    box.scrollBy({ top: box === scene ? dy : dy / ZOOM, behavior: "smooth" });
  };
  const mo = new MutationObserver((recs) => {
    for (const m of recs) {
      const nodes = m.type === "attributes" ? [m.target] : [...m.addedNodes];
      for (const n of nodes) if (n.nodeType === 1 && !n.closest("svg, .hr-side") && !n.classList.contains("ripple")) target = n;
    }
    if (target && !timer) timer = setTimeout(go, Math.max(120, 520 - (performance.now() - lastAt)));
  });
  mo.observe(scene, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  return () => {
    mo.disconnect();
    clearTimeout(timer);
  };
}

// ---------- navigation ----------
const CHAPTERS = [
  { n: 1, t: "Tanlov va ishga qabul" },
  { n: 2, t: "Viloyat va nazorat" },
];
const chOf = (i) => STEPS[i].ch || 1;
// position of step i inside its chapter, 1-based
const noInCh = (i) => STEPS.slice(0, i + 1).filter((s) => (s.ch || 1) === chOf(i)).length;

function renderHeader() {
  const ch = chOf(S.i);
  $("#chaps").innerHTML = CHAPTERS.map((c) => {
    const first = STEPS.findIndex((s) => (s.ch || 1) === c.n);
    return `<button class="chp ${c.n === ch ? "on" : ""}" data-go="${first}" ${S.busy ? "disabled" : ""}><b>${c.n}-qism</b><span>${esc(c.t)}</span></button>`;
  }).join("");
  $("#steps").innerHTML = STEPS.map((s, i) => {
    if ((s.ch || 1) !== ch) return "";
    const full = phase(s.id) >= s.actions.length && s.actions.length;
    const cls = i === S.i ? "on" : full ? "done" : "";
    return `<button class="st ${cls}" data-go="${i}" ${S.busy ? "disabled" : ""}><i>${full && i !== S.i ? ic("check", 13) : noInCh(i)}</i><span>${esc(s.short)}</span></button>`;
  }).join("");
  // on a narrow screen the stepper scrolls: keep the current step in the middle
  const bar = $("#steps"), on = $(".st.on", bar);
  if (on) {
    const b = bar.getBoundingClientRect(), r = on.getBoundingClientRect();
    bar.scrollLeft += r.left + r.width / 2 - (b.left + b.width / 2);
  }
}

function renderFooter() {
  const s = STEPS[S.i];
  const p = phase(s.id);
  const a = s.actions[p];
  const act = $("#actBtn");
  act.hidden = !a;
  if (a) act.innerHTML = `${ic(a.icon || "play", 17)}<span>${esc(a.label)}</span>`;
  act.disabled = S.busy;
  act.classList.toggle("pulse", !!a && !S.busy);
  $("#backBtn").disabled = S.busy || S.i === 0;
  const next = $("#nextBtn");
  next.disabled = S.busy || S.i === STEPS.length - 1;
  next.classList.toggle("pulse", !a && !S.busy && S.i < STEPS.length - 1);
  $("#resetBtn").disabled = S.busy;
  $("#counter").textContent = `${S.i + 1} / ${STEPS.length}`;
}

function show(i) {
  if (S.busy) return;
  S.i = Math.min(Math.max(i, 0), STEPS.length - 1);
  const s = STEPS[S.i];
  $("#stepNo").textContent = `${chOf(S.i)}.${noInCh(S.i)}`;
  $("#title").textContent = s.title;
  $("#lead").textContent = s.lead;
  const a = s.actor;
  // an actor with `sub` is drawn like the SudHR profile card: name, position, department
  $("#actor").innerHTML = !a
    ? ""
    : a.sub
      ? `${av(a.ini, a.tone || "")}<div><b>${esc(a.name)}</b><small>${esc(a.role)}</small><small class="a-sub">${esc(a.sub)}</small></div>`
      : `${av(a.ini, a.tone || "")}<div><small>${esc(a.role)}</small><b>${esc(a.name)}</b></div>`;
  const scene = $("#scene");
  scene.className = "scene enter";
  const fr = typeof s.frame === "function" ? s.frame(phase(s.id)) : s.frame;
  scene.classList.toggle("framed", !!fr);
  scene.innerHTML = framed(fr, s.render(phase(s.id)));
  paintIcons(scene);
  fitScene(scene, s, !!fr);
  if (s.mount) s.mount(scene, phase(s.id));
  requestAnimationFrame(() => requestAnimationFrame(() => scene.classList.remove("enter")));
  renderHeader();
  renderFooter();
  save();
}

async function act() {
  const s = STEPS[S.i];
  const p = phase(s.id);
  const a = s.actions[p];
  if (!a || S.busy) return;
  S.busy = true;
  renderHeader();
  renderFooter();
  const scene = $("#scene"), box0 = scene.firstElementChild;
  const unfollow = follow(scene);
  try {
    await a.run(scene);
    S.done[s.id] = p + 1;
    save();
    // an action that swaps the whole window (login -> dashboard) needs a fresh fit
    if (scene.firstElementChild !== box0) {
      const fr = typeof s.frame === "function" ? s.frame(phase(s.id)) : s.frame;
      fitScene(scene, s, !!fr);
    }
  } catch (e) {
    console.error(e);
  } finally {
    unfollow();
    S.busy = false;
    renderHeader();
    renderFooter();
  }
}

function resetAll() {
  if (S.busy) return;
  S.done = {};
  show(0);
  toast("Namoyish boshidan boshlandi");
}
