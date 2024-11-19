import { Hono } from "https://deno.land/x/hono@v3.0.0/mod.ts";
import { StatusCodes } from "https://deno.land/x/http_status@v1.0.1/mod.ts";
import bodyValidator from "../validators/body.validator.ts";
import io from "../socket-io.ts";
import { SOCKET_EMIT_TIMEOUT_MS } from "../config.ts";

const app = new Hono();

app.post("", bodyValidator, async c => {
	const { channel, event, message } = c.req.valid("json");

	const promise = new Promise(resolve => {
		io.timeout(SOCKET_EMIT_TIMEOUT_MS)
			.to(channel)
			.emit(event, message, (err: any) => {
				if (err) {
					resolve(
						c.json(
							{
								success: false,
								message: "Failed streaming message",
								details: err,
							},
							StatusCodes.INTERNAL_SERVER_ERROR
						)
					);
				}

				resolve(
					c.json(
						{
							success: true,
						},
						StatusCodes.OK
					)
				);
			});
	});

	return await promise;
});

export default app;
