import { cn } from "@/lib/utils";
import type { JSX } from "solid-js";

export function Panel(props: {
  children?: JSX.Element | JSX.Element[];
  class?: string;
}) {
  return (
    <div
      class={cn(
        "flex h-full w-full items-center justify-center rounded-md border border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}
