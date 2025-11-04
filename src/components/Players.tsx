import { Index } from "solid-js";
import { cn } from "@/lib/utils";
import { assert } from "@/lib/assert";

type PlayerColor = "red" | "blue" | "green" | "yellow";

type Player = {
  id: string;
  name: string;
  color: PlayerColor;
};

export function Players(props: {
  activePlayerId: string;
  rollingPlayerId: string;
}) {
  const players: Player[] = [
    { id: "1", name: "Player 1", color: "red" },
    { id: "2", name: "Player 2", color: "blue" },
    { id: "3", name: "Player 3", color: "green" },
    { id: "4", name: "Player 4", color: "yellow" },
  ];

  return (
    <div class="grid h-24 w-full grid-cols-2 grid-rows-2 gap-1 md:h-18 md:grid-cols-4 md:grid-rows-1">
      <Index each={players}>
        {(player) => (
          <Player
            name={player().name}
            color={player().color}
            active={player().id === props.activePlayerId}
            rolling={player().id === props.rollingPlayerId}
          />
        )}
      </Index>
    </div>
  );
}

function Player(props: {
  name: string;
  color: PlayerColor;
  active?: boolean;
  rolling?: boolean;
}) {
  assert(
    ["red", "blue", "green", "yellow"].includes(props.color),
    `Invalid player color: ${props.color}`,
  );

  const activeClass = () => {
    return props.active ? "border-2" : "border-1";
  };

  const rollingClass = () => {
    return props.rolling
      ? "from-zinc-100 to-zinc-200"
      : "from-zinc-300 to-zinc-400";
  };

  const circleClass = () => {
    switch (props.color) {
      case "red":
        return "from-red-400 to-red-600 border-red-800";
      case "blue":
        return "from-blue-400 to-blue-600 border-blue-800";
      case "green":
        return "from-green-400 to-green-600 border-green-800";
      case "yellow":
        return "from-yellow-400 to-yellow-600 border-yellow-800";
    }
  };

  const textClass = () => {
    switch (props.color) {
      case "red":
        return "text-red-800";
      case "blue":
        return "text-blue-800";
      case "green":
        return "text-green-800";
      case "yellow":
        return "text-yellow-800";
    }
  };

  return (
    <div
      class={cn(
        "flex h-full w-full items-center justify-start gap-2 rounded-md border-black bg-linear-to-b p-2 shadow-md",
        activeClass(),
        rollingClass(),
      )}
    >
      <div
        class={cn("size-8 rounded-full border bg-linear-to-b", circleClass())}
      ></div>
      <h1 class={cn("text-xl font-bold md:text-2xl", textClass())}>
        {props.name}
      </h1>
    </div>
  );
}
