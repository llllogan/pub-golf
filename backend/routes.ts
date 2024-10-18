// routes.ts

import { Router, RouterContext } from "./deps.ts";
import { DB } from "./deps.ts";
import * as models from "./models.ts";
import { Team, User, Hole, Score } from "./types.ts";

/**
 * Initializes the router and defines API endpoints.
 * @param db - The database connection instance.
 * @returns The configured router.
 */
export function initRoutes(db: DB): Router {
  const router = new Router();

  /* Team Endpoints */

  // Get all teams
  router.get("/teams", (context: RouterContext<"/teams">) => {
    const teams: Team[] = models.getAllTeams(db);
    context.response.body = teams;
  });

  // Get all users of a team
  router.get("/teams/:team_id/users", (context: RouterContext<"/teams/:team_id/users">) => {
    const { team_id } = context.params;
    const teamId = parseInt(team_id);

    if (isNaN(teamId)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid team ID" };
      return;
    }

    // Check if the team exists
    const teams: Team[] = models.getAllTeams(db);
    const teamExists = teams.some((team) => team.id === teamId);

    if (!teamExists) {
      context.response.status = 404;
      context.response.body = { error: "Team not found" };
      return;
    }

    const users: User[] = models.getUsersByTeam(db, teamId);
    context.response.body = users;
  });

  // Get all users
  router.get("/users", (context: RouterContext<"/users">) => {
    try {
      const users: User[] = models.getAllUsers(db);
      context.response.body = users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  });

  /* Hole Endpoints */

  // Get all holes
  router.get("/holes", (context: RouterContext<"/holes">) => {
    try {
      const holes: Hole[] = models.getAllHoles(db);
      context.response.body = holes;
    } catch (error) {
      console.error("Error fetching all holes:", error);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  });

  // Get a hole by ID
  router.get("/holes/:hole_id", (context: RouterContext<"/holes/:hole_id">) => {
    const { hole_id } = context.params;
    const holeId = parseInt(hole_id);

    if (isNaN(holeId)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid hole ID" };
      return;
    }

    const hole: Hole | null = models.getHole(db, holeId);

    if (hole) {
      context.response.body = hole;
    } else {
      context.response.status = 404;
      context.response.body = { error: "Hole not found" };
    }
  });

  // Update the par of a hole
  router.put("/holes/:hole_id", async (context: RouterContext<"/holes/:hole_id">) => {
    const { hole_id } = context.params;
    const holeId = parseInt(hole_id);
    const body = await context.request.body({ type: "json" }).value;

    // Example
    // {
    //   "par": 3
    // }
    
    const { par } = body;

    if (isNaN(holeId) || typeof par !== "number") {
      context.response.status = 400;
      context.response.body = { error: "Invalid input data" };
      return;
    }

    // Check if the hole exists
    const hole: Hole | null = models.getHole(db, holeId);

    if (!hole) {
      context.response.status = 404;
      context.response.body = { error: "Hole not found" };
      return;
    }

    models.updateHolePar(db, holeId, par);
    context.response.status = 200;
    context.response.body = { message: "Hole par updated successfully" };
  });

  /* Score Endpoints */

  // Get the score of a user for a hole
  router.get(
    "/users/:user_id/holes/:hole_id/score",
    (context: RouterContext<"/users/:user_id/holes/:hole_id/score">) => {
      const { user_id, hole_id } = context.params;
      const userId = parseInt(user_id);
      const holeId = parseInt(hole_id);

      if (isNaN(userId) || isNaN(holeId)) {
        context.response.status = 400;
        context.response.body = { error: "Invalid user ID or hole ID" };
        return;
      }

      const sips = models.getUserScoreForHole(db, userId, holeId);

      if (sips !== null) {
        context.response.body = { user_id: userId, hole_id: holeId, sips };
      } else {
        context.response.status = 404;
        context.response.body = { error: "Score not found" };
      }
    }
  );

  // Update the score of a user for a hole
  router.put(
    "/users/:user_id/holes/:hole_id/score",
    async (context: RouterContext<"/users/:user_id/holes/:hole_id/score">) => {
      const { user_id, hole_id } = context.params;
      const userId = parseInt(user_id);
      const holeId = parseInt(hole_id);
      const body = await context.request.body({ type: "json" }).value;
      const { sips } = body;

      if (isNaN(userId) || isNaN(holeId) || typeof sips !== "number") {
        context.response.status = 400;
        context.response.body = { error: "Invalid input data" };
        return;
      }

      // Assume that users and holes exist since they are managed manually
      models.updateUserScoreForHole(db, userId, holeId, sips);
      context.response.status = 200;
      context.response.body = { message: "Score updated successfully" };
    }
  );

  // Get all scores for a hole
  router.get(
    "/holes/:hole_id/scores", 
    (context: RouterContext<"/holes/:hole_id/scores">) => {
    const { hole_id } = context.params;
    const holeId = parseInt(hole_id);

    if (isNaN(holeId)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid hole ID" };
      return;
    }

    // Check if the hole exists
    const hole: Hole | null = models.getHole(db, holeId);

    if (!hole) {
      context.response.status = 404;
      context.response.body = { error: "Hole not found" };
      return;
    }

    // Get scores for the hole
    const scores: Score[] = models.getScoresByHole(db, holeId);

    context.response.body = scores;
  });

  // Get all scores
  router.get("/scores", (context: RouterContext<"/scores">) => {
    try {
      const scores: Score[] = models.getAllScores(db);
      context.response.body = scores;
    } catch (error) {
      console.error("Error fetching all scores:", error);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  });

  /**
   * POST /reset
   * Resets all scores and sets the par of each hole to 0.
   * **Security Note:** This endpoint should be protected to prevent unauthorized access.
   */
  router.get("/reset", (context: RouterContext<"/reset">) => {
    try {
      // Begin Transaction to ensure atomicity
      db.query("BEGIN TRANSACTION");

      // Clear all scores
      models.clearAllScores(db);

      // Reset par for all holes to 0
      models.resetParForAllHoles(db);

      // Commit Transaction
      db.query("COMMIT");

      // Respond with success message
      context.response.status = 200;
      context.response.body = { message: "Scores cleared and pars reset to 0 successfully." };
    } catch (error) {
      console.error("Error during reset:", error);
      // Rollback Transaction in case of error
      db.query("ROLLBACK");
      context.response.status = 500;
      context.response.body = { error: "An error occurred while resetting scores and pars." };
    }
  });

  return router;
}