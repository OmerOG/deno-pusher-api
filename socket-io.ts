import { createRedisAdapter, createRedisClient, Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import { REDIS_CONNECTION_STRING, USE_REDIS } from "./config.ts";

type ClientDetails = Auth & { ip: string };
type Auth = { token: string; user: { id: string; name: string } };

const io = await createSocketIOServer(USE_REDIS, REDIS_CONNECTION_STRING);

io.on("connection", socket => {
	const clientDetails = extractClientDetails(socket.handshake);
	console.log(`Socket connected`, clientDetails, socket.id);

	socket.on("join", (rooms: string[], callback) => {
		socket.join(rooms);
		console.log(`Socket joined rooms`, rooms, clientDetails, socket.id);
		callback(true);
	});

	socket.on("leave", (rooms: string[], callback) => {
		rooms.forEach(room => socket.leave(room)); // socket.leave() does not allow array parameter
		console.log(`Socket left rooms`, rooms, clientDetails, socket.id);
		callback(true);
	});

	socket.on("disconnecting", () => {
		if (socket.rooms.size === 0) {
			return;
		}

		const roomsLeft = Array.from(socket.rooms);
		console.log(`Socket left rooms`, roomsLeft, clientDetails, socket.id);
	});

	socket.on("disconnect", reason => {
		console.log(`Socket disconnected due to ${reason}`, clientDetails, socket.id);
	});
});

async function createSocketIOServer(useRedis: boolean, redisConnectionString: string) {
	if (!useRedis) return new Server();

	const redisPubClient = await createRedisClient({
		hostname: redisConnectionString,
	});
	const redisSubClient = await createRedisClient({
		hostname: redisConnectionString,
	});

	return new Server({
		adapter: createRedisAdapter(redisPubClient, redisSubClient),
	});
}

function extractClientDetails(handshake: any): ClientDetails {
	const auth = handshake.auth as Auth;
	const ip = handshake.address;

	return {
		...auth,
		ip,
	};
}

export default io;
