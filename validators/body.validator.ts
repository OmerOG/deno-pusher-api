import { validator } from "https://deno.land/x/hono@v3.0.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { StatusCodes } from "https://deno.land/x/http_status@v1.0.1/mod.ts";

const bodySchema = z.object({
	channel: z.string(),
	event: z.string().default("message"),
	message: z.string(),
});

export default validator("json", (value, c) => {
	const parsedBody = bodySchema.safeParse(value);

	if (!parsedBody.success) {
		return c.json(
			{
				success: false,
				message: "Body does not meet schema requirements",
				details: parsedBody.error.flatten(),
			},
			StatusCodes.BAD_REQUEST
		);
	}

	return parsedBody.data;
});
