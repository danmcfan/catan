import { onCleanup, onMount, createSignal, type JSX } from "solid-js";
import { Hammer, FastForward, Landmark, Settings } from "lucide-solid";
import { Dice } from "@/components/Dice";
import { cn } from "@/lib/utils";
import { circle, hexagon, text } from "@/lib/draw";

const FPS = 60;
const FRAME_TIME = 1000 / FPS;

const SCROLL_SPEED = 5;

const RADIUS = 100;

type CardType =
  | "lumber"
  | "brick"
  | "wool"
  | "grain"
  | "ore"
  | "resource"
  | "development";

type TileType = "desert" | "lumber" | "brick" | "wool" | "grain" | "ore";

type Tile = {
  type: TileType;
  value: number;
};

const COLORS = {
  DesertTop: "oklch(90.1% 0.076 70.697)",
  DesertBottom: "oklch(83.7% 0.128 66.29)",
  DesertBorder: "oklch(70.5% 0.213 47.604)",
  LumberTop: "oklch(52.7% 0.154 150.069)",
  LumberBottom: "oklch(44.8% 0.119 151.328)",
  LumberBorder: "oklch(39.3% 0.095 152.535)",
  BrickTop: "oklch(64.6% 0.222 41.116)",
  BrickBottom: "oklch(55.3% 0.195 38.402)",
  BrickBorder: "oklch(40.8% 0.123 38.172)",
  WoolTop: "oklch(72.3% 0.219 149.579)",
  WoolBottom: "oklch(62.7% 0.194 149.214)",
  WoolBorder: "oklch(44.8% 0.119 151.328)",
  GrainTop: "oklch(79.5% 0.184 86.047)",
  GrainBottom: "oklch(68.1% 0.162 75.834)",
  GrainBorder: "oklch(47.6% 0.114 61.907)",
  OreTop: "oklch(70.9% 0.01 56.259)",
  OreBottom: "oklch(55.3% 0.013 58.071)",
  OreBorder: "oklch(37.4% 0.01 67.558)",
  ChitTop: "oklch(98.5% 0 0)",
  ChitBottom: "oklch(92% 0.004 286.32)",
  ChitBorder: "oklch(70.5% 0.015 286.067)",
};

export function App() {
  let parentRef: HTMLDivElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null;

  let lastTimestamp = 0;
  let lag = 0;

  let x = 0;
  let y = 0;

  let tiles: Tile[][] = [
    // Row 1 (3 tiles)
    [
      {
        type: "ore",
        value: 10,
      },
      {
        type: "wool",
        value: 2,
      },
      {
        type: "lumber",
        value: 9,
      },
    ],
    // Row 2 (4 tiles)
    [
      {
        type: "grain",
        value: 12,
      },
      {
        type: "brick",
        value: 6,
      },
      {
        type: "wool",
        value: 4,
      },
      {
        type: "brick",
        value: 10,
      },
    ],
    // Row 3 (5 tiles)
    [
      {
        type: "grain",
        value: 9,
      },
      {
        type: "lumber",
        value: 11,
      },
      {
        type: "desert",
        value: 0,
      },
      {
        type: "lumber",
        value: 3,
      },
      {
        type: "ore",
        value: 8,
      },
    ],
    // Row 4 (4 tiles)
    [
      {
        type: "lumber",
        value: 8,
      },
      {
        type: "ore",
        value: 3,
      },
      {
        type: "grain",
        value: 4,
      },
      {
        type: "wool",
        value: 5,
      },
    ],
    // Row 5 (3 tiles)
    [
      {
        type: "brick",
        value: 5,
      },
      {
        type: "grain",
        value: 6,
      },
      {
        type: "wool",
        value: 11,
      },
    ],
  ];

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
      y += SCROLL_SPEED;
    }
    if (keys.has("ArrowDown") || keys.has("KeyS")) {
      y -= SCROLL_SPEED;
    }
    if (keys.has("ArrowLeft") || keys.has("KeyA")) {
      x += SCROLL_SPEED;
    }
    if (keys.has("ArrowRight") || keys.has("KeyD")) {
      x -= SCROLL_SPEED;
    }
  }

  function draw() {
    if (!canvasRef) return;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    ctx.save();

    ctx.translate(x, y);

    const startX = -RADIUS * 2;
    const startY = -RADIUS * 1.75 * 2;

    let rowIndex = 0;
    let tileX = startX;
    let tileY = startY;
    for (const row of tiles) {
      for (const tile of row) {
        let topColor = "";
        let bottomColor = "";
        let borderColor = "black";
        switch (tile.type) {
          case "desert":
            topColor = COLORS.DesertTop;
            bottomColor = COLORS.DesertBottom;
            borderColor = COLORS.DesertBorder;
            break;
          case "lumber":
            topColor = COLORS.LumberTop;
            bottomColor = COLORS.LumberBottom;
            borderColor = COLORS.LumberBorder;
            break;
          case "brick":
            topColor = COLORS.BrickTop;
            bottomColor = COLORS.BrickBottom;
            borderColor = COLORS.BrickBorder;
            break;
          case "wool":
            topColor = COLORS.WoolTop;
            bottomColor = COLORS.WoolBottom;
            borderColor = COLORS.WoolBorder;
            break;
          case "grain":
            topColor = COLORS.GrainTop;
            bottomColor = COLORS.GrainBottom;
            borderColor = COLORS.GrainBorder;
            break;
          case "ore":
            topColor = COLORS.OreTop;
            bottomColor = COLORS.OreBottom;
            borderColor = COLORS.OreBorder;
            break;
          default:
            throw new Error(`Unknown tile type: ${tile.type}.`);
        }
        hexagon(ctx, tileX, tileY, RADIUS, topColor, bottomColor, borderColor);
        if (tile.value > 0) {
          let color = "black";
          if (tile.value === 6 || tile.value === 8) {
            color = "oklch(57.7% 0.245 27.325)";
          }

          circle(
            ctx,
            tileX,
            tileY,
            RADIUS * 0.35,
            COLORS.ChitTop,
            COLORS.ChitBottom,
            color,
          );

          text(ctx, tileX, tileY + 4, tile.value.toString(), color);
        }
        tileX += RADIUS * 2;
      }
      rowIndex++;
      switch (rowIndex) {
        case 1:
        case 3:
          tileX = startX - RADIUS;
          break;
        case 2:
          tileX = startX - RADIUS * 2;
          break;
        default:
          tileX = startX;
          break;
      }
      tileY += RADIUS * 1.75;
    }

    ctx.restore();
  }

  function handleResize() {
    if (!parentRef) return;
    if (!canvasRef) return;

    canvasRef.width = parentRef.clientWidth;
    canvasRef.height = parentRef.clientHeight;

    x = canvasRef.width / 2;
    y = canvasRef.height / 2;

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
          <Player />
          <Player />
          <Player />
          <Player />
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

function Player() {
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
    ore: "from-stone-400 to-stone-500",
    resource: "from-blue-400 to-blue-500",
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
