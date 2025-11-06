import { createEffect, onMount, onCleanup, ErrorBoundary } from "solid-js";
import { Hammer, FastForward, Settings } from "lucide-solid";

import { Bank } from "@/components/Bank";
import { Clock } from "@/components/Clock";
import { Dice } from "@/components/Dice";
import { ErrorPage } from "@/components/ErrorPage";
import { Hand } from "@/components/Hand";
import { Players } from "@/components/Players";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

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
  let scale = 0;

  let mouseX = 0;
  let mouseY = 0;

  onMount(() => {
    globalThis.addEventListener("resize", handleResize);

    if (canvasRef) {
      canvasRef.addEventListener("mousemove", handleMouseMove);
    }

    handleResize();

    requestAnimationFrame(loop);
  });

  onCleanup(() => {
    globalThis.removeEventListener("resize", handleResize);
    if (canvasRef) {
      canvasRef.removeEventListener("mousemove", handleMouseMove);
    }
  });

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
        mouseX,
        mouseY,
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

    const tileWidth = Math.sqrt(3) * TILE_RADIUS;
    const tileHeight = 2 * TILE_RADIUS;

    const width = tileWidth * 5;
    const height = tileHeight * 5;

    scale = Math.min(canvasRef.width / width, canvasRef.height / height);

    ctx = canvasRef.getContext("2d");

    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
  }

  function handleMouseMove(event: MouseEvent) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
  }

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

  const enableHammer = () => {
    if (state.turn.rollingPlayerId !== state.turn.activePlayerId) return false;
    if (state.hand.wool >= 1 && state.hand.grain >= 1 && state.hand.ore >= 1)
      return true;
    return false;
  };

  const enableNext = () => {
    return state.turn.rollingPlayerId === state.turn.activePlayerId;
  };

  function handleHammerClick() {
    setState("hand", "wool", state.hand.wool - 1);
    setState("hand", "grain", state.hand.grain - 1);
    setState("hand", "ore", state.hand.ore - 1);
    setState("hand", "development", state.hand.development + 1);
  }

  return (
    <ErrorBoundary fallback={(error, _) => <ErrorPage error={error} />}>
      <div class="h-dvh w-dvw bg-sky-700 font-mono">
        <div class="flex h-full w-full flex-col gap-1 p-2">
          <div class="flex h-10 w-full gap-1 md:h-14">
            <Button class="p-1">
              <Settings class="size-full" stroke-width={1.5} />
            </Button>
            <div class="flex h-full w-full gap-1">
              <Bank />
              <Panel class="hidden h-full w-1/2 md:flex"></Panel>
            </div>
            <Clock />
          </div>
          <Panel class="h-8 md:hidden"></Panel>
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
              <Button
                class="p-2 md:p-4"
                disabled={!enableHammer()}
                onClick={handleHammerClick}
              >
                <Hammer class="size-full" stroke-width={1.5} />
              </Button>
              <Button class="p-2 md:p-4" disabled={!enableNext()}>
                <FastForward class="size-full" stroke-width={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
