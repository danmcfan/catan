import { Show, For } from "solid-js";
import { cn } from "@/lib/utils";
import type { CardType } from "@/lib/types";

export function Card(props: { type: CardType; count?: number }) {
  const colors: Record<CardType, string> = {
    lumber: "from-green-700 to-green-800",
    brick: "from-orange-600 to-orange-700",
    wool: "from-green-500 to-green-600",
    grain: "from-yellow-500 to-yellow-600",
    ore: "from-stone-400 to-stone-500",
    resource: "from-blue-400 to-blue-500",
    development: "from-purple-400 to-purple-500",
  };

  const stack = () => {
    if (!props.count) return [];
    return Array.from({ length: props.count - 1 }, (_, i) => i);
  };

  const leftOffset = () => {
    if (!props.count) return 0;
    return (props.count - 1) * 6;
  };

  return (
    <div
      class="relative aspect-10/16 h-3/4"
      style={{ "margin-left": `${leftOffset()}px` }}
    >
      <div
        class={cn(
          "relative z-100 h-full w-full rounded-sm border border-black bg-linear-to-b shadow-md md:border-2",
          colors[props.type],
        )}
      >
        <Show when={props.count}>
          <p class="absolute top-0 right-0 flex aspect-square w-3 items-center justify-center rounded-tr-sm rounded-bl-sm bg-zinc-50 text-[8px] font-bold md:w-5 md:text-xs">
            {props.count}
          </p>
        </Show>
      </div>
      <For each={stack()}>
        {(index) => (
          <div
            class={cn(
              "absolute top-0 left-0 aspect-10/16 h-full w-full rounded-sm border border-black bg-linear-to-b md:border-2",
              colors[props.type],
            )}
            style={{
              transform: `translateX(-${(index + 1) * 6}px)`,
              "z-index": 10 - index,
            }}
          ></div>
        )}
      </For>
    </div>
  );
}
