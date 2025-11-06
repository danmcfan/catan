import { normalizeVertex } from "@/lib/coords";
import { DICE_ROLL_ITERATIONS } from "@/lib/config";
import type {
  Building,
  Die,
  Result,
  PlayerColor,
  Tile,
  CardType,
} from "@/lib/types";

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
  tiles: Tile[],
  buildings: Building[],
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

  const matchingTiles = tiles.filter((tile) => tile.value === result);
  for (const tile of matchingTiles) {
    for (let v = 0; v < 6; v++) {
      let { q: nq, r: nr, v: nv } = normalizeVertex(tile.q, tile.r, v);
      const building = buildings.find(
        (building) =>
          building.q === nq && building.r === nr && building.v === nv,
      );
      if (building && building.color === playerColor) {
        const resourceType = tile.type;
        if (resourceType !== "desert") {
          resources[resourceType] += 1;
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
