// src/routes/openAiRoutes.ts
import { Router } from "express";
import { askOpenAi, testOpenAi } from "../controllers/OpenAi/OpenAiController";

const router = Router();

router.post("/ask", askOpenAi);
router.post("/test", testOpenAi);

export default router;
