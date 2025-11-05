export function hexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  topColor: string,
  bottomColor: string,
  borderColor: string = "black",
  borderWidth: number = 4,
) {
  ctx.save();

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  ctx.restore();
}

export function circle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  topColor: string,
  bottomColor: string,
  borderColor: string = "black",
  borderWidth: number = 4,
) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  ctx.restore();
}

export function text(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string = "black",
  font: string = "bold 40px monospace",
) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export function square(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  topColor: string,
  bottomColor: string,
  borderColor: string = "black",
  borderWidth: number = 3,
) {
  ctx.save();

  ctx.beginPath();
  ctx.rect(cx - r, cy - r, r * 2, r * 2);
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  ctx.restore();
}
