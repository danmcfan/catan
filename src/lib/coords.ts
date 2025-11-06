export type Position = {
  col: number;
  row: number;
};

export function hexToPixel(
  q: number,
  r: number,
  size: number,
): { x: number; y: number } {
  const x = (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) * size;
  const y = (3 / 2) * r * size;
  return { x, y };
}

export function vertexToPixel(
  q: number,
  r: number,
  v: number,
  size: number,
): { x: number; y: number } {
  let { x, y } = hexToPixel(q, r, size);
  const angle = -Math.PI / 2 + (v * Math.PI) / 3;
  x = x + size * Math.cos(angle);
  y = y + size * Math.sin(angle);
  return { x, y };
}

export function normalizeVertex(q: number, r: number, v: number) {
  const vertexNeighbors = [
    [
      { dq: 0, dr: -1, v: 2 },
      { dq: 1, dr: -1, v: 4 },
    ], // 0
    [
      { dq: 1, dr: -1, v: 3 },
      { dq: 1, dr: 0, v: 5 },
    ], // 1
    [
      { dq: 1, dr: 0, v: 4 },
      { dq: 0, dr: 1, v: 0 },
    ], // 2
    [
      { dq: 0, dr: 1, v: 5 },
      { dq: -1, dr: 1, v: 1 },
    ], // 3
    [
      { dq: -1, dr: 1, v: 0 },
      { dq: -1, dr: 0, v: 2 },
    ], // 4
    [
      { dq: -1, dr: 0, v: 1 },
      { dq: 0, dr: -1, v: 3 },
    ], // 5
  ];

  let output = { q, r, v };
  const neighbors = vertexNeighbors[v];
  for (const neighbor of neighbors) {
    const nq = q + neighbor.dq;
    const nr = r + neighbor.dr;
    const nv = neighbor.v;
    const ns = -nq - nr;

    if (nq <= -3 || nq >= 3 || nr <= -3 || nr >= 3 || ns <= -3 || ns >= 3) {
      continue;
    }

    if (nq < output.q || (nq === output.q && nr < output.r)) {
      output = { q: nq, r: nr, v: nv };
    }
  }

  return output;
}

export function canvasToMapPosition(
  canvasX: number,
  canvasY: number,
  translateX: number,
  translateY: number,
  scale: number,
) {
  const x = (canvasX - translateX) / scale;
  const y = (canvasY - translateY) / scale;
  return { x, y };
}

export function within(
  a: { x: number; y: number },
  b: { x: number; y: number },
  radius: number,
) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) <= radius;
}
