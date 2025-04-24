import { Request, Response } from "express";
import { getWorkoutsByUser } from "../../models/workoutModel";

export async function getUserWorkouts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userId, offset = 0, limit } = req.body;
    if (typeof userId !== "number" || typeof limit !== "number") {
      res.status(400).json({ error: "Missing or invalid userId or limit" });
      return;
    }

    const offs = Number(offset);
    const lim = Number(limit);

    console.log("Fetching workouts → offset:", offs, "limit:", lim); // Debugging

    const workouts = await getWorkoutsByUser(userId, offs, lim);
    res.json({ workouts });
  } catch (err) {
    console.error("Error fetching workouts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
