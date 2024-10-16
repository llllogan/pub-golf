// routes.ts

import { Router, Context } from "./deps.ts";
import { DB } from "./deps.ts";
import * as models from "./models.ts";

/**
 * Initializes the router and defines API endpoints for the specified functions.
 * @param db - The database connection instance.
 * @returns The configured router.
 */
export function initRoutes(db: DB): Router {
  const router = new Router();

  /* Hole Endpoints */

  // Get a hole by ID
  router.get("/holes/:hole_id", (context: Context) => {
    const hole_id = parseInt(context.params.hole_id);

    if (isNaN(hole_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid hole ID" };
      return;
    }

    const hole = models.getHole(db, hole_id);

    if (hole) {
      context.response.body = hole;
    } else {
      context.response.status = 404;
      context.response.body = { error: "Hole not found" };
    }
  });

  // Update the par of a hole
  router.put("/holes/:hole_id", async (context: Context) => {
    const hole_id = parseInt(context.params.hole_id);
    const body = await context.request.body({ type: "json" }).value;
    const { par } = body;

    if (isNaN(hole_id) || typeof par !== "number") {
      context.response.status = 400;
      context.response.body = { error: "Invalid input data" };
      return;
    }

    // Check if the hole exists
    const hole = models.getHole(db, hole_id);

    if (!hole) {
      context.response.status = 404;
      context.response.body = { error: "Hole not found" };
      return;
    }

    models.updateHolePar(db, hole_id, par);
    context.response.status = 200;
    context.response.body = { message: "Hole par updated successfully" };
  });

  /* Team Endpoints */

  // Get all teams
  router.get("/teams", (context: Context) => {
    const teams = models.getAllTeams(db);
    context.response.body = teams;
  });

  /* User Endpoints */

  // Get all users of a team
  router.get("/teams/:team_id/users", (context: Context) => {
    const team_id = parseInt(context.params.team_id);

    if (isNaN(team_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid team ID" };
      return;
    }

    // Check if the team exists
    const teams = models.getAllTeams(db);
    const teamExists = teams.some((team) => team.id === team_id);

    if (!teamExists) {
      context.response.status = 404;
      context.response.body = { error: "Team not found" };
      return;
    }

    const users = models.getUsersByTeam(db, team_id);
    context.response.body = users;
  });

  /* Score Endpoints */

  // Get the score of a user for a hole
  router.get("/users/:user_id/holes/:hole_id/score", (context: Context) => {
    const user_id = parseInt(context.params.user_id);
    const hole_id = parseInt(context.params.hole_id);

    if (isNaN(user_id) || isNaN(hole_id)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid user ID or hole ID" };
      return;
    }

    const sips = models.getUserScoreForHole(db, user_id, hole_id);

    if (sips !== null) {
      context.response.body = { user_id, hole_id, sips };
    } else {
      context.response.status = 404;
      context.response.body = { error: "Score not found" };
    }
  });

  // Update the score of a user for a hole
  router.put("/users/:user_id/holes/:hole_id/score", async (context: Context) => {
    const user_id = parseInt(context.params.user_id);
    const hole_id = parseInt(context.params.hole_id);
    const body = await context.request.body({ type: "json" }).value;
    const { sips } = body;

    if (isNaN(user_id) || isNaN(hole_id) || typeof sips !== "number") {
      context.response.status = 400;
      context.response.body = { error: "Invalid input data" };
      return;
    }

    // Assume that users and holes exist since they are managed manually
    models.updateUserScoreForHole(db, user_id, hole_id, sips);
    context.response.status = 200;
    context.response.body = { message: "Score updated successfully" };
  });

  return router;
}