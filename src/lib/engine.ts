import { listTileVertices } from "@/lib/map";
import type {
  Building,
  Die,
  Result,
  PlayerColor,
  Tile,
  Position,
  CardType,
} from "@/lib/types";
import { DICE_ROLL_ITERATIONS } from "@/lib/config";

export function createRollSequence(): { firstDice: Die[]; secondDice: Die[] } {
  const firstDice: Die[] = [];
  const secondDice: Die[] = [];

  for (let i = 0; i < DICE_ROLL_ITERATIONS; i++) {
    let firstDie = randomDie();
    while (firstDice.includes(firstDie)) {
      firstDie = randomDie();
    }
    firstDice.push(firstDie);

    let secondDie = randomDie();
    while (secondDice.includes(secondDie)) {
      secondDie = randomDie();
    }
    secondDice.push(secondDie);
  }

  return { firstDice, secondDice };
}

function randomDie() {
  return (Math.floor(Math.random() * 6) + 1) as Die;
}

export function collectResources(
  result: Result,
  tiles: Tile[][],
  buildings: (Building | null)[][],
  playerColor: PlayerColor,
) {
  const resources: Record<CardType, number> = {
    lumber: 0,
    brick: 0,
    wool: 0,
    grain: 0,
    ore: 0,
    resource: 0,
    development: 0,
  };

  const matchingTiles: Position[] = [];
  for (let row = 0; row < tiles.length; row++) {
    for (let col = 0; col < tiles[row].length; col++) {
      if (tiles[row][col].value === result) {
        matchingTiles.push({ row, col });
      }
    }
  }

  for (const tile of matchingTiles) {
    const vertices = listTileVertices(tile);
    for (const vertex of vertices) {
      const building = buildings[vertex.row][vertex.col];
      if (building && building.color === playerColor) {
        const resourceType = tiles[tile.row][tile.col].type;

        const amount = building.type === "settlement" ? 1 : 2;

        if (resourceType !== "desert") {
          resources[resourceType] += amount;
        }
      }
    }
  }

  return resources;
}

export function mergeResources(
  current: Record<CardType, number>,
  collected: Record<CardType, number>,
) {
  const merged = { ...current };

  for (const [resource, amount] of Object.entries(collected)) {
    merged[resource as CardType] += amount;
  }

  return merged;
}

export function getNextId(current: string) {
  return (parseInt(current) % 4) + 1;
}
