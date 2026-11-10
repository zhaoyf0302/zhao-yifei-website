(() => {
  const story = document.querySelector("#avatar-story");
  const stage = story.querySelector(".avatar-stage");
  const opening = story.querySelector(".avatar-opening");
  const resume = story.querySelector(".avatar-resume");
  const heading = resume.querySelector("h2");
  const items = Array.from(resume.querySelectorAll(".avatar-resume-list > div"));
  const jump = opening.querySelector(".avatar-link");
  const canvas = stage.querySelector("canvas");
  const poster = stage.querySelector(".avatar-poster");
  const nav = document.querySelector(".topbar");
  const compact = window.matchMedia("(max-width: 740px)");
  const still = window.matchMedia("(prefers-reduced-motion: reduce), (max-height: 480px)");
  const meshes = window.ClayAvatarMeshes;
  const poses = meshes?.maskPoses ?? [];
  const angles = meshes?.angles ?? [];
  const gazePoints = Object.fromEntries(poses.map((pose) => {
    const eyes = meshes.eyeRig[pose];
    const anchor = pose === "front" ? eyes : eyes.slice(-1);
    return [pose, [4, 5].map((i) => anchor.reduce((sum, eye) => sum + eye[i], 0) / anchor.length)];
  }));
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (value, start, end) => {
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };

  // Landmarks read from the supplied clip: seconds, head yaw, zoom,
  // horizontal shift (viewport widths), and vertical shift (viewport heights).
  // Continue the same shot through the edit near 11.5s.
  const cameraKeys = [
    [7.60,  0, .00,  .000,  .000],
    [8.20,  0, .00,  .000,  .000],
    [8.37,  2, .03,  .012,  .006],
    [8.50, 12, .30,  .090,  .043],
    [8.61, 28, .61, -.022,  .018],
    [8.80, 43, .86, -.126, -.030],
    [9.62, 46, .86, -.130, -.030],
    [9.88, 51, .89, -.132, -.041],
    [10.23, 68, .96, -.133, -.061],
    [10.50, 73, 1.0, -.133, -.068],
    [11.40, 75, 1.0, -.130, -.068],
  ];
  const turnStart = (8.37 - 7.60) / 3.80;
  const turnEnd = (8.80 - 7.60) / 3.80;
  const cameraSlopes = cameraKeys.map(([time, ...values], i) => values.map((value, channel) => {
    if (i === 0 || i === cameraKeys.length - 1) return 0;
    const prev = cameraKeys[i - 1];
    const next = cameraKeys[i + 1];
    const before = time - prev[0];
    const after = next[0] - time;
    const left = (value - prev[channel + 1]) / before;
    const right = (next[channel + 1] - value) / after;
    if (left * right <= 0) return 0;
    const wLeft = 2 * after + before;
    const wRight = after + 2 * before;
    return (wLeft + wRight) / (wLeft / left + wRight / right);
  }));

  function sampleCamera(time) {
    const next = cameraKeys.findIndex(([keyTime]) => keyTime > time);
    if (next < 0) return cameraKeys.at(-1).slice(1);
    const i = Math.max(0, next - 1);
    const [aTime, ...a] = cameraKeys[i];
    const [bTime, ...b] = cameraKeys[next];
    const duration = bTime - aTime;
    const t = clamp((time - aTime) / duration);
    const t2 = t * t;
    const t3 = t2 * t;
    return a.map((value, c) =>
      (2 * t3 - 3 * t2 + 1) * value +
      (t3 - 2 * t2 + t) * duration * cameraSlopes[i][c] +
      (-2 * t3 + 3 * t2) * b[c] +
      (t3 - t2) * duration * cameraSlopes[next][c]
    );
  }

  let drawAvatar = null;
  let images = null;
  let distanceImage = null;
  let eyeOpeningImage = null;
  let loading = false;
  let unavailable = false;
  let raf = 0;
  let lastTime = 0;
  let pointer = null;
  let lookX = 0;
  let lookY = 0;
  let eyeLookX = 0;
  let eyeLookY = 0;
  let gazeStrength = 0;
  let progress = 0;
  let velocity = 0;
  let initialPosition = true;
  let focusResume = false;
  const loadImage = async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return image;
  };

  function loadLocalTextures() {
    // Local files have opaque origins in WebGL. The portable bundle supplies data URLs.
    if (window.ClayAvatarLocalTextures) return Promise.resolve(window.ClayAvatarLocalTextures);
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL("local-textures.js", poster.src).href;
      script.onload = () => resolve(window.ClayAvatarLocalTextures);
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function setInteractive(active) {
    story.classList.toggle("is-interactive", active);
    if (!active) {
      opening.inert = false;
      resume.inert = false;
      focusResume = false;
    }
    schedule();
  }

  async function syncMotion() {
    if (still.matches || unavailable || !window.ClayAvatar || poses.length < 2) {
      setInteractive(false);
      return;
    }
    if (drawAvatar) {
      setInteractive(true);
      return;
    }
    if (loading) return;
    loading = true;
    try {
      if (!images) {
        if (location.protocol === "file:") {
          const local = await loadLocalTextures();
          images = await Promise.all(poses.map((pose) => loadImage(local[pose])));
        } else {
          await poster.decode();
          images = [poster, ...await Promise.all(poses.slice(1).map((pose) =>
            loadImage(new URL(`${pose}.jpg`, poster.src).href),
          ))];
        }
      }
      [distanceImage, eyeOpeningImage] = await Promise.all([
        distanceImage || (meshes?.mask ? loadImage(meshes.mask).catch(() => null) : null),
        eyeOpeningImage || (meshes?.eyeMask ? loadImage(meshes.eyeMask).catch(() => null) : null),
      ]);
      if (still.matches) return;
      drawAvatar = window.ClayAvatar.createAvatarRenderer(canvas, images, poses, meshes, distanceImage, eyeOpeningImage);
      initialPosition = true;
      setInteractive(true);
    } catch {
      unavailable = true;
      setInteractive(false);
    } finally {
      loading = false;
    }
  }

  function paint(time) {
    raf = 0;
    const stageBox = stage.getBoundingClientRect();
    const top = nav.getBoundingClientRect().bottom;
    const onstage = stageBox.bottom > top + 130 && stageBox.top < window.innerHeight - 130;
    story.classList.toggle("is-onstage", onstage);
    if (!story.classList.contains("is-interactive")) return;

    const storyBox = story.getBoundingClientRect();
    const range = Math.max(1, storyBox.height - stageBox.height);
    const targetProgress = clamp((top - storyBox.top) / range);
    const delta = lastTime ? Math.min(0.040, (time - lastTime) / 1000) : 1 / 60;
    const follow = 1 - Math.exp(-delta / .068);
    lastTime = time;
    // Keep both position and speed continuous between wheel or touch updates.
    const rate = 23;
    const distance = progress - targetProgress;
    const momentum = velocity + rate * distance;
    const decay = Math.exp(-rate * delta);
    let nextProgress = clamp(targetProgress + (distance + momentum * delta) * decay);
    velocity = (velocity - rate * momentum * delta) * decay;
    // A fast wheel jump still passes through the push-in instead of skipping it.
    const turnPosition = clamp(progress, turnStart, turnEnd);
    const turnStep = clamp(nextProgress, turnStart, turnEnd) - turnPosition;
    const maxTurnStep = delta * (2.8 / 3.8);
    if (Math.abs(turnStep) > maxTurnStep) {
      nextProgress = turnPosition + Math.sign(turnStep) * maxTurnStep;
      velocity = Math.sign(turnStep) * (2.8 / 3.8);
    }
    progress = nextProgress;
    if (initialPosition || (Math.abs(targetProgress - progress) < .001 && Math.abs(velocity) < .022)) {
      progress = targetProgress;
      velocity = 0;
      initialPosition = false;
    }

    const mobile = compact.matches;
    const width = stageBox.width;
    const height = stageBox.height;
    const timeInClip = lerp(7.60, 11.40, progress);
    const [headYaw, camera, cameraX, cameraY] = sampleCamera(timeInClip);
    const resumeIn = ease(timeInClip, 7.86, 8.66);
    const introIn = 1 - ease(timeInClip, 7.64, 7.99);
    const visible = stageBox.bottom > top && stageBox.top < window.innerHeight;
    const frontSize = mobile ? Math.min(height * .82, width * 1.60) : Math.min(height * .99, width * .65);
    const closeSize = mobile ? Math.min(height * 1.14, width * 2.08) : Math.min(height * 2.12, width * 1.36);
    const size = frontSize * (closeSize / frontSize) ** camera;
    const anchorX = width * (mobile ? .50 + .10 * camera + .27 * Math.max(0,cameraX) : .50 + cameraX);
    const anchorY = height * (mobile ? .355 + cameraY * .66 : .443 + cameraY);
    const roll = -.025 * camera;
    const yaw = clamp(headYaw, angles[0], angles[angles.length - 1]);
    const upper = angles.findIndex((angle) => angle > yaw);
    const interval = upper < 0 ? angles.length - 2 : Math.max(0, upper - 1);
    const from = poses[interval];
    const to = poses[interval + 1];
    const blend = clamp((yaw - angles[interval]) / (angles[interval + 1] - angles[interval]));
    const [fromX, fromY] = gazePoints[from];
    const [toX, toY] = gazePoints[to];
    const eyeX = size * (lerp(fromX, toX, blend) - .50);
    const eyeY = size * (lerp(fromY, toY, blend) - .43);
    const eyeScreenX = stageBox.left + anchorX + eyeX * Math.cos(roll) - eyeY * Math.sin(roll);
    const eyeScreenY = stageBox.top + anchorY + eyeX * Math.sin(roll) + eyeY * Math.cos(roll);
    // The same mouse position is reprojected as the eyes move during scrolling.
    const dx = pointer && visible ? (pointer.x - eyeScreenX) / (width * .35) : 0;
    const dy = pointer && visible ? (pointer.y - eyeScreenY) / (height * .36) : 0;
    const reach = Math.max(1, Math.hypot(dx, dy));
    const targetX = dx / reach;
    const targetY = dy / reach;
    const gazeTarget = pointer && visible ? 1 : 0;
    lookX = lerp(lookX, targetX, follow);
    lookY = lerp(lookY, targetY, follow);
    const eyeFollow = 1 - Math.exp(-delta / .043);
    eyeLookX = lerp(eyeLookX, targetX, eyeFollow);
    eyeLookY = lerp(eyeLookY, targetY, eyeFollow);
    gazeStrength = lerp(gazeStrength, gazeTarget, follow);

    stage.style.setProperty("--intro-in", introIn.toFixed(3));
    stage.style.setProperty("--intro-shift", `${-30 * (1 - introIn)}px`);
    stage.style.setProperty("--resume-in", resumeIn.toFixed(3));
    stage.style.setProperty("--resume-shift", `${28 * (1 - resumeIn)}px`);
    opening.inert = introIn < .05;
    resume.inert = resumeIn < .06;
    items.forEach((item, i) => {
      const amount = ease(progress, .35 + i * .09, .57 + i * .09);
      item.style.setProperty("--item-in", amount.toFixed(3));
      item.style.setProperty("--item-shift", `${14 * (1 - amount)}px`);
    });

    if (focusResume && progress > .70) {
      focusResume = false;
      heading.focus({ preventScroll: true });
    }

    if (visible) {
      const ratio = Math.min(devicePixelRatio || 1, 1.65, 2000 / width);
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

      drawAvatar({
        from,
        to,
        blend,
        x: (anchorX + lookX * 9) * ratio,
        y: (anchorY + lookY * 4.5) * ratio,
        size: size * ratio,
        roll: roll + lookX * .017,
        lookX: eyeLookX * .014,
        lookY: eyeLookY * .009,
        gazeStrength,
        blink: 0,
        shade: camera * .08,
        fadeBottom: mobile ? 1 : 0,
      });
    }

    const eyeMoving = visible && (
      Math.abs(targetX - lookX) > .004 || Math.abs(targetY - lookY) > .004 ||
      Math.abs(targetX - eyeLookX) > .004 || Math.abs(targetY - eyeLookY) > .004 ||
      Math.abs(gazeTarget - gazeStrength) > .004
    );
    if (progress !== targetProgress || velocity !== 0 || eyeMoving) {
      schedule();
    } else {
      lastTime = 0;
    }
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointer = { x: event.clientX, y: event.clientY };
    if (drawAvatar) schedule();
  }, { passive: true });
  const clearPointer = () => {
    pointer = null;
    schedule();
  };
  document.documentElement.addEventListener("pointerleave", clearPointer);
  window.addEventListener("blur", clearPointer);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  compact.addEventListener("change", () => {
    initialPosition = true;
    schedule();
  });
  still.addEventListener("change", syncMotion);
  window.addEventListener("pageshow", schedule);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    drawAvatar = null;
    unavailable = true;
    setInteractive(false);
  });
  canvas.addEventListener("webglcontextrestored", () => {
    unavailable = false;
    syncMotion();
  });
  jump.addEventListener("click", (event) => {
    if (!story.classList.contains("is-interactive") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const range = story.offsetHeight - stage.offsetHeight;
    const top = scrollY + story.getBoundingClientRect().top - nav.offsetHeight;
    focusResume = event.detail === 0;
    window.scrollTo({ top: top + range * .95, behavior: "smooth" });
  });

  syncMotion();
  schedule();
})();
