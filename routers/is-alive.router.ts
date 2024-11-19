import { Hono } from "https://deno.land/x/hono@v3.0.0/mod.ts";
import { StatusCodes } from "https://deno.land/x/http_status@v1.0.1/mod.ts";

const app = new Hono();

app.get("", c => {
	return c.json("Alive", StatusCodes.OK);
});

export default app;
