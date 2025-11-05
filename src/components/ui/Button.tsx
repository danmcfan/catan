import { cn } from "@/lib/utils";
import type { JSX } from "solid-js";

export function Button(props: {
  children?: JSX.Element | JSX.Element[];
  class?: string;
  disabled?: boolean;
}) {
  return (
    <button
      class={cn(
        "flex aspect-square h-full cursor-pointer items-center justify-center rounded-md border border-black text-2xl font-bold shadow-md",
        props.class,
        props.disabled
          ? "cursor-default bg-zinc-400"
          : "bg-linear-to-b from-zinc-200 to-zinc-300 transition-transform duration-100 hover:scale-95",
      )}
    >
      {props.children}
    </button>
  );
}
