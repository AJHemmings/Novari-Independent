import { Server } from "socket.io";
import { Redis } from "@upstash/redis";
import { createAdapter } from "@socket.io/redis-adapter";

type SocketServer = Server;

export async function getSocketServer(): Promise<SocketServer> {
  if (!global._redis) {
    global._redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  if (!global.io) {
    const pubClient = global._redis;
    const subClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);
    });

    global.io = io;
  }

  return global.io!;
}
