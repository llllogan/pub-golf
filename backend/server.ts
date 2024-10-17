// server.ts

import { Application } from "./deps.ts";
import { initDB } from "./database.ts";
import { initRoutes } from "./routes.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

/**
 * Main server file that initializes the application.
 */

// Initialize the database
const db = initDB();

// Initialize the router with the database instance
const router = initRoutes(db);

// Create a new Oak application
const app = new Application();

app.use(oakCors({
    origin: "*",
})
);

// Register the routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
const PORT = 1080;
console.log(`Server is running on http://localhost:${PORT}`);
await app.listen({ port: PORT });