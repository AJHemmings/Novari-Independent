import { NextResponse } from "next/server";
import { getSocketServer } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getSocketServer();
    return NextResponse.json({ status: "Socket.IO server ready" });
  } catch (error) {
    console.error("Socket init failed:", error);
    return NextResponse.json({ error: "Failed to initialze socket server" });
  }
}
