// database.ts

import { DB } from "./deps.ts";

/**
 * Initializes the SQLite database, creates tables if they don't exist,
 * and inserts initial data for teams, users, and holes.
 * @returns {DB} The database connection instance.
 */
export function initDB(): DB {
  const db = new DB("pub_golf.db");

  // Create teams table
  db.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // Create users table
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team_id INTEGER,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // Create holes table
  db.query(`
    CREATE TABLE IF NOT EXISTS holes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      par INTEGER NOT NULL,
      location TEXT,
      time TEXT
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

  /** Insert initial data **/

  // Teams data
  const teams = [
    { name: "Blue" },
    { name: "Purple" },
    { name: "Red" },
    { name: "Green" },
  ];

  // Insert teams and keep track of their IDs
  const teamIds: { [key: string]: number } = {};

  for (const team of teams) {
    db.query("INSERT INTO teams (name) VALUES (?)", [team.name]);
    const teamId = db.query("SELECT last_insert_rowid()")[0][0] as number;
    teamIds[team.name] = teamId;
  }

  // Users data
  const users = [
    // Blue Team
    { name: "Logan", team: "Blue" },
    { name: "Rod", team: "Blue" },
    { name: "Emily", team: "Blue" },
    { name: "Georgia", team: "Blue" },
    // Purple Team
    { name: "Hamish", team: "Purple" },
    { name: "Clair", team: "Purple" },
    { name: "Riley", team: "Purple" },
    // Red Team
    { name: "Shak", team: "Red" },
    { name: "Bertie", team: "Red" },
    { name: "Tyler", team: "Red" },
    // Green Team
    { name: "Sam", team: "Green" },
    { name: "Bugg", team: "Green" },
    { name: "Charlie", team: "Green" },
  ];

  // Insert users
  for (const user of users) {
    const teamId = teamIds[user.team];
    db.query("INSERT INTO users (name, team_id) VALUES (?, ?)", [
      user.name,
      teamId,
    ]);
  }

  // Holes data
  const holes = [
    {
      name: "Red Brick Hotel",
      par: 0,
      location: "83 Annerley Road Woolloongabba",
      time: "2024-10-19T14:00:00",
    },
    {
      name: "Brisbane Brewing Co",
      par: 0,
      location: "601 Stanley Street Woolloongabba",
      time: "2024-10-19T15:45:00",
    },
    {
      name: "Rose and Crown",
      par: 0,
      location: "275 Grey Street South Bank",
      time: "2024-10-19T16:30:00",
    },
    {
      name: "Hop and Pickle",
      par: 0,
      location: "6 Little Stanley Street South Brisbane",
      time: "2024-10-19T17:15:00",
    },
    {
      name: "The Charming Squire",
      par: 0,
      location: "133 Grey Street South Brisbane",
      time: "2024-10-19T18:00:00",
    },
    {
      name: "Criterion Tavern",
      par: 0,
      location: "239 George Street Brisbane",
      time: "2024-10-19T18:45:00",
    },
    {
      name: "Gilhooleys",
      par: 0,
      location: "Albert Street & Charlotte Street Brisbane City",
      time: "2024-10-19T20:15:00",
    },
    {
      name: "Winghaus Edward Street",
      par: 0,
      location: "144 Edward Street Brisbane City",
      time: "2024-10-19T21:00:00",
    },
    {
      name: "Pig 'n' Whistle",
      par: 0,
      location: "123 Eagle Street Brisbane City",
      time: "2024-10-19T21:45:00",
    },
  ];

  // Insert holes
  for (const hole of holes) {
    db.query(
      "INSERT INTO holes (name, par, location, time) VALUES (?, ?, ?, ?)",
      [hole.name, hole.par, hole.location, hole.time]
    );
  }

  return db;
}