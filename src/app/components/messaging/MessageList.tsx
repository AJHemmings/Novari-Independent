"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useSocket } from "../providers/SocketProvider";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

export function MessageList({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),` +
            `and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      setMessages((data as Message[]) || []);
    };

    fetchMessages();
  }, [recipientId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleNewMessage = (message: Message) => {
      if (
        (message.sender_id === recipientId &&
          message.recipient_id === userId) ||
        (message.sender_id === userId && message.recipient_id === recipientId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, recipientId, userId]);

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 rounded-lg max-w-xs ${
            msg.sender_id === recipientId
              ? "bg-gray-100"
              : "bg-blue-500 text-white ml-auto"
          }`}
        >
          <p>{msg.content}</p>
          <p className="text-xs opacity-70">
            {new Date(msg.created_at).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
}
