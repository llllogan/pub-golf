// routes.ts

import { Router, Context } from "./deps.ts";
import { DB } from "./deps.ts";
import * as models from "./models.ts";

/**
 * Initializes the router and defines all API endpoints.
 * @param {DB} db - The database connection instance.
 * @returns {Router} The configured router.
 */
export function initRoutes(db: DB): Router {
  const router = new Router();

  /* Users Endpoints */

  // Get all users
  router.get("/users", (context: Context) => {
    context.response.body = models.getUsers(db);
  });

  // Add a new user
  router.post("/users", async (context: Context) => {
    const body = await context.request.body({ type: "json" }).value;
    const { name, team_id } = body;

    if (!name) {
      context.response.status = 400;
      context.response.body = { error: "Name is required" };
      return;
    }

    models.addUser(db, name, team_id || null);
    context.response.status = 201;
    context.response.body = { message: "User created" };
  });

  // Get a user's scores
  router.get("/users/:user_id/scores", (context: Context) => {
    const user_id = parseInt(context.params.user_id);

    if (isNaN(user_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid user ID" };
      return;
    }

    context.response.body = models.getUserScores(db, user_id);
  });

  // Get total score for a user
  router.get("/users/:user_id/total_score", (context: Context) => {
    const user_id = parseInt(context.params.user_id);

    if (isNaN(user_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid user ID" };
      return;
    }

    const totalScore = models.getTotalScoreByUser(db, user_id);
    context.response.body = { user_id, totalScore };
  });

  // Add or update a user's score
  router.post("/users/:user_id/holes/:hole_id/score", async (context: Context) => {
    const user_id = parseInt(context.params.user_id);
    const hole_id = parseInt(context.params.hole_id);
    const body = await context.request.body({ type: "json" }).value;
    const { sips } = body;

    if (isNaN(user_id) || isNaN(hole_id) || typeof sips !== "number") {
      context.response.status = 400;
      context.response.body = { error: "Invalid input data" };
      return;
    }

    // Validate user and hole existence
    const userExists = db.query("SELECT id FROM users WHERE id = ?", [user_id]);
    const holeExists = db.query("SELECT id FROM holes WHERE id = ?", [hole_id]);

    if (userExists.length === 0 || holeExists.length === 0) {
      context.response.status = 404;
      context.response.body = { error: "User or Hole not found" };
      return;
    }

    models.addOrUpdateUserScore(db, user_id, hole_id, sips);
    context.response.status = 200;
    context.response.body = { message: "Score recorded successfully" };
  });

  /* Teams Endpoints */

  // Get all teams
  router.get("/teams", (context: Context) => {
    context.response.body = models.getTeams(db);
  });

  // Add a new team
  router.post("/teams", async (context: Context) => {
    const body = await context.request.body({ type: "json" }).value;
    const { name } = body;

    if (!name) {
      context.response.status = 400;
      context.response.body = { error: "Name is required" };
      return;
    }

    models.addTeam(db, name);
    context.response.status = 201;
    context.response.body = { message: "Team created" };
  });

  // Get total score for a team
  router.get("/teams/:team_id/total_score", (context: Context) => {
    const team_id = parseInt(context.params.team_id);

    if (isNaN(team_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid team ID" };
      return;
    }

    const totalScore = models.getTotalScoreByTeam(db, team_id);
    context.response.body = { team_id, totalScore };
  });

  // Get team score for a hole
  router.get("/teams/:team_id/holes/:hole_id/score", (context: Context) => {
    const team_id = parseInt(context.params.team_id);
    const hole_id = parseInt(context.params.hole_id);

    if (isNaN(team_id) || isNaN(hole_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid team ID or hole ID" };
      return;
    }

    const teamScore = models.getTeamScoreByHole(db, team_id, hole_id);
    context.response.body = { team_id, hole_id, teamScore };
  });

  /* Holes Endpoints */

  // Get all holes
  router.get("/holes", (context: Context) => {
    context.response.body = models.getHoles(db);
  });

  // Add a new hole
  router.post("/holes", async (context: Context) => {
    const body = await context.request.body({ type: "json" }).value;
    const { name, par } = body;

    if (!name || typeof par !== "number") {
      context.response.status = 400;
      context.response.body = { error: "Name and par are required" };
      return;
    }

    models.addHole(db, name, par);
    context.response.status = 201;
    context.response.body = { message: "Hole created" };
  });

  /* Leaderboard Endpoints */

  // Individual leaderboard
  router.get("/leaderboard/individuals", (context: Context) => {
    context.response.body = models.getIndividualLeaderboard(db);
  });

  // Team leaderboard
  router.get("/leaderboard/teams", (context: Context) => {
    context.response.body = models.getTeamLeaderboard(db);
  });

  return router;
}