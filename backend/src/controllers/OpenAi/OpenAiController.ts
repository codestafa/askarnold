import { Request, Response } from "express";
import { getChatResponse } from "../../models/openAiModel";
import {
  startConversation,
  appendToConversation,
  getConversationById,
  getMostRecentConversationId,
  linkWorkoutPlanToConversation,
  endConversation
} from "../../models/conversationModel";
import { saveWorkoutPlan } from "../../models/openAiModel";
import { SYSTEM_PROMPT } from "../../config/openai/config";
import { ChatCompletionRequestMessage } from "../../../types/openai";
import { detectIntent } from "../../services/intentService";

export async function getLastConversation(req: Request, res: Response): Promise<void> {
  try {
    console.log(req.session);
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const conversationId = await getMostRecentConversationId(userId);
    if (!conversationId) {
      res.json({ conversationId: null, messages: [] });
      return;
    }

    const conversation = await getConversationById(conversationId);
    if (conversation.ended_at) {
      res.json({ conversationId: null, messages: [] });
      return;
    }

    res.json({ conversationId, messages: conversation.messages });
  } catch (err) {
    console.error("Error fetching last conversation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function askOpenAi(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;
    console.log(req.session);
    const { msg, conversationId: reqConvoId } = req.body;

    if (!userId || !msg) {
      res.status(400).json({ error: "Missing msg or not authenticated" });
      return;
    }

    let conversationId = reqConvoId ?? await getMostRecentConversationId(userId);
    if (!conversationId) {
      conversationId = await startConversation(userId, []);
    }

    const convo = await getConversationById(conversationId);
    const past = convo.messages.slice(-8);
    const forAI: ChatCompletionRequestMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...past,
      { role: "user", content: msg },
    ];

    const aiResponse = await getChatResponse(forAI);

    const intent = await detectIntent(aiResponse);
    console.log("Assistant Response:", aiResponse);
    console.log("Detected Intent:", intent);

    await appendToConversation(conversationId, [
      { role: "user", content: msg },
      { role: "assistant", content: aiResponse },
    ]);

    res.json({ answer: aiResponse, conversationId, intent });
  } catch (err) {
    console.error("Error in askOpenAi:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function saveWorkoutPlanHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;
    const { conversationId } = req.body;

    if (!userId || !conversationId) {
      res.status(400).json({ error: "Missing conversationId or not authenticated" });
      return;
    }

    const convo = await getConversationById(conversationId);
    const lastAssistantMsg = convo.messages.reverse().find(m => m.role === "assistant");

    if (!lastAssistantMsg) {
      res.status(400).json({ error: "No assistant message to save" });
      return;
    }

    const planId = await saveWorkoutPlan(userId, lastAssistantMsg.content);
    await linkWorkoutPlanToConversation(conversationId, planId);

    res.json({ success: true, message: "Workout plan saved successfully", planId });
  } catch (err) {
    console.error("Error saving workout plan:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function endConversationHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;
    const { conversationId } = req.body;

    if (!userId || !conversationId) {
      res.status(400).json({ error: "Missing conversationId or not authenticated" });
      return;
    }

    const convo = await getConversationById(conversationId);
    if (convo.user_id !== userId) {
      res.status(403).json({ error: "You do not own this conversation" });
      return;
    }

    await endConversation(conversationId);
    res.json({ message: "Conversation ended successfully" });
  } catch (err) {
    console.error("Error ending conversation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
