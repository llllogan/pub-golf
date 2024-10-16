// deps.ts
// Oak framework for building HTTP servers
export {
  Application,
  Router,
  Context
} from "https://deno.land/x/oak@v12.5.0/mod.ts";
  export type { RouterContext } from "https://deno.land/x/oak@v12.5.0/mod.ts";
  
  // SQLite module for database operations
  export { DB } from "https://deno.land/x/sqlite/mod.ts";