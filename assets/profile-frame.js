(() => {
  const section = document.querySelector("#profile-frame");
  if (!section) return;
  const frame = section.querySelector(".identity-window");
  const figure = section.querySelector(".identity-portrait");
  const poster = section.querySelector(".identity-poster");
  const canvas = section.querySelector(".identity-canvas");
  const replay = section.querySelector(".identity-replay");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const meshes = window.ClayAvatarMeshes;
  const poses = meshes?.maskPoses;
  const angles = meshes?.angles;
  const clamp = (x, min = 0, max = 1) => Math.max(min, Math.min(max, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };
  const centers = poses?.map((pose) => {
    const eyes = meshes.eyeRig[pose];
    return pose === "front" ? [4, 5].map((n) => (eyes[0][n] + eyes[1][n]) / 2) : eyes.at(-1).slice(4, 6);
  });
  const load = async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return image;
  };

  let draw;
  let drawn = false;
  let loading = false;
  let failed = false;
  let visible = false;
  let near = false;
  let time = 0;
  let raf = 0;
  let last = null;
  let pointer = null;
  let lookX = 0;
  let lookY = 0;
  let strength = 0;
  const duration = 2;

  function localTextures() {
    if (window.ClayAvatarLocalTextures) return Promise.resolve(window.ClayAvatarLocalTextures);
    const url = new URL("local-textures.js", poster.src).href;
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find((script) => script.src === url);
      const script = existing || document.createElement("script");
      script.addEventListener("load", () => resolve(window.ClayAvatarLocalTextures), {once: true});
      script.addEventListener("error", reject, {once: true});
      if (!existing) {
        script.src = url;
        document.head.append(script);
      }
    });
  }

  async function prepare() {
    if (!near || draw || loading || failed || motion.matches || !window.ClayAvatar || !poses?.length) return;
    loading = true;
    try {
      const local = location.protocol === "file:" ? await localTextures() : null;
      const [images, mask, eyeMask] = await Promise.all([
        Promise.all(poses.map((pose) => load(local?.[pose] ?? new URL(`${pose}.jpg`, poster.src).href))),
        load(meshes.mask),
        load(meshes.eyeMask),
      ]);
      draw = window.ClayAvatar.createAvatarRenderer(canvas, images, poses, meshes, mask, eyeMask);
      sync();
    } catch {
      failed = true;
    } finally {
      loading = false;
    }
  }

  function sync() {
    const active = Boolean(draw && !motion.matches);
    section.classList.toggle("is-animated", active && drawn);
    replay.hidden = !active;
    if (active && visible && !document.hidden) schedule();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
      last = null;
    }
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function paint(now) {
    raf = 0;
    if (!draw || !visible || motion.matches || document.hidden) return sync();
    const delta = last === null ? 1 / 60 : Math.min(.05, (now - last) / 1000);
    last = now;
    time = Math.min(duration, time + delta);
    const turn = ease((time - .26) / 1.30);
    const yaw = 74 * turn;
    const upper = angles.findIndex((angle) => angle > yaw);
    const i = upper < 0 ? angles.length - 2 : Math.max(0, upper - 1);
    const from = poses[i];
    const to = poses[i + 1];
    const blend = (yaw - angles[i]) / (angles[i + 1] - angles[i]);
    const box = figure.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.65, 1050 / box.width);
    const width = Math.round(box.width * ratio);
    const height = Math.round(box.height * ratio);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const baseSize = Math.min(box.height * 1.04, box.width * 1.44);
    const size = baseSize * (1 + .18 * turn);
    const x = box.width * (.50 + .035 * turn);
    const y = box.height * (.455 + .067 * turn);
    const [aX, aY] = centers[i], [bX, bY] = centers[i + 1];
    const eyeX = box.right - (x + size * (lerp(aX, bX, blend) - .50));
    const eyeY = box.top + y + size * (lerp(aY, bY, blend) - .43);
    const targetX = pointer ? clamp((eyeX - pointer.x) / (box.width * .44), -1, 1) : 0;
    const targetY = pointer ? clamp((pointer.y - eyeY) / (box.height * .42), -1, 1) : 0;
    const follow = 1 - Math.exp(-delta / .065);
    lookX = lerp(lookX, targetX, follow);
    lookY = lerp(lookY, targetY, follow);
    strength = lerp(strength, pointer ? 1 : 0, follow);
    draw({
      from, to, blend,
      x: (x + 4 * lookX) * ratio,
      y: (y + 2 * lookY) * ratio,
      size: size * ratio,
      roll: -.019 * turn + .014 * lookX,
      lookX: lookX * .014, lookY: lookY * .009, gazeStrength: strength,
      blink: 0, shade: .11 * turn,
    });
    if (!drawn) {
      drawn = true;
      section.classList.add("is-animated");
    }

    if (time < duration || Math.abs(lookX - targetX) + Math.abs(lookY - targetY) > .005 ||
        Math.abs(strength - Number(Boolean(pointer))) > .005) schedule();
    else last = null;
  }

  new IntersectionObserver(([entry]) => {
    near = entry.isIntersecting;
    prepare();
  }, {rootMargin: "280px"}).observe(frame);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .48;
    section.classList.toggle("is-onstage", visible);
    sync();
  }, {threshold: .48}).observe(frame);
  frame.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointer = {x: event.clientX, y: event.clientY};
    sync();
  }, {passive: true});
  const resetPointer = () => { pointer = null; sync(); };
  frame.addEventListener("pointerleave", resetPointer);
  window.addEventListener("blur", resetPointer);
  window.addEventListener("resize", sync, {passive: true});
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", () => {
    prepare();
    sync();
  });
  replay.addEventListener("click", () => {
    time = 0;
    last = null;
    sync();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    draw = null;
    drawn = false;
    failed = true;
    sync();
  });
  canvas.addEventListener("webglcontextrestored", () => {
    failed = false;
    prepare();
  });
})();
