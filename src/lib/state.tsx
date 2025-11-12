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
    tiles: Tile[];
    buildings: Building[];
  };
};

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
    tiles: [],
    buildings: [],
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
