// models.ts

import { DB } from "./deps.ts";
import { Team, User, Hole, Score } from "./types.ts";

/* Team Operations */

/**
 * Retrieves all teams.
 * @param db - The database connection.
 * @returns An array of Team objects.
 */
export function getAllTeams(db: DB): Team[] {
    const result = db.query("SELECT id, name FROM teams") as Array<[number, string]>;
  
    const teams = result.map(([id, name]) => ({ id, name }));
    return teams;
  }

/* User Operations */

/**
 * Retrieves all users belonging to a team.
 * @param db - The database connection.
 * @param team_id - The ID of the team.
 * @returns An array of User objects.
 */
export function getUsersByTeam(db: DB, team_id: number): User[] {
    const result = db.query(
      "SELECT id, name, team_id FROM users WHERE team_id = ?",
      [team_id]
    ) as Array<[number, string, number]>;
  
    const users: User[] = [];
  
    for (const [id, name, team_id] of result) {
      users.push({ id, name, team_id });
    }
  
    return users;
  }

/* Hole Operations */

/**
 * Retrieves a hole by its ID.
 * @param db - The database connection.
 * @param hole_id - The ID of the hole.
 * @returns The Hole object or null if not found.
 */
export function getHole(db: DB, hole_id: number): Hole | null {
    const result = db.query(
      "SELECT id, name, par, location, time FROM holes WHERE id = ?",
      [hole_id]
    ) as Array<[number, string, number, string | undefined, string | undefined]>;
  
    if (result.length > 0) {
      const [id, name, par, location, time] = result[0];
      return { id, name, par, location, time };
    } else {
      return null;
    }
  }
  
  /**
   * Updates the par of a hole.
   * @param db - The database connection.
   * @param hole_id - The ID of the hole.
   * @param par - The new par value.
   */
  export function updateHolePar(db: DB, hole_id: number, par: number): void {
    db.query("UPDATE holes SET par = ? WHERE id = ?", [par, hole_id]);
  }
  
  /* Score Operations */
  
  /**
   * Retrieves the score of a user for a specific hole.
   * @param db - The database connection.
   * @param user_id - The ID of the user.
   * @param hole_id - The ID of the hole.
   * @returns The number of sips or null if not recorded.
   */
  export function getUserScoreForHole(
    db: DB,
    user_id: number,
    hole_id: number
  ): number | null {
    const result = db.query(
      "SELECT sips FROM user_scores WHERE user_id = ? AND hole_id = ?",
      [user_id, hole_id]
    );
  
    if (result.length > 0) {
      const [sips]: [number] = result[0] as [number];
      return sips;
    } else {
      return null;
    }
  }
  
  /**
   * Updates the score of a user for a specific hole.
   * @param db - The database connection.
   * @param user_id - The ID of the user.
   * @param hole_id - The ID of the hole.
   * @param sips - The number of sips taken.
   */
  export function updateUserScoreForHole(
    db: DB,
    user_id: number,
    hole_id: number,
    sips: number
  ): void {
    db.query(
      `INSERT INTO user_scores (user_id, hole_id, sips)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, hole_id) DO UPDATE SET sips=excluded.sips`,
      [user_id, hole_id, sips]
    );
  }

  /**
   * 
   * @param db Gets the scores for a hole
   * @param holeId 
   * @returns 
   */
  export function getScoresByHole(db: DB, holeId: number): Score[] {
    const scores: Score[] = [];
  
    const query = `
      SELECT user_id, sips
      FROM scores
      WHERE hole_id = ?
    `;
  
    for (const [user_id, sips] of db.query<[number, number]>(query, [holeId])) {
      scores.push({ user_id, hole_id: holeId, sips });
    }
  
    return scores;
  }