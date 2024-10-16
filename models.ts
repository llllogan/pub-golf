// models.ts

import { DB } from "./deps.ts";

/**
 * Database operation functions for users, teams, holes, and scores.
 * Each function interacts with the database instance passed as an argument.
 */

/* User Operations */

export function getUsers(db: DB): Array<object> {
  const users = [];
  for (const [id, name, team_id] of db.query(
    "SELECT id, name, team_id FROM users"
  )) {
    users.push({ id, name, team_id });
  }
  return users;
}

export function addUser(db: DB, name: string, team_id: number | null): void {
  db.query(
    "INSERT INTO users (name, team_id) VALUES (?, ?)",
    [name, team_id]
  );
}

/* Team Operations */

export function getTeams(db: DB): Array<object> {
  const teams = [];
  for (const [id, name] of db.query("SELECT id, name FROM teams")) {
    teams.push({ id, name });
  }
  return teams;
}

export function addTeam(db: DB, name: string): void {
  db.query("INSERT INTO teams (name) VALUES (?)", [name]);
}

/* Hole Operations */

export function getHoles(db: DB): Array<object> {
  const holes = [];
  for (const [id, name, par] of db.query(
    "SELECT id, name, par FROM holes"
  )) {
    holes.push({ id, name, par });
  }
  return holes;
}

export function addHole(db: DB, name: string, par: number): void {
  db.query("INSERT INTO holes (name, par) VALUES (?, ?)", [name, par]);
}

/* User Scores Operations */

export function addOrUpdateUserScore(
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

export function getUserScores(db: DB, user_id: number): Array<object> {
  const scores = [];
  for (const [hole_id, sips] of db.query(
    "SELECT hole_id, sips FROM user_scores WHERE user_id = ?",
    [user_id]
  )) {
    scores.push({ hole_id, sips });
  }
  return scores;
}

export function getTotalScoreByUser(db: DB, user_id: number): number {
  const [total] = db.query(
    "SELECT SUM(sips) FROM user_scores WHERE user_id = ?",
    [user_id]
  )[0] || [0];
  return total;
}

export function getTeamScoreByHole(
  db: DB,
  team_id: number,
  hole_id: number
): number {
  const [total] = db.query(
    `SELECT SUM(us.sips)
     FROM user_scores us
     JOIN users u ON us.user_id = u.id
     WHERE u.team_id = ? AND us.hole_id = ?`,
    [team_id, hole_id]
  )[0] || [0];
  return total;
}

export function getTotalScoreByTeam(db: DB, team_id: number): number {
  const [total] = db.query(
    `SELECT SUM(us.sips)
     FROM user_scores us
     JOIN users u ON us.user_id = u.id
     WHERE u.team_id = ?`,
    [team_id]
  )[0] || [0];
  return total;
}

/* Leaderboard Functions */

export function getIndividualLeaderboard(db: DB): Array<object> {
  const leaderboard = [];
  for (const [user_id, user_name, total_sips] of db.query(`
    SELECT u.id, u.name, SUM(us.sips) as total_sips
    FROM users u
    LEFT JOIN user_scores us ON u.id = us.user_id
    GROUP BY u.id
    ORDER BY total_sips ASC
  `)) {
    leaderboard.push({ user_id, user_name, total_sips });
  }
  return leaderboard;
}

export function getTeamLeaderboard(db: DB): Array<object> {
  const leaderboard = [];
  for (const [team_id, team_name, total_sips] of db.query(`
    SELECT t.id, t.name, SUM(us.sips) as total_sips
    FROM teams t
    LEFT JOIN users u ON t.id = u.team_id
    LEFT JOIN user_scores us ON u.id = us.user_id
    GROUP BY t.id
    ORDER BY total_sips ASC
  `)) {
    leaderboard.push({ team_id, team_name, total_sips });
  }
  return leaderboard;
}