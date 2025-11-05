import { circle, hexagon, text, square } from "@/lib/draw";
import { canvasToMapPosition, within } from "@/lib/map";
import { TILE_RADIUS, COLORS } from "@/lib/config";
import type { State } from "@/lib/state";
import type { Options } from "@/lib/types";

const BUFFER = TILE_RADIUS * 0.25;

const START_X = -TILE_RADIUS * 2;
const START_Y = -TILE_RADIUS * 1.75 * 2;

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
  let rowIndex = 0;
  let tileX = START_X;
  let tileY = START_Y;
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
        TILE_RADIUS + BUFFER,
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
          TILE_RADIUS * 0.4,
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
        tileX = START_X - TILE_RADIUS;
        break;
      case 2:
        tileX = START_X - TILE_RADIUS * 2;
        break;
      default:
        tileX = START_X;
        break;
    }
    tileY += TILE_RADIUS * 1.75;
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

  const scaleFactor = 1.12;

  const startBuildingX = START_X;
  const startBuildingY = START_Y - TILE_RADIUS * scaleFactor;

  let rowIndex = 0;
  let colIndex = 0;
  let buildingX = startBuildingX;
  let buildingY = startBuildingY;
  for (const row of state.board.buildings) {
    for (const building of row) {
      const hover = within({ x: buildingX, y: buildingY }, mousePosition, 25);
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
          hover ? "white" : "black",
        );
      } else {
        hover &&
          circle(
            ctx,
            buildingX,
            buildingY,
            TILE_RADIUS * 0.2,
            "rgba(0, 0, 0, 0.1)",
            "rgba(0, 0, 0, 0.1)",
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
      buildingY += TILE_RADIUS * scaleFactor * 1.08;
    } else {
      buildingY += TILE_RADIUS * scaleFactor * 0.475;
    }
    colIndex = 0;
  }
}
