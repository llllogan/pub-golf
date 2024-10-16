// database.ts

import { DB } from "./deps.ts";

/**
 * Initializes the SQLite database and creates tables if they don't exist.
 * @returns {DB} The database connection instance.
 */
export function initDB(): DB {
  const db = new DB("pub_golf.db");

  // Create users table
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team_id INTEGER,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // Create teams table
  db.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // Create holes table
  db.query(`
    CREATE TABLE IF NOT EXISTS holes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      par INTEGER NOT NULL
    )
  `);

  // Create user_scores table
  db.query(`
    CREATE TABLE IF NOT EXISTS user_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      hole_id INTEGER NOT NULL,
      sips INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (hole_id) REFERENCES holes(id),
      UNIQUE (user_id, hole_id)
    )
  `);

  return db;
}