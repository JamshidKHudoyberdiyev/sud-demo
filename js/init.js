// Wiring: buttons, keyboard, resize; starts the demo.
paintIcons();
restore();

// stepper, chapter switch and in-scene links all jump with data-go
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-go]");
  if (b && !b.disabled) show(+b.dataset.go);
});
$("#backBtn").addEventListener("click", () => show(S.i - 1));
$("#nextBtn").addEventListener("click", () => show(S.i + 1));
$("#actBtn").addEventListener("click", act);
$("#resetBtn").addEventListener("click", resetAll);

function toggleFs() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } catch (e) {}
}
$("#fsBtn").addEventListener("click", toggleFs);

function advance() {
  const s = STEPS[S.i];
  if (s.actions[phase(s.id)]) act();
  else show(S.i + 1);
}

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, select")) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    // Shift skips the remaining actions of the step
    if (e.shiftKey) show(S.i + 1);
    else advance();
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    show(S.i - 1);
  } else if (e.key === "Enter" || e.key === " ") {
    if (e.target.closest("button") && e.target !== $("#actBtn")) return;
    e.preventDefault();
    advance();
  } else if (e.key === "f" || e.key === "F") toggleFs();
  else if (e.key === "Home") show(0);
});

// wires are measured from the layout, so redraw the scene after a resize
let rsT;
window.addEventListener("resize", () => {
  clearTimeout(rsT);
  rsT = setTimeout(() => {
    if (!S.busy) show(S.i);
  }, 200);
});

show(S.i);
// the demo remembers where it stopped; say so, so a fresh run is not started mid-way by surprise
if (S.i > 0) toast(`${S.i + 1}-bosqichdan davom etildi · boshidan: «Qaytadan»`);
