import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL_NAME = "gpt-3.5-turbo";

export const SYSTEM_PROMPT =
  "You are a helpful fitness assistant. When the user asks for a workout plan, return only the structured workout plan without introductions or conclusions. For other questions, respond appropriately and conversationally.";

