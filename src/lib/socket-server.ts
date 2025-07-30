import { Server } from "socket.io";
import { Redis } from "@upstash/redis";
import { createAdapter } from "@socket.io/redis-adapter";
import supabaseServer from "@/lib/supabaseServer";

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

    io.on("connection", async (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      const { data: messages, error } = await supabaseServer
        .from("messages")
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
      } else {
        console.log("Messages:", messages);
      }
    });

    global.io = io;
  }

  return global.io!;
}
