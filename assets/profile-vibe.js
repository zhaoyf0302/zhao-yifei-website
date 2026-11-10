(() => {
  const section = document.querySelector("#profile-vibe");
  if (!section) return;

  const stage = section.querySelector(".vibe-stage");
  const character = stage.querySelector(".vibe-character");
  const portrait = stage.querySelector(".vibe-portrait");
  const canvas = stage.querySelector(".vibe-eyes");
  const eye = stage.querySelector(".vibe-prop--eye");
  const pixel = stage.querySelector(".vibe-prop--pixel");
  const play = section.querySelector(".vibe-play");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 5;
  const clamp = (x) => Math.min(1, Math.max(0, x));
  const ease = (t, a, b) => {
    const x = clamp((t - a) / (b - a));
    return x * x * (3 - 2 * x);
  };

  let drawEyes = () => {};
  let time = 0;
  let last = null;
  let raf = 0;
  let visible = false;
  let ready = false;
  let paused = false;
  let failed = false;

  function prop(img, t, starts, sway) {
    const p = ease(t, starts, starts + .32);
    const bounce = Math.sin(p * Math.PI) * (1 - p);
    img.style.setProperty("--vibe-show", p);
    img.style.setProperty("--vibe-rise", `${15 * (1 - p) - bounce * 25}%`);
    img.style.setProperty("--vibe-scale", .64 + .36 * p + .25 * bounce);
    img.style.setProperty("--vibe-spin", `${sway * (1 - p) + sway * bounce}deg`);
  }

  function paint(t) {
    const right = ease(t, .52, .85) - ease(t, 1.56, 1.87);
    const left = ease(t, 1.91, 2.27) - ease(t, 2.78, 3.16);
    const gaze = right - left;
    character.style.setProperty("--vibe-lift", `${5.5 * (1 - ease(t, 0, .5))}%`);
    character.style.setProperty("--vibe-tilt", `${gaze * .94}deg`);
    drawEyes(-gaze); // Source coordinates are flipped by the mirrored character layer.
    prop(eye, t, .16, 13);
    prop(pixel, t, 1.72, -9);
  }

  function shouldRun() {
    return ready && visible && !paused && !document.hidden && !reduce.matches && time < duration;
  }

  function sync() {
    if (shouldRun()) {
      if (!raf) raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      last = null;
    }
    play.hidden = !ready || reduce.matches;
    play.firstChild.textContent = time >= duration ? "重播动画 " : (paused ? "继续播放 " : "暂停动画 ");
  }

  function tick(now) {
    raf = 0;
    if (!shouldRun()) return sync();
    if (last !== null) time = Math.min(duration, time + (now - last) / 1000);
    last = now;
    paint(time);
    if (time < duration) raf = requestAnimationFrame(tick);
    else sync();
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .58;
    section.classList.toggle("is-onstage", visible);
    sync();
  }, {threshold: [.58]});
  observer.observe(stage);

  play.addEventListener("click", () => {
    if (time >= duration) {
      time = 0;
      paused = false;
      paint(0);
    } else {
      paused = !paused;
    }
    sync();
  });

  reduce.addEventListener("change", () => {
    paint(reduce.matches || failed ? duration : time);
    sync();
  });
  document.addEventListener("visibilitychange", sync);

  paint(reduce.matches ? duration : 0);
  Promise.all([portrait, eye, pixel].map((image) => image.decode())).then(() => {
    try {
      drawEyes = window.createAvatarGaze(portrait, canvas);
    } catch {
      // Local file previews may restrict pixel reads. Keep the original image visible.
      canvas.width = 0;
    }
    ready = true;
    sync();
  }, () => {
    failed = true;
    paint(duration);
  });
})();
