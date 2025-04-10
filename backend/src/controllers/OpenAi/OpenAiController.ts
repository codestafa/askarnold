// src/controllers/OpenAi/OpenAiController.ts
import { Request, Response } from "express";
// Import our custom message type and helper functions from our model file
import {
  ChatCompletionRequestMessage,
  getChatResponse,
  getChatHistory,
  addMessage,
  getLastAssistantMessage,
  saveWorkoutPlan
} from "../../models/openAiModel";
import { SYSTEM_PROMPT } from "./config";

// Handler for the /ask endpoint
export async function askOpenAi(req: Request, res: Response): Promise<void> {
  try {
    // Extract userId and message from request body
    const userId: number = req.body.userId;
    const userMessage: string = req.body.msg;
    if (!userId || !userMessage) {
      res.status(400).json({ error: "Missing userId or msg in request body" });
      return;
    }

    // Handle "save this" command to save the last workout plan
    if (userMessage.trim().toLowerCase() === "save this") {
      const lastAssistantMsg = await getLastAssistantMessage(userId);
      if (lastAssistantMsg) {
        await saveWorkoutPlan(userId, lastAssistantMsg.content);
        const confirmation = "✅ Your workout plan has been saved.";
        // Optionally, save the confirmation message to the conversation history
        await addMessage(userId, "assistant", confirmation);
        res.json({ answer: confirmation });
      } else {
        res.json({ answer: "⚠️ No workout plan found to save." });
      }
      return;
    }

    // For a normal message, retrieve conversation history and build the message list
    const historyMessages: ChatCompletionRequestMessage[] = await getChatHistory(userId);
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: SYSTEM_PROMPT,
    };

    // Build the messages array with the system prompt, history, and latest user message
    const messagesForAI: ChatCompletionRequestMessage[] = [
      systemMessage,
      ...historyMessages,
      { role: "user", content: userMessage }
    ];

    // Get the assistant’s response from OpenAI
    const aiResponse = await getChatResponse(messagesForAI);

    // Save the new messages (user's message and assistant's answer) in the database
    await addMessage(userId, "user", userMessage);
    await addMessage(userId, "assistant", aiResponse);

    // Respond with the assistant's answer
    res.json({ answer: aiResponse });
  } catch (err) {
    console.error("Error in askOpenAi:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function testOpenAi(req: Request, res: Response): Promise<void> {
  try {
    // Check both the request body and query parameters for the message
    const userMessage: string = req.body.msg || req.query.msg;
    if (!userMessage) {
      res.status(400).json({ error: "Missing msg in request body or query parameters" });
      return;
    }

    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: SYSTEM_PROMPT,
    };

    const messagesForAI: ChatCompletionRequestMessage[] = [
      systemMessage,
      { role: "user", content: userMessage },
    ];

    const aiResponse = await getChatResponse(messagesForAI);
    res.json({ answer: aiResponse });
  } catch (err) {
    console.error("Error in testOpenAi:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}



