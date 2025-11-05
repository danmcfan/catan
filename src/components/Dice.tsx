import { Index } from "solid-js";
import { useState } from "@/lib/state";
import { cn } from "@/lib/utils";
import { type Die } from "@/lib/types";

export function Dice(props: { rollDice: () => void }) {
  const [state, _] = useState();

  const active = () => state.turn.rollingPlayerId === state.turn.activePlayerId;

  function handleClick() {
    if (!active()) return;
    props.rollDice();
  }

  return (
    <button
      class={cn("group flex h-full gap-1", active() && "cursor-pointer")}
      onClick={handleClick}
    >
      <Die value={state.dice.first} active={active()} />
      <Die value={state.dice.second} active={active()} />
    </button>
  );
}

export function Die(props: { value: Die; active?: boolean }) {
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
