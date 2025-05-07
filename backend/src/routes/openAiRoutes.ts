// src/routes/openAiRoutes.ts
import { Router } from "express";
import {
  askOpenAi,
  getLastConversation,
  saveWorkoutPlanHandler,
  endConversationHandler,
} from "../controllers/OpenAi/OpenAiController";
import {
  getUserWorkouts,
  deleteWorkout,
  adoptWorkout,
  setMainWorkout,
} from "../controllers/OpenAi/workoutController";
import { getUserById } from "../controllers/OpenAi/userController";

const router = Router();

router.post("/ask", askOpenAi);
router.post("/last", getLastConversation);
router.post("/save-workout-plan", saveWorkoutPlanHandler);
router.post("/end-conversation", endConversationHandler);

router.post("/workouts/user", getUserWorkouts);
router.delete("/workouts/:id", deleteWorkout);
router.post("/workouts/adopt", adoptWorkout);
router.post("/workouts/set-main", setMainWorkout);

router.get("/user/:userId", getUserById); // 👈 added user profile route
export default router;
