import { Card } from "@/components/Card";
import type { CardType } from "@/lib/types";

export function Hand(props: { hand: Record<CardType, number> }) {
  return (
    <div class="flex h-full grow items-center justify-center gap-0.5 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:gap-1">
      {props.hand.lumber > 0 && (
        <Card type="lumber" count={props.hand.lumber} />
      )}
      {props.hand.brick > 0 && <Card type="brick" count={props.hand.brick} />}
      {props.hand.wool > 0 && <Card type="wool" count={props.hand.wool} />}
      {props.hand.grain > 0 && <Card type="grain" count={props.hand.grain} />}
      {props.hand.ore > 0 && <Card type="ore" count={props.hand.ore} />}
      {props.hand.development > 0 && (
        <>
          <div class="mx-0.5 h-5/6 w-1 rounded-md bg-zinc-400 inset-shadow-sm md:mx-2 md:w-2"></div>
          <Card type="development" count={props.hand.development} />
        </>
      )}
    </div>
  );
}
