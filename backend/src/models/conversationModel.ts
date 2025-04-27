import { db } from "../db/db";

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

/**
 * Start a new conversation (JSONB messages, ended_at = NULL).
 */
export async function startConversation(
  userId: number,
  initialMessages: Message[] = []
): Promise<number> {
  const msgsWithTimestamps = initialMessages.map((m) => ({
    ...m,
    timestamp: new Date().toISOString(),
  }));
  const [row] = await db("conversations")
    .insert({
      user_id: userId,
      messages: JSON.stringify(msgsWithTimestamps),
      ended_at: null,
    })
    .returning("id");
  return row.id ?? row;
}

/**
 * Fetch JSONB messages & ended_at for a conversation.
 */
export async function getConversationById(
  conversationId: number
): Promise<{ id: number; messages: Message[]; ended_at: Date | null }> {
  const convo = await db("conversations")
    .select("id", "messages", "ended_at")
    .where({ id: conversationId })
    .first();
  if (!convo) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  let parsed: Message[] = [];
  try {
    parsed =
      typeof convo.messages === "string"
        ? JSON.parse(convo.messages)
        : convo.messages;
  } catch (err) {
    console.error("Failed to parse JSONB messages:", err);
  }

  return {
    id: convo.id,
    messages: parsed,
    ended_at: convo.ended_at,
  };
}

/**
 * Append new messages to the JSONB array.
 */
export async function appendToConversation(
  convoId: number,
  newMessages: Omit<Message, "timestamp">[]
): Promise<void> {
  const existing = await getConversationById(convoId);
  const updated = [
    ...existing.messages,
    ...newMessages.map((m) => ({
      ...m,
      timestamp: new Date().toISOString(),
    })),
  ];
  await db("conversations")
    .where({ id: convoId })
    .update({ messages: JSON.stringify(updated) });
}

/**
 * Find last assistant message within an array.
 */
export function getLastAssistantMessageInConversation(
  messages: Message[]
): Message | undefined {
  return [...messages].reverse().find((m) => m.role === "assistant");
}

/**
 * Link workout_plan_id to an existing conversation.
 */
export async function linkWorkoutPlanToConversation(
  convoId: number,
  workoutPlanId: number
): Promise<void> {
  await db("conversations")
    .where({ id: convoId })
    .update({ workout_plan_id: workoutPlanId });
}

/**
 * Get the most recent conversation ID for a user that hasn't been ended.
 */
export async function getMostRecentConversationId(
  userId: number
): Promise<number | null> {
  const convo = await db("conversations")
    .where({ user_id: userId })
    .whereNull("ended_at")
    .orderBy("created_at", "desc")
    .first();
  return convo ? convo.id : null;
}

/**
 * Mark a conversation ended (sets ended_at).
 */
export async function endConversation(convoId: number): Promise<void> {
  await db("conversations")
    .where({ id: convoId })
    .update({ ended_at: new Date() });
}
