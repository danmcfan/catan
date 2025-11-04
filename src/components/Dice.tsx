import { Index } from "solid-js";
import { cn } from "@/lib/utils";

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export function Dice(props: {
  rollDice: () => void;
  firstValue: DiceValue;
  secondValue: DiceValue;
  active?: boolean;
}) {
  function handleClick() {
    if (!props.active) return;
    props.rollDice();
  }

  return (
    <button
      class={cn("group flex h-full gap-1", props.active && "cursor-pointer")}
      onClick={handleClick}
    >
      <Die value={props.firstValue} active={props.active} />
      <Die value={props.secondValue} active={props.active} />
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
        "grid aspect-square h-full grid-cols-3 grid-rows-3 place-items-center gap-0.5 rounded-md border-2 border-black bg-linear-to-b from-zinc-400 to-zinc-500 p-2 shadow-md",
        props.active &&
          "from-zinc-200 to-zinc-300 transition-transform duration-100 group-hover:scale-95",
      )}
    >
      <Index each={dots()}>
        {(dot) => (
          <div
            class={cn(
              "size-full rounded-full bg-black",
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
