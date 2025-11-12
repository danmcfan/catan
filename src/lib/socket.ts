import type { SetStoreFunction } from "solid-js/store";
import type { State } from "@/lib/state";
import type { Tile } from "@/lib/types";
import type { Building } from "@/lib/types";

export function connect(setState: SetStoreFunction<State>) {
  const secured = window.location.protocol === "https:";
  const url = secured
    ? "wss://catan.dannyobrien.dev/ws"
    : "ws://localhost:8080/ws";

  const socket = new WebSocket(url);

  socket.onopen = () => {
    console.debug("Connected to server");
  };

  socket.onmessage = (event) => {
    console.debug("Message from server", event.data);

    const data = JSON.parse(event.data);
    if (data.tiles) {
      setState("board", "tiles", data.tiles as Tile[]);
    }
    if (data.buildings) {
      setState("board", "buildings", data.buildings as Building[]);
    }
  };

  socket.onerror = (event) => {
    console.error("Error from server", event);
  };

  socket.onclose = () => {
    console.debug("Disconnected from server");
  };
}
