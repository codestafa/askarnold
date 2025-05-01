import { openai } from "../config/openai/config";

export async function detectIntent(message: string): Promise<string> {
  const prompt = `
Classify the following assistant message into one of these intents:
- request_workout_plan
- general_fitness_question
- other

Assistant Message: "${message}"
Intent:
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 10,
    temperature: 0,
  });

  const messageContent = response.choices?.[0]?.message?.content?.trim();
  console.log("Intent Detection Response:", messageContent);
  return messageContent || "other";
}
