// src/routes/workoutRoutes.ts

import { Router } from "express";
import { getUserWorkouts } from "../controllers/OpenAi/workoutController";

const router = Router();

// POST /api/workouts/user
router.post("/user", getUserWorkouts);

export default router;
