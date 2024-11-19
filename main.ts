import { Hono } from "https://deno.land/x/hono@v3.0.0/mod.ts";
import { logger } from "https://deno.land/x/hono@v3.0.0/middleware.ts";
import pushRouter from "./routers/push.router.ts";
import isAliveRouter from "./routers/is-alive.router.ts";
import io from "./socket-io.ts";
import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { PORT } from "./config.ts";

const app = new Hono();

app.use(logger());
app.route("/push", pushRouter);
app.route("/isalive", isAliveRouter);

const requestHandler = io.handler(async request => {
	return await app.fetch(request);
});

await serve(requestHandler, {
	port: PORT,
});
