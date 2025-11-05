export type Position = {
  col: number;
  row: number;
};

export function listTileVertices(tile: Position): Position[] {
  const topRow = tile.row * 2;

  let topCol = 0;
  let topVertex = { col: 0, row: 0 };
  let topLeftVertex = { col: 0, row: 0 };
  let topRightVertex = { col: 0, row: 0 };
  let bottomLeftVertex = { col: 0, row: 0 };
  let bottomRightVertex = { col: 0, row: 0 };
  let bottomVertex = { col: 0, row: 0 };

  switch (tile.row) {
    case 0:
    case 1:
      topCol = tile.col;
      topVertex = { col: topCol, row: topRow };
      topLeftVertex = { col: topCol, row: topRow + 1 };
      topRightVertex = { col: topCol + 1, row: topRow + 1 };
      bottomLeftVertex = { col: topCol, row: topRow + 2 };
      bottomRightVertex = { col: topCol + 1, row: topRow + 2 };
      bottomVertex = { col: topCol + 1, row: topRow + 3 };
      break;
    case 2:
      topCol = tile.col;
      topVertex = { col: topCol, row: topRow };
      topLeftVertex = { col: topCol, row: topRow + 1 };
      topRightVertex = { col: topCol + 1, row: topRow + 1 };
      bottomLeftVertex = { col: topCol, row: topRow + 2 };
      bottomRightVertex = { col: topCol + 1, row: topRow + 2 };
      bottomVertex = { col: topCol, row: topRow + 3 };
      break;
    case 3:
    case 4:
      topCol = tile.col + 1;
      topVertex = { col: topCol, row: topRow };
      topLeftVertex = { col: topCol - 1, row: topRow + 1 };
      topRightVertex = { col: topCol, row: topRow + 1 };
      bottomLeftVertex = { col: topCol - 1, row: topRow + 2 };
      bottomRightVertex = { col: topCol, row: topRow + 2 };
      bottomVertex = { col: topCol - 1, row: topRow + 3 };
      break;
  }

  return [
    topVertex,
    topLeftVertex,
    topRightVertex,
    bottomLeftVertex,
    bottomRightVertex,
    bottomVertex,
  ];
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
