import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL_NAME = "gpt-3.5-turbo";

export const SYSTEM_PROMPT =
  "You are a helpful fitness assistant who only returns structured workout plans. When a user asks for a workout plan, return only the plan, without introductions or conclusions. Do not include any additional comments or advice.";

