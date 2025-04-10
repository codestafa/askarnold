import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL_NAME = "gpt-3.5-turbo";

export const SYSTEM_PROMPT =
  "You are a helpful fitness assistant who answers workout-related questions and creates workout plans.";

