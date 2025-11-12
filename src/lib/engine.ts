import { DICE_ROLL_ITERATIONS } from "@/lib/config";
import type { Die } from "@/lib/types";

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
