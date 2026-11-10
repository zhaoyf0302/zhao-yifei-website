(() => {
  const section = document.querySelector("#profile-stories");
  if (!section) return;

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (value, target, amount) => value + (target - value) * amount;
  const plainClick = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  const studio = section.querySelector(".story-studio");
  const choices = studio.querySelector(".studio-choices");
  const buttons = Array.from(choices.querySelectorAll("button"));
  const panels = buttons.map((button) => document.getElementById(button.getAttribute("aria-controls")));
  const beijing = section.querySelector(".story-beijing");
  const portrait = beijing.querySelector("img");
  const eyes = beijing.querySelector("canvas");
  const growth = section.querySelector(".story-growth");
  const dots = Array.from(growth.querySelectorAll("circle"));
  const steps = Array.from(growth.querySelectorAll("li"));
  const bridge = section.querySelector(".story-bridge");
  const bridgeFirst = bridge?.querySelector(".bridge-scene");
  const works = document.getElementById("works");
  const scenes = Array.from(section.querySelectorAll(".profile-story, .bridge-scene"), (article) => ({
    article,
    visual: article.querySelector(".story-visual"),
    image: article.querySelector(".story-image"),
    progress: null,
    x: 0,
    y: 0,
    gaze: 0,
    scale: 1,
    pointer: null,
  }));
  let selection = 0;
  let raf = 0;
  let last = null;
  let drawEyes = () => {};
  let eyesRequested = false;
  let bridgeVisible = false;
  let bridgeProgress = null;
  const active = new Set();

  function schedule() {
    if (!raf && (active.size || bridgeVisible)) raf = requestAnimationFrame(paint);
  }

  function paint(now) {
    raf = 0;
    const height = window.innerHeight;
    const amount = last === null ? .18 : 1 - Math.exp(-Math.min(50, now - last) / 93);
    last = now;
    let moving = false;
    const reduce = motion.matches;
    // Settle on the exact target to stop drawing when the page is still.
    const approach = (from, to) => {
      if (Math.abs(to - from) < .001 || reduce) return to;
      moving = true;
      return mix(from, to, amount);
    };
    for (const scene of active) {
      const {article, image, visual, pointer} = scene;
      const box = visual.getBoundingClientRect();
      const scroll = clamp((height * .88 - box.top) / (height * .71));
      const hasPointer = pointer && pointer.x >= box.left && pointer.x <= box.right &&
        pointer.y >= box.top && pointer.y <= box.bottom;
      const px = hasPointer ? (pointer.x - box.left) / box.width * 2 - 1 : 0;
      const py = hasPointer ? (pointer.y - box.top) / box.height * 2 - 1 : 0;
      let targetX = 0;
      let targetY = 0;
      let targetScale = 1;
      let targetGaze = 0;
      const targetProgress = reduce ? 1 : scroll;

      if (!reduce && article === studio) {
        targetScale = 1.055 + .015 * selection;
        targetX = 1.15 - 1.15 * selection - px * .90;
        targetY = -1.6 - py * .70;
      } else if (!reduce && article === beijing) {
        targetScale = 1.045 + .145 * scroll;
        targetX = -scroll * 2.1 - px * .95;
        targetY = scroll * 1.45 - py * .85;
        const imageBox = image.getBoundingClientRect();
        const eyeLine = imageBox.left + imageBox.width * .66;
        if (hasPointer) targetGaze = clamp((pointer.x - eyeLine) / (box.width * .3), -1, 1);
      } else if (!reduce && article.classList.contains("bridge-scene")) {
        targetScale = 1 + .074 * scroll;
        targetX = (article === bridgeFirst ? -1 : 1) * scroll * 1.35;
        targetY = .55 * scroll;
      }

      scene.progress = scene.progress === null ? targetProgress : approach(scene.progress, targetProgress);
      scene.x = approach(scene.x, targetX);
      scene.y = approach(scene.y, targetY);
      scene.scale = approach(scene.scale, targetScale);
      scene.gaze = approach(scene.gaze, targetGaze);
      image.style.setProperty("--scene-x", `${scene.x}%`);
      image.style.setProperty("--scene-y", `${scene.y}%`);
      image.style.setProperty("--scene-scale", scene.scale);
      if (article === beijing) drawEyes(scene.gaze);
      if (article === growth) {
        image.style.setProperty("--step-progress", scene.progress);
        [.025, .355, .855].forEach((stop, i) => {
          const reached = scene.progress >= stop;
          steps[i].classList.toggle("is-reached", reached);
          dots[i].classList.toggle("is-reached", reached);
        });
      }
    }
    if (bridgeVisible) {
      const bounds = bridge.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - height * .13);
      const target = reduce ? 1 : clamp((height * .77 - bounds.top) / travel);
      bridgeProgress = bridgeProgress === null ? target : approach(bridgeProgress, target);
      bridge.style.setProperty("--bridge-progress", bridgeProgress);
    }
    if (moving) schedule();
    else last = null;
  }

  function prepareEyes() {
    if (eyesRequested || motion.matches) return;
    eyesRequested = true;
    portrait.decode().then(() => {
      try {
        drawEyes = window.createAvatarGaze(portrait, eyes);
        schedule();
      } catch {
        // Direct file previews can restrict reads. The image still pans and zooms.
        eyes.width = 0;
      }
    }, () => { eyesRequested = false; });
  }

  function selectStage(i) {
    selection = i;
    studio.dataset.selection = i;
    buttons.forEach((choice, j) => {
      choice.setAttribute("aria-pressed", String(i === j));
      panels[j].inert = i !== j;
    });
    schedule();
  }

  studio.classList.add("is-interactive");
  choices.hidden = false;
  selectStage(0);
  panels.forEach((panel) => { panel.hidden = false; });
  buttons.forEach((button, i) => button.addEventListener("click", () => selectStage(i)));
  section.querySelectorAll("[data-studio-work], [data-story-work]").forEach((link) => {
    const work = document.getElementById(link.hash.slice(1));
    const image = work?.querySelector("img");
    if (!image || !work.hasAttribute("data-lightbox")) return;
    const thumbnail = image.cloneNode(false);
    thumbnail.alt = "";
    link.prepend(thumbnail);
    const workTitle = link.querySelector("[data-work-title]");
    if (workTitle && work.dataset.title) workTitle.textContent = work.dataset.title;
    if (!link.hasAttribute("data-studio-work")) return;
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (!plainClick(event)) return;
      event.preventDefault();
      work.click();
    });
  });
  function jumpToCurrentAnchor(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || !plainClick(event) || link.hash !== location.hash) return;
    const destination = document.getElementById(link.hash.slice(1));
    if (!destination) return;
    event.preventDefault();
    destination.focus({preventScroll: true});
    destination.scrollIntoView({behavior: "instant"});
  }
  section.addEventListener("click", jumpToCurrentAnchor);
  document.querySelector(".works-index")?.addEventListener("click", jumpToCurrentAnchor);

  const sceneByVisual = new Map(scenes.map((scene) => [scene.visual, scene]));
  const viewport = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === works) {
        works.classList.toggle("is-onstage", entry.isIntersecting);
        continue;
      }
      if (entry.target === bridge) {
        bridgeVisible = entry.isIntersecting;
        continue;
      }
      const scene = sceneByVisual.get(entry.target);
      if (entry.isIntersecting) {
        active.add(scene);
        if (scene.article === beijing) prepareEyes();
      } else {
        active.delete(scene);
        scene.pointer = null;
        if (scene.article === beijing) drawEyes(0);
      }
    }
    section.classList.toggle("is-onstage", active.size > 0 || bridgeVisible);
    schedule();
  }, {rootMargin: "72px"});
  if (bridge) viewport.observe(bridge);
  if (works) viewport.observe(works);
  for (const scene of scenes) {
    viewport.observe(scene.visual);
    if (scene.article !== studio && scene.article !== beijing) continue;
    scene.visual.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || motion.matches) return;
      scene.pointer = {x: event.clientX, y: event.clientY};
      schedule();
    }, {passive: true});
    scene.visual.addEventListener("pointerleave", () => {
      scene.pointer = null;
      schedule();
    });
  }
  window.addEventListener("scroll", schedule, {passive: true});
  window.addEventListener("resize", schedule, {passive: true});
  motion.addEventListener("change", () => {
    if (scenes.some((scene) => scene.article === beijing && active.has(scene))) prepareEyes();
    schedule();
  });
})();
