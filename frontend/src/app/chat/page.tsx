"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatCompletionRequestMessage } from "../../types/openai";
import { cn } from "../../lib/utils";
import Sidebar from "../../stories/Sidebar";

import { useRouter } from "next/navigation";
import { User } from "../../types/users";

const sections = [
  {
    name: "chat",
    icon:
      "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z",
  },
  {
    name: "workouts",
    icon:
      "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z",
  },
  {
    name: "community",
    icon:
      "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z",
  },
];

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1) Fetch logged-in user
  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then(setUser)
      .catch(() => router.push("/login"))
      .finally(() => setLoadingUser(false));
  }, [router]);

  // 2) Once user is loaded, fetch their last active conversation
// 2) Once user is loaded, fetch their last active conversation
useEffect(() => {
  if (!user) return;               // ← guard out null user
  const userId = user.id;          // ← now userId is guaranteed to be a number

  async function fetchLastConversation() {
    try {
      // debug logging
      console.log("fetching last convo for userId=", userId);

      const res = await fetch("/api/last", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),   // ← body will now be { "userId": 123 }
      });

      console.log({res})

      if (!res.ok) {
        console.error("status", res.status);
        throw new Error("Failed to fetch conversation");
      }

      const data = await res.json();
      console.log("last convo data:", data);

      if (data.conversationId !== null && Array.isArray(data.messages)) {
        setConversationId(data.conversationId);
        setMessages(data.messages);
      } else {
        setConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to load last conversation:", err);
    }
  }

  fetchLastConversation();
}, [user]);

  // 3) Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // send “system” messages (end convo / save plan)
  const sendSystemMessage = async (msg: string) => {
    if (!conversationId) return;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user!.id, msg, conversationId }),
      });
      const data = await res.json();
      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      }
      if (data.conversationId !== undefined) {
        setConversationId(data.conversationId);
      }
    } catch (err) {
      console.error("System message error:", err);
    }
  };

  // handle regular user → AI messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user!.id, msg: input, conversationId }),
      });
      const data = await res.json();

      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      }
      if (data.conversationId !== undefined) {
        setConversationId(data.conversationId);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const endConversation = () => {
    sendSystemMessage("end conversation");
    setConversationId(null);
    setMessages([]);
  };

  const saveWorkoutPlan = () => {
    const mentionedWorkout = messages.some((m) =>
      m.content.toLowerCase().includes("workout plan")
    );
    if (mentionedWorkout) {
      sendSystemMessage("save this");
    } else {
      console.log("No workout plan discussed.");
    }
  };

  if (loadingUser) return null;

  return (
    <div className="flex h-screen">
      <Sidebar sections={sections} user={{ name: user!.name, image: user!.picture }} />

      <main className="flex flex-col flex-1 max-w-4xl mx-auto py-10 px-4">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg px-4 py-2 max-w-[75%] whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 text-gray-900 self-start mr-auto"
              )}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Send a message..."
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>

        <div className="mt-4 flex gap-2">
          <button
            onClick={endConversation}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            End Conversation
          </button>
          <button
            onClick={saveWorkoutPlan}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Save Workout Plan
          </button>
        </div>
      </main>
    </div>
  );
}
