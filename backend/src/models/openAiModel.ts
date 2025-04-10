// src/models/openAiModel.ts
import OpenAI from "openai";
import knex from "../db/db";
import { openai, MODEL_NAME } from '../config/openai/config';
import { ChatCompletionRequestMessage } from '../../types/openai'

if (!openai) {
  throw new Error("Open AI instance not initialized...");
}


export async function getChatResponse(messages: ChatCompletionRequestMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
    });
    // Access the assistant response from the returned object.
    return response.choices[0].message?.content ?? "";
  } catch (err) {
    console.error("Error getting chat completion:", err);
    throw err;
  }
}

// Retrieve the conversation history for a user.
export async function getChatHistory(userId: number): Promise<ChatCompletionRequestMessage[]> {
  const messageHistory = await knex("messages")
    .where({ user_id: userId })
    .orderBy("created_at", "asc")
    .select("role", "content");

  return messageHistory.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));
}

// Add a new message (user or assistant) to the conversation.
export async function addMessage(userId: number, role: string, content: string): Promise<void> {
  await knex("messages").insert({
    user_id: userId,
    role,
    content,
    created_at: new Date(),
  });
}

// Retrieve the last assistant message (to use when saving a workout plan).
export async function getLastAssistantMessage(userId: number): Promise<{ content: string } | undefined> {
  const lastMsg = await knex("messages")
    .where({ user_id: userId, role: "assistant" })
    .orderBy("created_at", "desc")
    .first();
  return lastMsg;
}

// Save a workout plan to the workout_plans table.
export async function saveWorkoutPlan(userId: number, planText: string): Promise<void> {
  await knex("workout_plans").insert({
    user_id: userId,
    plan_text: planText,
    created_at: new Date(),
  });
}
