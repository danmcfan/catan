export type CardType =
  | "lumber"
  | "brick"
  | "wool"
  | "grain"
  | "ore"
  | "resource"
  | "development";

export type TileType = "desert" | "lumber" | "brick" | "wool" | "grain" | "ore";

export type Tile = {
  cube: {
    q: number;
    r: number;
    s: number;
  };
  resource: TileType;
  number: number;
};

export type BuildingType = "settlement" | "city";

export type Building = {
  q: number;
  r: number;
  v: number;
  type: BuildingType;
  color: string;
};

export type PlayerColor = "red" | "blue" | "green" | "yellow";

export type Player = {
  id: string;
  name: string;
  color: PlayerColor;
};

export type Position = {
  row: number;
  col: number;
};

export type Die = 1 | 2 | 3 | 4 | 5 | 6;

export type Result = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Options = {
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
};
