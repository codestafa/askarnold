// src/routes/openAiRoutes.ts
import { Router } from "express";
import { askOpenAi, getLastConversation } from "../controllers/OpenAi/OpenAiController";
import { getUserWorkouts } from "../controllers/OpenAi/workoutController";

const router = Router();

router.post("/ask", askOpenAi);
router.post("/last", getLastConversation);
router.use("/workouts", getUserWorkouts);


export default router;

