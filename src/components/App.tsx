import { createEffect, onMount, onCleanup, ErrorBoundary } from "solid-js";
import { Hammer, FastForward, Settings } from "lucide-solid";

import { ActionButton } from "@/components/ActionButton";
import { Bank } from "@/components/Bank";
import { Clock } from "@/components/Clock";
import { Dice } from "@/components/Dice";
import { ErrorPage } from "@/components/ErrorPage";
import { Hand } from "@/components/Hand";
import { Players } from "@/components/Players";

import { useState } from "@/lib/state";
import {
  createRollSequence,
  collectResources,
  mergeResources,
  getNextId,
} from "@/lib/engine";
import { render } from "@/lib/render";
import {
  DICE_ROLL_ITERATIONS,
  DICE_ROLL_INTERVAL,
  TIME_PER_FRAME,
  TILE_RADIUS,
} from "@/lib/config";
import type { Result } from "@/lib/types";

export function App() {
  const [state, setState] = useState();

  let parentRef: HTMLDivElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null;

  let lastTimestamp = 0;
  let lag = 0;

  let x = 0;
  let y = 0;
  let scale = 0.75;

  function loop(timestamp: number) {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    lag += delta;
    while (lag >= TIME_PER_FRAME) {
      lag -= TIME_PER_FRAME;
      update();
    }
    if (canvasRef && ctx) {
      render(ctx, state, {
        width: canvasRef.clientWidth,
        height: canvasRef.clientHeight,
        x,
        y,
        scale,
      });
    }
    requestAnimationFrame(loop);
  }

  function update() {}

  function rollDice() {
    setState("turn", "darkenTiles", false);

    const { firstDice, secondDice } = createRollSequence();

    let index = 0;
    const interval = setInterval(() => {
      setState("dice", "first", firstDice[index]);
      setState("dice", "second", secondDice[index]);
      index++;
      if (index >= DICE_ROLL_ITERATIONS) {
        clearInterval(interval);
        setState("dice", "rolled", true);
        setState("turn", "darkenTiles", true);
      }
    }, DICE_ROLL_INTERVAL);
  }

  function handleResize() {
    if (!parentRef) return;
    if (!canvasRef) return;

    canvasRef.width = parentRef.clientWidth;
    canvasRef.height = parentRef.clientHeight;

    x = canvasRef.width / 2;
    y = canvasRef.height / 2;

    const width = TILE_RADIUS * 1.75 * 6;
    scale = Math.min(canvasRef.width / width, canvasRef.height / width);

    ctx = canvasRef.getContext("2d");

    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
  }

  onMount(() => {
    globalThis.addEventListener("resize", handleResize);

    handleResize();

    requestAnimationFrame(loop);
  });

  onCleanup(() => {
    globalThis.removeEventListener("resize", handleResize);
  });

  createEffect(() => {
    if (!state.dice.rolled) return;

    const result = (state.dice.first + state.dice.second) as Result;
    const collected = collectResources(
      result,
      state.board.tiles,
      state.board.buildings,
      "red",
    );
    setState("hand", (prev) => mergeResources(prev, collected));

    const nextId = getNextId(state.turn.rollingPlayerId);
    setState("turn", "rollingPlayerId", nextId.toString());
    setState("dice", "rolled", false);

    if (state.turn.rollingPlayerId === state.turn.activePlayerId) return;

    const timeout = setTimeout(() => {
      rollDice();
      clearTimeout(timeout);
    }, 2500);
  });

  return (
    <ErrorBoundary fallback={(error, _) => <ErrorPage error={error} />}>
      <div class="h-dvh w-dvw bg-sky-700 font-mono">
        <div class="flex h-full w-full flex-col gap-1 p-2">
          <div class="flex h-10 w-full gap-1 md:h-14">
            <button class="flex aspect-square h-full cursor-pointer items-center justify-center rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md transition-transform duration-100 hover:scale-95">
              <Settings class="size-6 md:size-10" />
            </button>
            <div class="flex h-full w-full gap-1">
              <Bank />
              <div class="hidden h-full w-1/2 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:block"></div>
            </div>
            <Clock />
          </div>
          <div class="h-8 w-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:hidden"></div>
          <Players
            activePlayerId={state.turn.activePlayerId}
            rollingPlayerId={state.turn.rollingPlayerId}
          />
          <div class="relative w-full grow" ref={parentRef}>
            <canvas class="h-full w-full rounded-md" ref={canvasRef} />
            <div class="absolute right-0 bottom-0 z-100 h-12 md:h-18">
              <Dice rollDice={rollDice} />
            </div>
          </div>
          <div class="flex h-14 w-full items-center justify-between gap-1 md:h-28">
            <div class="h-full grow">
              <Hand hand={state.hand} />
            </div>
            <div class="flex h-full gap-1">
              <ActionButton>
                <Hammer class="size-10 md:size-16" />
              </ActionButton>
              <ActionButton>
                <FastForward class="size-10 md:size-16" />
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
