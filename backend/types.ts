// types.ts

export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  team_id: number;
}

export interface Hole {
  id: number;
  name: string;
  par: number;
  location?: string;
  time?: string;
}

export interface Score {
  user_id: number;
  hole_id: number;
  sips: number;
}