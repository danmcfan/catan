import { circle, hexagon, text, square } from "@/lib/draw";
import { TILE_RADIUS, COLORS } from "@/lib/config";
import type { State } from "@/lib/state";

export function render(
  ctx: CanvasRenderingContext2D,
  state: State,
  options: {
    width: number;
    height: number;
    x: number;
    y: number;
    scale: number;
  },
) {
  ctx.clearRect(0, 0, options.width, options.height);

  ctx.save();

  ctx.translate(options.x, options.y);
  ctx.scale(options.scale, options.scale);

  const startX = -TILE_RADIUS * 2;
  const startY = -TILE_RADIUS * 1.75 * 2;

  let rowIndex = 0;
  let tileX = startX;
  let tileY = startY;
  for (const row of state.board.tiles) {
    for (const tile of row) {
      let colorConfig = { top: "", bottom: "", border: "black" };
      switch (tile.type) {
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
          throw new Error(`unknown tile type: ${tile.type}`);
      }
      hexagon(
        ctx,
        tileX,
        tileY,
        TILE_RADIUS * 1.25,
        COLORS.background,
        COLORS.background,
        "rgba(0,0,0,0)",
      );
      hexagon(
        ctx,
        tileX,
        tileY,
        TILE_RADIUS,
        colorConfig.top,
        colorConfig.bottom,
        colorConfig.border,
      );
      if (tile.value > 0) {
        const result = state.dice.first + state.dice.second;
        if (state.turn.darkenTiles && tile.value === result) {
          hexagon(
            ctx,
            tileX,
            tileY,
            TILE_RADIUS,
            "rgba(0, 0, 0, 0.65)",
            "rgba(0, 0, 0, 0.65)",
            "rgba(0,0,0,0)",
          );
        }

        let color = "black";
        if (tile.value === 6 || tile.value === 8) {
          color = "oklch(57.7% 0.245 27.325)";
        }

        circle(
          ctx,
          tileX,
          tileY,
          TILE_RADIUS * 0.35,
          COLORS.chit.top,
          COLORS.chit.bottom,
          color,
        );

        text(ctx, tileX, tileY + 4, tile.value.toString(), color);
      }
      tileX += TILE_RADIUS * 2;
    }
    rowIndex++;
    switch (rowIndex) {
      case 1:
      case 3:
        tileX = startX - TILE_RADIUS;
        break;
      case 2:
        tileX = startX - TILE_RADIUS * 2;
        break;
      default:
        tileX = startX;
        break;
    }
    tileY += TILE_RADIUS * 1.75;
  }

  const startBuildingX = startX;
  const startBuildingY = startY - TILE_RADIUS * 1.1;

  rowIndex = 0;
  let colIndex = 0;
  let buildingX = startBuildingX;
  let buildingY = startBuildingY;
  for (const row of state.board.buildings) {
    for (const building of row) {
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
          buildingX,
          buildingY,
          TILE_RADIUS * 0.25,
          colorConfig.top,
          colorConfig.bottom,
        );
      }
      buildingX += TILE_RADIUS * 2;
      colIndex++;
    }
    rowIndex++;
    switch (rowIndex) {
      case 0:
      case 11:
        buildingX = startBuildingX;
        break;
      case 1:
      case 2:
      case 9:
      case 10:
        buildingX = startBuildingX - TILE_RADIUS;
        break;
      case 3:
      case 4:
      case 7:
      case 8:
        buildingX = startBuildingX - TILE_RADIUS * 2;
        break;
      case 5:
      case 6:
        buildingX = startBuildingX - TILE_RADIUS * 3;
        break;
    }
    if (rowIndex % 2 === 0) {
      buildingY += TILE_RADIUS * 1.25;
    } else {
      buildingY += TILE_RADIUS * 0.5;
    }
    colIndex = 0;
  }

  ctx.restore();
}
