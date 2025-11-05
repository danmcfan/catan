import { cn } from "@/lib/utils";
import type { JSX } from "solid-js";

export function ActionButton(props: {
  children: JSX.Element;
  disabled?: boolean;
}) {
  return (
    <button
      class={cn(
        "flex aspect-square h-full cursor-pointer items-center justify-center rounded-md border-2 border-black text-2xl font-bold shadow-md",
        props.disabled
          ? "cursor-default bg-zinc-400"
          : "bg-linear-to-b from-zinc-200 to-zinc-300 transition-transform duration-100 hover:scale-95",
      )}
    >
      {props.children}
    </button>
  );
}
