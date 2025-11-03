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

type CardType =
  | "lumber"
  | "brick"
  | "wool"
  | "grain"
  | "ore"
  | "resource"
  | "development";

type Color = "red" | "blue" | "green" | "yellow";

export function App() {
  let mobileParentRef: HTMLDivElement | undefined;
  let desktopParentRef: HTMLDivElement | undefined;
  let mobileCanvasRef: HTMLCanvasElement | undefined;
  let desktopCanvasRef: HTMLCanvasElement | undefined;
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
    const canvasRef = getCanvasRef();
    if (!canvasRef) return;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    ctx.save();

    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 100, 100);

    ctx.restore();
  }

  function getParentRef() {
    if (globalThis.innerWidth < 768) {
      return mobileParentRef;
    }
    return desktopParentRef;
  }

  function getCanvasRef() {
    if (globalThis.innerWidth < 768) {
      return mobileCanvasRef;
    }
    return desktopCanvasRef;
  }

  function handleResize() {
    const parentRef = getParentRef();
    if (!parentRef) return;

    const canvasRef = getCanvasRef();
    if (!canvasRef) return;

    canvasRef.width = parentRef.clientWidth;
    canvasRef.height = parentRef.clientHeight;

    x = canvasRef.width / 2 - 50;
    y = canvasRef.height / 2 - 50;

    ctx = canvasRef.getContext("2d");
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

    requestAnimationFrame(loop);
  });

  onCleanup(() => {
    globalThis.removeEventListener("resize", handleResize);
    globalThis.removeEventListener("keydown", handleKeyDown);
    globalThis.removeEventListener("keyup", handleKeyUp);
  });

  return (
    <div class="h-dvh w-dvw bg-sky-700">
      {/* Mobile */}
      <div class="flex h-full w-full flex-col gap-1 p-2 md:hidden">
        <div class="flex h-1/15 w-full gap-1">
          <div class="aspect-square h-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md"></div>
          <Bank />
          <div class="aspect-square h-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md"></div>
        </div>
        <div class="h-1/20 w-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md"></div>
        <div class="grid h-1/6 w-full grid-cols-2 grid-rows-2 gap-1">
          <Player
            name="John Smith"
            color="red"
            score={5}
            resources={5}
            developments={1}
            knights={1}
            roads={3}
          />
          <Player
            name="Jane Doe"
            color="blue"
            score={4}
            resources={5}
            developments={1}
            knights={1}
            roads={3}
          />
          <Player
            name="Jim Beam"
            color="green"
            score={5}
            resources={5}
            developments={1}
            knights={1}
            roads={3}
          />
          <Player
            name="Jill Johnson"
            color="yellow"
            score={6}
            resources={5}
            developments={1}
            knights={1}
            roads={3}
          />
        </div>
        <div class="w-full grow" ref={mobileParentRef}>
          <canvas class="h-full w-full rounded-md" ref={mobileCanvasRef} />
        </div>
        <div class="flex h-1/12 w-full items-center justify-between gap-1">
          <Dice active />
          <div class="flex h-full gap-1">
            <ActionButton>
              <Hammer size={40} />
            </ActionButton>
            <ActionButton>
              <FastForward size={40} />
            </ActionButton>
          </div>
        </div>
        <div class="h-1/10 w-full">
          <Hand />
        </div>
      </div>

      {/* Desktop */}
      <div class="hidden h-full w-full flex-col gap-1 p-2 md:flex">
        <div class="flex h-[15%] w-full flex-col gap-1">
          <div class="h-1/3 w-full">
            <Bank />
          </div>
          <div class="grid h-2/3 w-full grid-cols-3 grid-rows-1 gap-1">
            <Player
              name="John Smith"
              color="red"
              score={5}
              resources={5}
              developments={1}
              knights={1}
              roads={3}
            />
            <Player
              name="Jane Doe"
              color="blue"
              score={4}
              resources={5}
              developments={1}
              knights={1}
              roads={3}
            />
            <Player
              name="Jim Beam"
              color="green"
              score={5}
              resources={5}
              developments={1}
              knights={1}
              roads={3}
            />
          </div>
        </div>

        <div class="relative w-full grow" ref={desktopParentRef}>
          <canvas class="h-full w-full rounded-md" ref={desktopCanvasRef} />
          <div class="absolute right-0 bottom-0 z-100 h-20">
            <Dice active />
          </div>
        </div>

        <div class="flex h-1/10 w-full items-end justify-end gap-1">
          <Hand />
          <Index each={[<Hammer size={64} />, <FastForward size={64} />]}>
            {(icon) => <ActionButton disabled={true}>{icon()}</ActionButton>}
          </Index>
        </div>
      </div>
    </div>
  );
}

function Bank() {
  return (
    <div class="flex h-full w-full items-center justify-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
      <Landmark class="mr-1 size-7 md:mr-4 md:size-12" />
      <Card type="lumber" />
      <Card type="brick" />
      <Card type="wool" />
      <Card type="grain" />
      <Card type="ore" />
      <Card type="development" />
    </div>
  );
}

function Hand() {
  return (
    <div class="flex h-full grow items-center justify-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
      <Card type="lumber" />
      <Card type="brick" />
      <Card type="wool" />
      <Card type="grain" />
      <Card type="ore" />
      <div class="mx-1 h-5/6 w-1 rounded-md bg-zinc-400 inset-shadow-sm md:mx-2 md:w-2"></div>
      <Card type="development" />
    </div>
  );
}

function Player(props: {
  name: string;
  color: Color;
  score: number;
  resources: number;
  developments: number;
  knights: number;
  roads: number;
}) {
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
    <>
      {/* Mobile */}
      <div class="flex h-full w-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:hidden"></div>

      {/* Desktop */}
      <div class="hidden h-full w-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:flex">
        <div class="flex w-full">
          <div class="flex h-full w-1/3 flex-col items-center justify-center gap-1">
            <p class="w-full text-center text-xs">{props.name}</p>
            <div class="flex flex-col items-center justify-center">
              <div
                class={cn(
                  "size-8 rounded-full border-2 bg-linear-to-b shadow-md md:size-12",
                  portraitColor(),
                )}
              ></div>
              <p class="w-10 -translate-y-2 rounded-sm border border-black bg-zinc-200 text-center text-xs shadow-md md:w-14 md:text-sm">
                {props.score}
              </p>
            </div>
          </div>
          <div class="flex h-full grow place-items-center gap-4">
            <Card type="resource" />
            <Card type="development" />
            <div class="flex flex-col items-center justify-center gap-1">
              <PersonStanding size={32} />
              <p>{props.knights}</p>
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <StretchHorizontal size={32} />
              <p>{props.roads}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Card(props: { type: CardType }) {
  const colors: Record<CardType, string> = {
    lumber: "from-green-700 to-green-800",
    brick: "from-orange-600 to-orange-700",
    wool: "from-green-500 to-green-600",
    grain: "from-yellow-500 to-yellow-600",
    ore: "from-zinc-400 to-zinc-500",
    resource: "from-zinc-400 to-zinc-500",
    development: "from-purple-400 to-purple-500",
  };

  return (
    <div
      class={cn(
        "aspect-10/16 h-3/4 cursor-pointer rounded-sm border-2 border-black bg-linear-to-b shadow-md transition-transform duration-100 hover:scale-95",
        colors[props.type],
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
