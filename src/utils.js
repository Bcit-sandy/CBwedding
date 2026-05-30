// Christy and Brian's Wedding

import { CANVAS_FILTER, C, FRAMES } from "./constants";

export function canvasFilterStr(filterKey) {
  const f = CANVAS_FILTER[filterKey];
  let str = `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate})`;
  if (f.sepia) str += ` sepia(${f.sepia})`;
  return str;
}

export async function renderStripPngDataUrl({
  photos,
  filterKey,
  frameKey = "classic",
}) {
  const STRIP_W = 320;
  const PHOTO_W = 280;
  const PHOTO_H = 210;
  const PADDING = 20;
  const HEADER = 60;
  const FOOTER = 60;
  const GAP = 20;
  const STRIP_H = HEADER + (PHOTO_H + GAP) * 4 + FOOTER;

  const frame = FRAMES.find((f) => f.id === frameKey) || FRAMES[0];
  const filterStr = canvasFilterStr(filterKey);

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W * 2;
  canvas.height = STRIP_H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  ctx.fillStyle = frame.paper;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  ctx.strokeStyle = frame.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, STRIP_W - 1, STRIP_H - 1);

  ctx.fillStyle = C.text;
  ctx.font = "500 14px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText("*ੈ✩‧₊˚ Christy and Brian's Wedding⋆⟢‧*₊˚", STRIP_W / 2, 40);

  

  for (let i = 0; i < photos.length; i++) {
    const img = new Image();
    img.src = photos[i];
    await new Promise((r) => {
      img.onload = r;
      img.onerror = r;
    });

    const x = (STRIP_W - PHOTO_W) / 2;
    const y = HEADER + i * (PHOTO_H + GAP);

    ctx.shadowColor = "rgba(44,37,32,0.12)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - 5, y - 5, PHOTO_W + 10, PHOTO_H + 10);
    ctx.shadowBlur = 0;

    ctx.filter = filterStr;
    ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H);
    ctx.filter = "none";

    ctx.strokeStyle = C.text;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, PHOTO_W, PHOTO_H);
  }

  // Bottom divider with centered heart (match the subtle header line style)
  const bottomY = STRIP_H - 45;
  const midX = STRIP_W / 2;
  const gap = 22;

  ctx.strokeStyle = frame.border;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(PADDING, bottomY);
  ctx.lineTo(midX - gap, bottomY);
  ctx.moveTo(midX + gap, bottomY);
  ctx.lineTo(STRIP_W - PADDING, bottomY);
  ctx.stroke();

  ctx.fillStyle = frame.border;
  ctx.font = "12px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♥", midX, bottomY + 0.5);
  ctx.textBaseline = "alphabetic";

  // Footer: date + location (moved from header)
  ctx.fillStyle = C.accent;
  ctx.font = "12px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText("May 30, 2026", STRIP_W / 2, bottomY + 22);

  return canvas.toDataURL("image/png");
}
