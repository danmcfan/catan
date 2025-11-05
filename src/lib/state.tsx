import { createContext, useContext, type JSX } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import type { Building, CardType, Die, Tile } from "@/lib/types";

export type State = {
  dice: {
    first: Die;
    second: Die;
    rolled: boolean;
  };
  turn: {
    activePlayerId: string;
    rollingPlayerId: string;
    darkenTiles: boolean;
  };
  hand: Record<CardType, number>;
  board: {
    tiles: Tile[][];
    buildings: (Building | null)[][];
  };
};

const initialTiles: Tile[][] = [
  // Row 1 (3 tiles)
  [
    { type: "ore", value: 10 },
    { type: "wool", value: 2 },
    { type: "lumber", value: 9 },
  ],
  // Row 2 (4 tiles)
  [
    { type: "grain", value: 12 },
    { type: "brick", value: 6 },
    { type: "wool", value: 4 },
    { type: "brick", value: 10 },
  ],
  // Row 3 (5 tiles)
  [
    { type: "grain", value: 9 },
    { type: "lumber", value: 11 },
    { type: "desert", value: 0 },
    { type: "lumber", value: 3 },
    { type: "ore", value: 8 },
  ],
  // Row 4 (4 tiles)
  [
    { type: "lumber", value: 8 },
    { type: "ore", value: 3 },
    { type: "grain", value: 4 },
    { type: "wool", value: 5 },
  ],
  // Row 5 (3 tiles)
  [
    { type: "brick", value: 5 },
    { type: "grain", value: 6 },
    { type: "wool", value: 11 },
  ],
];

const initialBuildings: (Building | null)[][] = [
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

initialBuildings[8][1] = { type: "settlement", color: "red" };
initialBuildings[9][2] = { type: "settlement", color: "red" };
initialBuildings[6][1] = { type: "settlement", color: "blue" };
initialBuildings[7][2] = { type: "settlement", color: "blue" };
initialBuildings[4][1] = { type: "settlement", color: "green" };
initialBuildings[6][4] = { type: "settlement", color: "green" };
initialBuildings[3][2] = { type: "settlement", color: "yellow" };
initialBuildings[4][3] = { type: "settlement", color: "yellow" };

const initialState: State = {
  dice: {
    first: 1,
    second: 1,
    rolled: false,
  },
  turn: {
    activePlayerId: "1",
    rollingPlayerId: "1",
    darkenTiles: false,
  },
  hand: {
    lumber: 0,
    brick: 0,
    wool: 0,
    grain: 0,
    ore: 0,
    resource: 0,
    development: 0,
  },
  board: {
    tiles: initialTiles,
    buildings: initialBuildings,
  },
};

type StateContextValue = [state: State, setState: SetStoreFunction<State>];

const StateContext = createContext<StateContextValue>();

export function StateProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore(initialState);

  return (
    <StateContext.Provider value={[state, setState]}>
      {props.children}
    </StateContext.Provider>
  );
}

export function useState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useState must be used within a StateProvider");
  }
  return context;
}

export function useDice() {
  const [state, _] = useState();
  const [dice, setDice] = createStore(state.dice);

  return [dice, setDice] as const;
}
