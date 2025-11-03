import { createSignal, Index } from "solid-js";
import { cn } from "@/lib/utils";

type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

const ROLL_ITERATIONS = 3;
const ROLL_INTERVAL = 150;

export function Dice(props: { active?: boolean }) {
  const [first, setFirst] = createSignal<DiceValue>(1);
  const [second, setSecond] = createSignal<DiceValue>(1);

  function randomValue() {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
  }

  function handleClick() {
    if (!props.active) return;
    let firstValues: DiceValue[] = [];
    let secondValues: DiceValue[] = [];

    for (let i = 0; i < ROLL_ITERATIONS; i++) {
      let firstValue = randomValue();
      while (firstValues.includes(firstValue)) {
        firstValue = randomValue();
      }
      firstValues.push(firstValue);

      let secondValue = randomValue();
      while (secondValues.includes(secondValue)) {
        secondValue = randomValue();
      }
      secondValues.push(secondValue);
    }

    let index = 0;
    const interval = setInterval(() => {
      setFirst(firstValues[index]);
      setSecond(secondValues[index]);
      index++;
      if (index >= ROLL_ITERATIONS) {
        clearInterval(interval);
      }
    }, ROLL_INTERVAL);

    return () => clearInterval(interval);
  }

  return (
    <button
      class={cn("group flex gap-1", props.active && "cursor-pointer")}
      onClick={handleClick}
    >
      <Die value={first()} active={props.active} />
      <Die value={second()} active={props.active} />
    </button>
  );
}

export function Die(props: { value: DiceValue; active?: boolean }) {
  const dots = () => {
    switch (props.value) {
      case 1:
        return [0, 0, 0, 0, 1, 0, 0, 0, 0];
      case 2:
        return [1, 0, 0, 0, 0, 0, 0, 0, 1];
      case 3:
        return [0, 0, 1, 0, 1, 0, 1, 0, 0];
      case 4:
        return [1, 0, 1, 0, 0, 0, 1, 0, 1];
      case 5:
        return [1, 0, 1, 0, 1, 0, 1, 0, 1];
      case 6:
        return [1, 0, 1, 1, 0, 1, 1, 0, 1];
    }
  };

  return (
    <div
      class={cn(
        "grid size-20 grid-cols-3 grid-rows-3 place-items-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-400 to-zinc-500 p-2 shadow-md",
        props.active &&
          "from-zinc-200 to-zinc-300 transition-transform duration-100 group-hover:scale-95",
      )}
    >
      <Index each={dots()}>
        {(dot) => (
          <div
            class={cn(
              "size-4 rounded-full bg-black",
              dot()
                ? "bg-linear-to-b from-zinc-700 to-zinc-900"
                : "bg-transparent",
            )}
          />
        )}
      </Index>
    </div>
  );
}
