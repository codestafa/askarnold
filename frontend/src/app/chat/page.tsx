"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatCompletionRequestMessage } from "../../types/openai";
import { cn } from "../../lib/utils";
import Sidebar from "../../stories/Sidebar";
import { useRouter } from "next/navigation";
import { User } from "../../types/users";

const sections = [
  { name: 'About', icon: 'M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z' },
  { name: 'chat', icon: 'M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z' },
  { name: 'workouts', icon: 'M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z' },
  { name: 'community', icon: 'M16 14a4 4 0 10-8 0v2h8v-2zm-4-6a2 2 0 110-4 2 2 0 010 4z' }
];

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<string>("other");
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load user
  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((u: User) => setUser(u))
      .catch(() => router.push("/login"))
      .finally(() => setLoadingUser(false));
  }, [router]);

  // Fetch last conversation
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch("/api/last", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error();
        const data: { conversationId: number | null; messages: ChatCompletionRequestMessage[] } = await res.json();
        setConversationId(data.conversationId);
        setMessages(data.messages || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const userMsg = { role: "user", content: input } as ChatCompletionRequestMessage;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setSystemMessage(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ msg: input, conversationId: conversationId ?? undefined }),
      });
      const data: { answer: string; intent: string; conversationId?: number } = await res.json();
      if (data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
        setIntent(data.intent || "other");
      }
      if (data.conversationId !== undefined) setConversationId(data.conversationId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // End conversation
  const endConversation = async () => {
    if (!conversationId) return;
    try {
      await fetch("/api/end-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId }),
      });
      setConversationId(null);
      setMessages([]);
      setIntent("other");
      setSystemMessage("✅ Conversation ended.");
    } catch (e) {
      console.error(e);
    }
  };

  // Save workout plan
  const saveWorkoutPlan = async () => {
    if (intent !== "request_workout_plan" || !conversationId) return;
    try {
      const res = await fetch("/api/save-workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      setSystemMessage(data.success
        ? "✅ Workout plan saved successfully!"
        : "⚠️ Failed to save workout plan.");
    } catch (e) {
      console.error(e);
      setSystemMessage("⚠️ Failed to save workout plan.");
    }
  };

  if (loadingUser) return null;
  if (!user) return <div className="p-4 text-center">Loading user...</div>;

  return (
    <div className="h-screen bg-white text-gray-800 lg:flex">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />

      <main className="flex flex-col flex-1">
        {/* Messages container: scrolls */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">No conversations yet</h2>
                <p>Ask me about a workout plan or fitness tips to get started!</p>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[75%] whitespace-pre-wrap mb-4",
                  m.role === "user"
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-200 text-gray-900 self-start mr-auto"
                )}
              >
                {m.content}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          {systemMessage && (
            <div className="text-center text-sm text-gray-600 mt-4">{systemMessage}</div>
          )}
        </div>

        {/* Input & actions: fixed */}
        <div className="border-t border-gray-300 bg-white px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
              disabled={!conversationId}
              className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              End Conversation
            </button>
            <button
              onClick={saveWorkoutPlan}
              disabled={intent !== "request_workout_plan" || !conversationId}
              className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Save Workout Plan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
