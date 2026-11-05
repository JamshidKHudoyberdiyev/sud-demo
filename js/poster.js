// Opening poster: stands on screen while people gather; the first press of the remote opens the demo.
(function () {
  const facts = [
    ["14", "hudud"],
    ["16", "ta tizim bilan integratsiya"],
    ["E-IMZO", "elektron imzo"],
  ];
  const poster = el(`<section class="poster" id="poster" aria-label="SudHR">
    <i class="po-glow g1"></i><i class="po-glow g2"></i><i class="po-grid"></i>
    <div class="po-org"><img src="assets/OLIY-SUD-LOGO.svg" alt="" /><span>O'zbekiston Respublikasi Oliy sudi</span></div>
    <div class="po-mid">
      <img class="po-logo" src="assets/logo-poster.svg" alt="SudHR" />
      <h1>«SudHR» elektron platformasi</h1>
    </div>
    <ul class="po-facts">${facts.map(([v, t]) => `<li><b>${v}</b><span>${t}</span></li>`).join("")}</ul>
    <small class="po-hint">Boshlash uchun pultni yoki Enter tugmasini bosing</small>
  </section>`);

  let open = false;
  function showPoster() {
    open = true;
    poster.classList.remove("off");
    document.body.appendChild(poster);
    // restart the entrance animation
    poster.classList.remove("in");
    void poster.offsetWidth;
    poster.classList.add("in");
  }
  function hidePoster() {
    if (!open) return;
    open = false;
    poster.classList.add("off");
    setTimeout(() => {
      if (!open) poster.remove();
    }, 700 * SPEED);
  }

  // while the poster is up the keys open it, they must not also start the first step
  document.addEventListener(
    "keydown",
    (e) => {
      if (!open || e.key === "f" || e.key === "F") return;
      e.stopPropagation();
      e.preventDefault();
      if (["Enter", " ", "ArrowRight", "PageDown"].includes(e.key)) hidePoster();
    },
    true,
  );
  poster.addEventListener("click", hidePoster);
  $("#resetBtn").addEventListener("click", () => {
    if (!S.busy) showPoster();
  });

  // a demo that resumes mid-way goes straight on
  if (S.i === 0 && !phase(STEPS[0].id)) showPoster();
})();
