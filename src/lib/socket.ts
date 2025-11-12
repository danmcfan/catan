import type { SetStoreFunction } from "solid-js/store";
import type { State } from "@/lib/state";
import type { Tile } from "@/lib/types";
import type { Building } from "@/lib/types";

export function connect(setState: SetStoreFunction<State>) {
  const socket = new WebSocket("ws://localhost:8080/ws");

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
