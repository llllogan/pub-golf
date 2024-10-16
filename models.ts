// models.ts

import { DB } from "./deps.ts";

/**
 * Database operation functions for holes, teams, users, and scores.
 * Each function interacts with the database instance passed as an argument.
 */

/* Hole Operations */

/**
 * Retrieves a hole by its ID.
 * @param db - The database connection.
 * @param hole_id - The ID of the hole.
 * @returns The hole data or null if not found.
 */
export function getHole(db: DB, hole_id: number): object | null {
  const result = db.query(
    "SELECT id, name, par FROM holes WHERE id = ?",
    [hole_id]
  );

  if (result.length > 0) {
    const [id, name, par] = result[0];
    return { id, name, par };
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

/* Team Operations */

/**
 * Retrieves all teams.
 * @param db - The database connection.
 * @returns A list of teams.
 */
export function getAllTeams(db: DB): Array<object> {
  const teams = [];
  for (const [id, name] of db.query("SELECT id, name FROM teams")) {
    teams.push({ id, name });
  }
  return teams;
}

/* User Operations */

/**
 * Retrieves all users belonging to a team.
 * @param db - The database connection.
 * @param team_id - The ID of the team.
 * @returns A list of users in the team.
 */
export function getUsersByTeam(db: DB, team_id: number): Array<object> {
  const users = [];
  for (const [id, name] of db.query(
    "SELECT id, name FROM users WHERE team_id = ?",
    [team_id]
  )) {
    users.push({ id, name });
  }
  return users;
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
    const [sips] = result[0];
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