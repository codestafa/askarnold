import OpenAI from "openai";
import { db } from "../db/db";
import { openai, MODEL_NAME } from "../config/openai/config";
import { ChatCompletionRequestMessage } from "../../types/openai";

if (!openai) {
  throw new Error("OpenAI instance not initialized...");
}

export async function getChatResponse(messages: ChatCompletionRequestMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
    });
    return response.choices[0].message?.content ?? "";
  } catch (err) {
    console.error("Error getting chat completion:", err);
    throw err;
  }
}

export async function saveWorkoutPlan(userId: number, planText: string): Promise<number> {
  const [inserted] = await db("workout_plans")
    .insert({
      user_id: userId,
      plan_text: planText,
      created_at: new Date(),
    })
    .returning("id");

  return inserted.id ?? inserted;
}

// Optional: keep if you still want to log messages in a separate flat table
export async function addMessage(
  userId: number,
  role: string,
  content: string,
  options?: { isWorkoutPlan?: boolean; conversationId?: number; replyToMessageId?: number }
): Promise<void> {
  await db("messages").insert({
    user_id: userId,
    role,
    content,
    is_workout_plan: options?.isWorkoutPlan ?? false,
    conversation_id: options?.conversationId ?? null,
    reply_to_message_id: options?.replyToMessageId ?? null,
    created_at: new Date(),
  });
}

export async function getLastAssistantMessage(userId: number): Promise<{ content: string } | undefined> {
  const lastMsg = await db("messages")
    .where({ user_id: userId, role: "assistant" })
    .orderBy("created_at", "desc")
    .first();
  return lastMsg;
}
