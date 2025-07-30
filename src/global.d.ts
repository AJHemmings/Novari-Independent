import Server from "socket.io";
import { Redis } from "@upstash/redis";

declare global {
  var io: Server | undefined;
  var _redis: Redis | undefined;
}

export {};
