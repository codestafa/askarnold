import { Request, Response } from "express";
import { getChatResponse, saveWorkoutPlan } from "../../models/openAiModel";
import {
  startConversation,
  appendToConversation,
  getConversationById,
  getLastAssistantMessageInConversation,
  linkWorkoutPlanToConversation,
  getMostRecentConversationId,
  endConversation,
} from "../../models/conversationModel";
import { SYSTEM_PROMPT } from "../../config/openai/config";
import { ChatCompletionRequestMessage } from "../../../types/openai";

const GOODBYE_KEYWORDS = [
  "goodbye",
  "bye",
  "see you",
  "talk to you later",
  "later",
  "cya",
];
const ENDING_KEYWORDS = ["end conversation", "let's end this conversation"];

/**
 * Fetch the user's most recent active conversation (if any).
 */
export async function getLastConversation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.body.userId;
    if (!userId) {
      res.status(400).json({ error: "Missing userId in request body" });
      return;
    }

    const conversationId = await getMostRecentConversationId(userId);
    console.log(conversationId)
    if (!conversationId) {
      res.json({ conversationId: null, messages: [] });
      return;
    }

    const conversation = await getConversationById(conversationId);
    console.log(conversation)

    // If they've explicitly ended it, treat as "no active"
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

/**
 * Main chat endpoint:
 * - handles starting/continuing conversations
 * - handles saving workout plans
 * - handles "goodbye" and "end conversation"
 * - calls OpenAI and appends messages
 */
export async function askOpenAi(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId: number = req.body.userId;
    const userMessage: string = req.body.msg;
    let conversationId: number | undefined = req.body.conversationId;

    if (!userId || !userMessage) {
      res.status(400).json({ error: "Missing userId or msg in request body" });
      return;
    }

    const normalizedMsg = userMessage.trim().toLowerCase();
    const isGoodbye = GOODBYE_KEYWORDS.some((kw) =>
      normalizedMsg.includes(kw)
    );
    const isEnding = ENDING_KEYWORDS.some((kw) =>
      normalizedMsg.includes(kw)
    );

    // 🛑 "end conversation"
    if (isEnding) {
      const recentConversationId = await getMostRecentConversationId(userId);
      if (recentConversationId) {
        const farewell =
          "✅ Conversation ended. You can start a new one anytime by sending a new message.";
        await appendToConversation(recentConversationId, [
          { role: "user", content: userMessage },
          { role: "assistant", content: farewell },
        ]);
        await endConversation(recentConversationId);
        res.json({ answer: farewell, conversationId: null });
      } else {
        res.json({
          answer: "⚠️ No active conversation to end.",
          conversationId: null,
        });
      }
      return;
    }

    // 👋 Casual goodbyes
    if (isGoodbye) {
      const recentConversationId = await getMostRecentConversationId(userId);
      if (recentConversationId) {
        const goodbye =
          "👋 Take care! Come back anytime if you need help with workouts.";
        await appendToConversation(recentConversationId, [
          { role: "user", content: userMessage },
          { role: "assistant", content: goodbye },
        ]);
        res.json({ answer: goodbye, conversationId: recentConversationId });
      }
      return;
    }

    // 🧠 Continue most recent or start new
    if (!conversationId) {
      conversationId =
        (await getMostRecentConversationId(userId)) ?? undefined;
    }
    if (!conversationId) {
      conversationId = await startConversation(userId, []);
    }

    // 💾 "save this" → save last assistant reply as workout plan
    if (normalizedMsg === "save this") {
      const convo = await getConversationById(conversationId);
      const lastAssistantMsg = getLastAssistantMessageInConversation(
        convo.messages
      );
      if (lastAssistantMsg) {
        const planId = await saveWorkoutPlan(
          userId,
          lastAssistantMsg.content
        );
        await linkWorkoutPlanToConversation(conversationId, planId);
        const confirmation = "✅ Your workout plan has been saved.";
        await appendToConversation(conversationId, [
          { role: "assistant", content: confirmation },
        ]);
        res.json({ answer: confirmation, conversationId });
      } else {
        res.json({
          answer: "⚠️ No workout plan found to save.",
          conversationId,
        });
      }
      return;
    }

    // 🧠 Normal chat: pull last few messages, call OpenAI
    const conversation = await getConversationById(conversationId);
    const MAX_CONTEXT = 8;
    const past = conversation.messages.slice(-MAX_CONTEXT);
    const forAI: ChatCompletionRequestMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...past,
      { role: "user", content: userMessage },
    ];

    const aiResponse = await getChatResponse(forAI);

    // 💬 Append both user + assistant to JSONB
    await appendToConversation(conversationId, [
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse },
    ]);

    res.json({ answer: aiResponse, conversationId });
  } catch (err) {
    console.error("Error in askOpenAi:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
