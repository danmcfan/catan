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
  type: TileType;
  value: number;
};

export type BuildingType = "settlement" | "city";

export type Building = {
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
