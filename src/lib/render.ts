import { circle, hexagon, text, square } from "@/lib/draw";
import {
  canvasToMapPosition,
  hexToPixel,
  vertexToPixel,
  within,
} from "@/lib/coords";
import { TILE_RADIUS, COLORS } from "@/lib/config";
import type { State } from "@/lib/state";
import type { Options } from "@/lib/types";

const BUFFER = TILE_RADIUS * 0.15;

export function render(
  ctx: CanvasRenderingContext2D,
  state: State,
  options: Options,
) {
  ctx.clearRect(0, 0, options.width, options.height);

  ctx.save();

  ctx.translate(options.x, options.y);
  ctx.scale(options.scale, options.scale);

  renderTiles(ctx, state);
  renderBuildings(ctx, state, options);

  ctx.restore();
}

function renderTiles(ctx: CanvasRenderingContext2D, state: State) {
  for (const tile of state.board.tiles) {
    let colorConfig = { top: "", bottom: "", border: "black" };
    switch (tile.resource) {
      case "desert":
        colorConfig = COLORS.desert;
        break;
      case "lumber":
        colorConfig = COLORS.lumber;
        break;
      case "brick":
        colorConfig = COLORS.brick;
        break;
      case "wool":
        colorConfig = COLORS.wool;
        break;
      case "grain":
        colorConfig = COLORS.grain;
        break;
      case "ore":
        colorConfig = COLORS.ore;
        break;
      default:
        throw new Error(`unknown tile resource: ${tile.resource}`);
    }

    const { x, y } = hexToPixel(tile.cube.q, tile.cube.r, TILE_RADIUS);

    hexagon(
      ctx,
      x,
      y,
      TILE_RADIUS,
      COLORS.background,
      COLORS.background,
      "rgba(0,0,0,0)",
    );
    hexagon(
      ctx,
      x,
      y,
      TILE_RADIUS - BUFFER,
      colorConfig.top,
      colorConfig.bottom,
      colorConfig.border,
    );

    if (tile.number > 0) {
      const result = state.dice.first + state.dice.second;
      if (state.turn.darkenTiles && tile.number === result) {
        hexagon(
          ctx,
          x,
          y,
          TILE_RADIUS - BUFFER,
          "rgba(0, 0, 0, 0.45)",
          "rgba(0, 0, 0, 0.45)",
          "rgba(0,0,0,0)",
          0,
        );
      }

      let color = "black";
      if (tile.number === 6 || tile.number === 8) {
        color = "oklch(57.7% 0.245 27.325)";
      }

      circle(
        ctx,
        x,
        y,
        TILE_RADIUS * 0.4,
        COLORS.chit.top,
        COLORS.chit.bottom,
        color,
      );

      text(ctx, x, y, tile.number.toString(), color);
      text(
        ctx,
        x,
        y + 22,
        "•".repeat(TileValue(tile.number)),
        color,
        "bold 12px monospace",
      );
    }
  }
}

function renderBuildings(
  ctx: CanvasRenderingContext2D,
  state: State,
  options: Options,
) {
  const mousePosition = canvasToMapPosition(
    options.mouseX,
    options.mouseY,
    options.x,
    options.y,
    options.scale,
  );

  for (const building of state.board.buildings) {
    const { x, y } = vertexToPixel(
      building.vertex.cube.q,
      building.vertex.cube.r,
      building.vertex.index,
      TILE_RADIUS,
    );

    const hover = within({ x, y }, mousePosition, 25);
    if (building) {
      let colorConfig = { top: "", bottom: "" };
      switch (building.color) {
        case "red":
          colorConfig = COLORS.red;
          break;
        case "blue":
          colorConfig = COLORS.blue;
          break;
        case "green":
          colorConfig = COLORS.green;
          break;
        case "yellow":
          colorConfig = COLORS.yellow;
          break;
      }
      square(
        ctx,
        x,
        y,
        TILE_RADIUS * 0.2,
        colorConfig.top,
        colorConfig.bottom,
        hover ? "white" : "black",
      );
    }
  }
}

function TileValue(number: number) {
  switch (number) {
    case 2:
    case 12:
      return 1;
    case 3:
    case 11:
      return 2;
    case 4:
    case 10:
      return 3;
    case 5:
    case 9:
      return 4;
    case 6:
    case 8:
      return 5;
    default:
      return 0;
  }
}
