import { onCleanup, onMount, Index, type JSX } from "solid-js";
import {
  Hammer,
  FastForward,
  PersonStanding,
  StretchHorizontal,
  Landmark,
} from "lucide-solid";
import { Dice } from "@/components/Dice";
import { cn } from "@/lib/utils";

const FPS = 60;
const FRAME_TIME = 1000 / FPS;

const SCROLL_SPEED = 5;

type Resource = "lumber" | "brick" | "wool" | "grain" | "ore" | "development";

type Color = "red" | "blue" | "green" | "yellow";

export function App() {
  let parentRef: HTMLDivElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null;

  let lastTimestamp = 0;
  let lag = 0;

  let color = "red";
  let frames = 0;
  let framesMax = 60;

  let x = 0;
  let y = 0;

  const keys = new Set<string>();

  function loop(timestamp: number) {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    lag += delta;
    while (lag >= FRAME_TIME) {
      lag -= FRAME_TIME;
      update();
    }
    draw();
    requestAnimationFrame(loop);
  }

  function update() {
    if (keys.has("ArrowUp") || keys.has("KeyW")) {
      y -= SCROLL_SPEED;
    }
    if (keys.has("ArrowDown") || keys.has("KeyS")) {
      y += SCROLL_SPEED;
    }
    if (keys.has("ArrowLeft") || keys.has("KeyA")) {
      x -= SCROLL_SPEED;
    }
    if (keys.has("ArrowRight") || keys.has("KeyD")) {
      x += SCROLL_SPEED;
    }

    frames++;
    if (frames >= framesMax) {
      frames = 0;
      color = color === "red" ? "blue" : "red";
    }
  }

  function draw() {
    if (!canvasRef) return;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    ctx.save();

    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 100, 100);

    ctx.restore();
  }

  function handleResize() {
    if (!parentRef) return;
    if (!canvasRef) return;

    canvasRef.width = parentRef.clientWidth;
    canvasRef.height = parentRef.clientHeight;
  }

  function handleKeyDown(event: KeyboardEvent) {
    keys.add(event.code);
  }

  function handleKeyUp(event: KeyboardEvent) {
    keys.delete(event.code);
  }

  onMount(() => {
    globalThis.addEventListener("resize", handleResize);
    globalThis.addEventListener("keydown", handleKeyDown);
    globalThis.addEventListener("keyup", handleKeyUp);

    handleResize();

    if (!canvasRef) return;

    x = canvasRef.width / 2 - 50;
    y = canvasRef.height / 2 - 50;

    ctx = canvasRef.getContext("2d");
    requestAnimationFrame(loop);
  });

  onCleanup(() => {
    globalThis.removeEventListener("resize", handleResize);
    globalThis.removeEventListener("keydown", handleKeyDown);
    globalThis.removeEventListener("keyup", handleKeyUp);
  });

  return (
    <div class="flex h-dvh w-dvw gap-1 bg-sky-700 p-2" ref={parentRef}>
      <div class="flex h-full grow flex-col items-end gap-1">
        <div class="relative w-full grow">
          <canvas class="h-full w-full" ref={canvasRef} />
          <div class="absolute right-0 bottom-0 z-100">
            <Dice active />
          </div>
        </div>

        <div class="flex h-1/6 w-full items-end justify-end gap-1">
          <div class="flex h-full grow items-center justify-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
            <Index each={["lumber", "brick", "wool", "grain", "ore"]}>
              {(resource) => <ResourceCard resource={resource() as Resource} />}
            </Index>
            <div class="mx-2 h-5/6 w-2 rounded-md bg-zinc-400 inset-shadow-sm"></div>
            <ResourceCard resource="development" />
          </div>
          <Index each={[<Hammer size={64} />, <FastForward size={64} />]}>
            {(icon) => <ActionButton disabled={true}>{icon()}</ActionButton>}
          </Index>
        </div>
      </div>
      <div class="flex h-full w-1/3 flex-col gap-1">
        <div class="w-full grow rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md"></div>
        <BankCard />
        <Index
          each={[
            { name: "Jane Doe", color: "blue", score: 4 },
            { name: "Jim Beam", color: "green", score: 5 },
            { name: "Jill Johnson", color: "yellow", score: 6 },
          ]}
        >
          {(player) => (
            <PlayerCard
              name={player().name}
              color={player().color as Color}
              score={player().score}
            />
          )}
        </Index>
        <div class="flex h-1/6 w-full flex-col gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 p-2 shadow-md">
          <p class="w-full text-center text-lg font-bold">John Smith</p>
          <div class="flex w-full">
            <div class="flex h-full w-1/3 flex-col place-items-center">
              <div class="flex flex-col items-center justify-center">
                <div class="size-14 rounded-full border-2 border-red-600 bg-linear-to-b from-red-100 to-red-300 shadow-md"></div>
                <p class="w-16 -translate-y-2 rounded-sm border border-black bg-zinc-200 text-center text-sm shadow-md">
                  5
                </p>
              </div>
            </div>
            <div class="flex h-full grow place-items-center gap-4">
              <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-blue-400 to-blue-500"></div>
              <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-purple-400 to-purple-500"></div>
              <div class="flex flex-col items-center justify-center gap-1">
                <PersonStanding size={32} />
                <p>0</p>
              </div>
              <div class="flex flex-col items-center justify-center gap-1">
                <StretchHorizontal size={32} />
                <p>0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankCard() {
  return (
    <div class="flex h-1/8 w-full items-center justify-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
      <Landmark size={48} />
      <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-green-700 to-green-800"></div>
      <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-orange-600 to-orange-700"></div>
      <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-green-500 to-green-600"></div>
      <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-yellow-500 to-yellow-600"></div>
      <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-zinc-400 to-zinc-500"></div>
      <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-purple-400 to-purple-500"></div>
    </div>
  );
}

function PlayerCard(props: { name: string; color: Color; score: number }) {
  const portraitColors: Record<Color, string> = {
    red: "from-red-100 to-red-300 border-red-600",
    blue: "from-blue-100 to-blue-300 border-blue-600",
    green: "from-green-100 to-green-300 border-green-600",
    yellow: "from-yellow-100 to-yellow-300 border-yellow-600",
  };

  const portraitColor = () => {
    return portraitColors[props.color];
  };

  return (
    <div class="flex h-1/8 w-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
      <div class="flex w-full">
        <div class="flex h-full w-1/3 flex-col items-center justify-center gap-1">
          <p class="w-full text-center text-xs">{props.name}</p>
          <div class="flex flex-col items-center justify-center">
            <div
              class={cn(
                "size-12 rounded-full border-2 bg-linear-to-b shadow-md",
                portraitColor(),
              )}
            ></div>
            <p class="w-14 -translate-y-2 rounded-sm border border-black bg-zinc-200 text-center text-sm shadow-md">
              {props.score}
            </p>
          </div>
        </div>
        <div class="flex h-full grow place-items-center gap-4">
          <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-blue-400 to-blue-500"></div>
          <div class="aspect-5/8 w-10 rounded-sm border-2 border-black bg-linear-to-b from-purple-400 to-purple-500"></div>
          <div class="flex flex-col items-center justify-center gap-1">
            <PersonStanding size={32} />
            <p>0</p>
          </div>
          <div class="flex flex-col items-center justify-center gap-1">
            <StretchHorizontal size={32} />
            <p>0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard(props: { resource: Resource }) {
  const resourceColors: Record<Resource, string> = {
    lumber: "from-green-700 to-green-800",
    brick: "from-orange-600 to-orange-700",
    wool: "from-green-500 to-green-600",
    grain: "from-yellow-500 to-yellow-600",
    ore: "from-zinc-400 to-zinc-500",
    development: "from-purple-400 to-purple-500",
  };

  return (
    <div
      class={cn(
        "aspect-10/16 h-3/4 cursor-pointer rounded-sm border-2 border-black bg-linear-to-b shadow-md transition-transform duration-100 hover:scale-95",
        resourceColors[props.resource],
      )}
    ></div>
  );
}

function ActionButton(props: { children: JSX.Element; disabled?: boolean }) {
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
