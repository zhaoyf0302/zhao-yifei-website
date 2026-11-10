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

  function prepareEyes() {
    const landmarks = portrait.dataset.eyes?.split(";").map((eye) => eye.split(",").map(Number));
    if (!landmarks?.length) return;
    canvas.width = portrait.naturalWidth;
    canvas.height = portrait.naturalHeight;
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    if (!ctx) return;
    ctx.drawImage(portrait, 0, 0);
    const patches = landmarks.map(([cx, cy, rx, ry, slope]) => {
      const x = Math.floor(cx - rx - 5);
      const y = Math.floor(cy - ry - Math.abs(slope * rx) - 4);
      const w = Math.ceil(2 * rx + 11);
      const h = Math.ceil(2 * (ry + Math.abs(slope * rx)) + 9);
      return {cx, cy, rx, ry, slope, x, y, w, h, src: ctx.getImageData(x, y, w, h), dst: ctx.createImageData(w, h)};
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move the photographed eye detail inside its opening. The displacement falls
    // to zero at the lids, leaving the outline, brows and skin in place.
    let previous = 0;
    drawEyes = (gaze) => {
      if (Math.abs(gaze - previous) < .003 && gaze !== 0) return;
      if (!gaze && !previous) return;
      previous = gaze;
      for (const {cx, cy, rx, ry, slope, x, y, w, h, src, dst} of patches) {
        if (!gaze) {
          ctx.clearRect(x, y, w, h);
          continue;
        }
        for (let row = 0; row < h; row++) {
          for (let col = 0; col < w; col++) {
            const px = col + x - cx;
            const py = row + y - cy - px * slope;
            const radius = (px / rx) ** 2 + (py / ry) ** 2;
            const falloff = 1 - ease(radius, .18, 1);
            const sx = col - gaze * rx * .23 * falloff;
            const a = Math.floor(sx);
            const mix = sx - a;
            const target = (row * w + col) * 4;
            const source = (row * w + a) * 4;
            for (let c = 0; c < 3; c++) {
              dst.data[target + c] = mix
                ? src.data[source + c] * (1 - mix) + src.data[source + 4 + c] * mix
                : src.data[source + c];
            }
            dst.data[target + 3] = src.data[target + 3];
          }
        }
        ctx.putImageData(dst, x, y);
      }
    };
  }

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
      prepareEyes();
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
