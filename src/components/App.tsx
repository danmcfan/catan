import {
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
  For,
  ErrorBoundary,
  type JSX,
} from "solid-js";
import { Hammer, FastForward, Landmark, Settings } from "lucide-solid";
import { ErrorPage } from "@/components/ErrorPage";
import { Dice, type DiceValue } from "@/components/Dice";
import { Players } from "@/components/Players";
import { cn } from "@/lib/utils";
import { circle, hexagon, text, square } from "@/lib/draw";
import { listTileVertices, type Position } from "@/lib/map";

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

type BuildingType = "settlement" | "city";

type Building = {
  type: BuildingType;
  color: string;
};

const FPS = 60;
const FRAME_TIME = 1000 / FPS;

const RADIUS = 100;

const ROLL_ITERATIONS = 3;
const ROLL_INTERVAL = 150;

const ACTIVE_PLAYER_ID = "1";

const COLORS = {
  DesertTop: "oklch(95.4% 0.038 75.164)",
  DesertBottom: "oklch(90.1% 0.076 70.697)",
  DesertBorder: "oklch(75% 0.183 55.934)",
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
  Background: "oklch(83.7% 0.128 66.29)",
  RedTop: "oklch(70.4% 0.191 22.216)",
  RedBottom: "oklch(44.4% 0.177 26.899)",
  RedBorder: "oklch(44.4% 0.177 26.899)",
  BlueTop: "oklch(70.7% 0.165 254.624)",
  BlueBottom: "oklch(54.6% 0.245 262.881)",
  BlueBorder: "oklch(42.4% 0.199 265.638)",
  GreenTop: "oklch(79.2% 0.209 151.711)",
  GreenBottom: "oklch(62.7% 0.194 149.214)",
  GreenBorder: "oklch(44.8% 0.119 151.328)",
  YellowTop: "oklch(85.2% 0.199 91.936)",
  YellowBottom: "oklch(68.1% 0.162 75.834)",
  YellowBorder: "oklch(47.6% 0.114 61.907)",
};

export function App() {
  const [rollingPlayerId, setRollingPlayerId] = createSignal("1");
  const [rolledDice, setRolledDice] = createSignal(false);
  const [darkenTile, setDarkenTile] = createSignal(false);

  const [firstValue, setFirstValue] = createSignal<DiceValue>(1);
  const [secondValue, setSecondValue] = createSignal<DiceValue>(1);

  const [hand, setHand] = createSignal<Record<CardType, number>>({
    lumber: 0,
    brick: 0,
    wool: 0,
    grain: 0,
    ore: 0,
    resource: 0,
    development: 0,
  });

  let parentRef: HTMLDivElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null;

  let lastTimestamp = 0;
  let lag = 0;

  let x = 0;
  let y = 0;
  let scale = 0.75;

  const tiles: Tile[][] = [
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

  const buildings: (Building | null)[][] = [
    [null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null],
  ];

  buildings[8][1] = {
    type: "settlement",
    color: "red",
  };

  buildings[9][2] = {
    type: "settlement",
    color: "red",
  };

  buildings[6][1] = {
    type: "settlement",
    color: "blue",
  };

  buildings[7][2] = {
    type: "settlement",
    color: "blue",
  };

  buildings[4][1] = {
    type: "settlement",
    color: "green",
  };

  buildings[6][4] = {
    type: "settlement",
    color: "green",
  };

  buildings[3][2] = {
    type: "settlement",
    color: "yellow",
  };

  buildings[4][3] = {
    type: "settlement",
    color: "yellow",
  };

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

  function update() {}

  function draw() {
    if (!canvasRef) return;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    ctx.save();

    ctx.translate(x, y);
    ctx.scale(scale, scale);

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
        hexagon(
          ctx,
          tileX,
          tileY,
          RADIUS * 1.25,
          COLORS.Background,
          COLORS.Background,
          "rgba(0,0,0,0)",
        );
        hexagon(ctx, tileX, tileY, RADIUS, topColor, bottomColor, borderColor);
        if (tile.value > 0) {
          const result = firstValue() + secondValue();
          if (darkenTile() && tile.value === result) {
            hexagon(
              ctx,
              tileX,
              tileY,
              RADIUS,
              "rgba(0, 0, 0, 0.65)",
              "rgba(0, 0, 0, 0.65)",
              "rgba(0,0,0,0)",
            );
          }

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

    const startBuildingX = startX;
    const startBuildingY = startY - RADIUS * 1.1;

    rowIndex = 0;
    let colIndex = 0;
    let buildingX = startBuildingX;
    let buildingY = startBuildingY;
    for (const row of buildings) {
      for (const building of row) {
        if (building) {
          let topColor = "";
          let bottomColor = "";
          switch (building.color) {
            case "red":
              topColor = COLORS.RedTop;
              bottomColor = COLORS.RedBottom;
              break;
            case "blue":
              topColor = COLORS.BlueTop;
              bottomColor = COLORS.BlueBottom;
              break;
            case "green":
              topColor = COLORS.GreenTop;
              bottomColor = COLORS.GreenBottom;
              break;
            case "yellow":
              topColor = COLORS.YellowTop;
              bottomColor = COLORS.YellowBottom;
              break;
          }
          square(
            ctx,
            buildingX,
            buildingY,
            RADIUS * 0.25,
            topColor,
            bottomColor,
          );
        }
        buildingX += RADIUS * 2;
        colIndex++;
      }
      rowIndex++;
      switch (rowIndex) {
        case 0:
        case 11:
          buildingX = startBuildingX;
          break;
        case 1:
        case 2:
        case 9:
        case 10:
          buildingX = startBuildingX - RADIUS;
          break;
        case 3:
        case 4:
        case 7:
        case 8:
          buildingX = startBuildingX - RADIUS * 2;
          break;
        case 5:
        case 6:
          buildingX = startBuildingX - RADIUS * 3;
          break;
      }
      if (rowIndex % 2 === 0) {
        buildingY += RADIUS * 1.25;
      } else {
        buildingY += RADIUS * 0.5;
      }
      colIndex = 0;
    }

    ctx.restore();
  }

  function rollDice() {
    setDarkenTile(false);
    let firstValues: DiceValue[] = [];
    let secondValues: DiceValue[] = [];

    for (let i = 0; i < ROLL_ITERATIONS; i++) {
      let firstValue = randomValue();
      while (firstValues.includes(firstValue)) {
        firstValue = randomValue();
      }
      firstValues.push(firstValue);

      let secondValue = randomValue();
      while (secondValues.includes(secondValue)) {
        secondValue = randomValue();
      }
      secondValues.push(secondValue);
    }

    let index = 0;
    const interval = setInterval(() => {
      setFirstValue(firstValues[index]);
      setSecondValue(secondValues[index]);
      index++;
      if (index >= ROLL_ITERATIONS) {
        clearInterval(interval);
        setRolledDice(true);
        setDarkenTile(true);
      }
    }, ROLL_INTERVAL);
  }

  function randomValue() {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
  }

  function handleResize() {
    if (!parentRef) return;
    if (!canvasRef) return;

    canvasRef.width = parentRef.clientWidth;
    canvasRef.height = parentRef.clientHeight;

    x = canvasRef.width / 2;
    y = canvasRef.height / 2;

    const width = RADIUS * 1.75 * 6;
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
    if (!rolledDice()) return;

    const result = firstValue() + secondValue();

    // Find the row and column of the tiles with a value matching the result
    const matchingTiles: Position[] = [];
    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        if (tiles[row][col].value === result) {
          matchingTiles.push({ row, col });
        }
      }
    }

    for (const tile of matchingTiles) {
      const vertices = listTileVertices(tile);
      for (const vertex of vertices) {
        const building = buildings[vertex.row][vertex.col];
        if (building) {
          if (building.color === "red") {
            setHand((prev) => ({
              ...prev,
              [tiles[tile.row][tile.col].type as CardType]:
                prev[tiles[tile.row][tile.col].type as CardType] + 1,
            }));
          }
        }
      }
    }

    const nextPlayerId = (parseInt(rollingPlayerId()) % 4) + 1;
    setRollingPlayerId(nextPlayerId.toString());
    setRolledDice(false);

    if (rollingPlayerId() === ACTIVE_PLAYER_ID) return;

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
            activePlayerId={ACTIVE_PLAYER_ID}
            rollingPlayerId={rollingPlayerId()}
          />
          <div class="relative w-full grow" ref={parentRef}>
            <canvas class="h-full w-full rounded-md" ref={canvasRef} />
            <div class="absolute right-0 bottom-0 z-100 h-12 md:h-18">
              <Dice
                rollDice={rollDice}
                firstValue={firstValue()}
                secondValue={secondValue()}
                active={rollingPlayerId() === ACTIVE_PLAYER_ID}
              />
            </div>
          </div>
          <div class="flex h-14 w-full items-center justify-between gap-1 md:h-28">
            <div class="h-full grow">
              <Hand hand={hand()} />
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

function Hand(props: { hand: Record<CardType, number> }) {
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

function Card(props: { type: CardType; count?: number }) {
  const colors: Record<CardType, string> = {
    lumber: "from-green-700 to-green-800",
    brick: "from-orange-600 to-orange-700",
    wool: "from-green-500 to-green-600",
    grain: "from-yellow-500 to-yellow-600",
    ore: "from-stone-400 to-stone-500",
    resource: "from-blue-400 to-blue-500",
    development: "from-purple-400 to-purple-500",
  };

  const stack = () => {
    if (!props.count) return [];
    return Array.from({ length: props.count - 1 }, (_, i) => i);
  };

  const leftOffset = () => {
    if (!props.count) return 0;
    return (props.count - 1) * 6;
  };

  return (
    <div
      class="relative aspect-10/16 h-3/4"
      style={{ "margin-left": `${leftOffset()}px` }}
    >
      <div
        class={cn(
          "relative z-100 h-full w-full cursor-pointer rounded-sm border border-black bg-linear-to-b shadow-md transition-transform duration-100 hover:scale-95 md:border-2",
          colors[props.type],
        )}
      >
        <Show when={props.count}>
          <p class="absolute top-0 right-0 flex aspect-square w-3 items-center justify-center rounded-tr-sm rounded-bl-sm bg-zinc-50 text-[8px] font-bold md:w-5 md:text-xs">
            {props.count}
          </p>
        </Show>
      </div>
      <For each={stack()}>
        {(index) => (
          <div
            class={cn(
              "absolute top-0 left-0 aspect-10/16 h-full w-full cursor-pointer rounded-sm border border-black bg-linear-to-b transition-transform duration-100 hover:scale-95 md:border-2",
              colors[props.type],
            )}
            style={{
              transform: `translateX(-${(index + 1) * 6}px)`,
              "z-index": 10 - index,
            }}
          ></div>
        )}
      </For>
    </div>
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
