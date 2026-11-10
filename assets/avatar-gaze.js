window.createAvatarGaze = (portrait, canvas) => {
  const ease = (value, start, end) => {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  const landmarks = portrait.dataset.eyes?.split(";").map((eye) => eye.split(",").map(Number));
  if (!landmarks?.length) return () => {};
  canvas.width = portrait.naturalWidth;
  canvas.height = portrait.naturalHeight;
  const ctx = canvas.getContext("2d", {willReadFrequently: true});
  if (!ctx) return () => {};
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
  return (gaze) => {
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
};
