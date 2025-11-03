import { onCleanup, onMount, createSignal, type JSX } from "solid-js";
import {
  Hammer,
  FastForward,
  PersonStanding,
  StretchHorizontal,
  Landmark,
  Settings,
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
        <div class="grid h-24 w-full grid-cols-2 grid-rows-2 gap-1 md:h-18 md:grid-cols-4 md:grid-rows-1">
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
        <div class="relative w-full grow" ref={parentRef}>
          <canvas class="h-full w-full rounded-md" ref={canvasRef} />
          <div class="absolute right-0 bottom-0 z-100 h-12 md:h-18">
            <Dice active />
          </div>
        </div>
        <div class="flex h-14 w-full items-center justify-between gap-1 md:h-28">
          <div class="h-full grow">
            <Hand />
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
  );
}

function Bank() {
  return (
    <div class="flex h-full w-full items-center justify-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
      <Landmark class="mr-1 size-6 md:mr-2 md:size-10" />
      <Card type="lumber" />
      <Card type="brick" />
      <Card type="wool" />
      <Card type="grain" />
      <Card type="ore" />
      <Card type="development" />
    </div>
  );
}

function Clock() {
  const [seconds, setSeconds] = createSignal(60);
  let interval: number | undefined;

  const formattedSeconds = () => {
    const minutes = Math.floor(seconds() / 60);
    const remainingSeconds = seconds() % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  onMount(() => {
    interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
      if (seconds() <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="flex h-full w-32 items-center justify-center rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:w-48">
      <p class="text-center font-mono text-lg font-bold md:text-2xl">
        {formattedSeconds()}
      </p>
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
    <div class="flex h-full w-full rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md"></div>
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
