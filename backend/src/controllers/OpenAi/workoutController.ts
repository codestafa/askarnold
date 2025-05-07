import { Request, Response } from "express";
import {
  softDeleteWorkoutById,
  adoptWorkoutPlan,
  checkWorkoutOwnership,
  getUserById,
  updateUserMainWorkout,
  isAdoptedByUser,
  unadoptWorkoutPlan,
  getWorkoutsForUser,
  isWorkoutAdopted
} from "../../models/workoutModel";

/**
 * Fetch workouts for the logged-in user
 */
export async function getUserWorkouts(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId as number;
    const { offset = 0, limit } = req.body;

    if (!userId || typeof limit !== "number") {
      res.status(400).json({ error: "Missing or invalid parameters" });
      return;
    }

    // Fetch both created + adopted plans
    const workouts = await getWorkoutsForUser(userId, offset, limit);

    // Also fetch main_workout_id
    const user = await getUserById(userId);
    const mainWorkoutId = user?.main_workout_id || null;

    res.json({ workouts, mainWorkoutId });
  } catch (err) {
    console.error("Error fetching workouts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/workouts/:id
 * If it's an adopted plan, remove from adopted_plans.
 * Otherwise soft-delete the original workout_plans row.
 */
export async function deleteWorkout(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.session.userId as number;
    const workoutId = parseInt(req.params.id, 10);

    if (!userId || isNaN(workoutId)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    // make sure user either created or adopted it
    const ownsOrAdopted = await checkWorkoutOwnership(userId, workoutId);
    if (!ownsOrAdopted) {
      res.status(403).json({ error: "You don't have permission to delete this" });
      return;
    }

    // if user has adopted it, remove the adopted_plans record
    if (await isAdoptedByUser(userId, workoutId)) {
      const ok = await unadoptWorkoutPlan(userId, workoutId);
      if (ok) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Adopted plan not found" });
      }
      return;
    }

    // otherwise it's an original: soft-delete in workout_plans
    const deleted = await softDeleteWorkoutById(workoutId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Workout not found or already deleted" });
    }

  } catch (err) {
    console.error("Error deleting workout:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Set or unset a workout as the main workout
 */
export async function setMainWorkout(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;
    const { workoutId } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (typeof workoutId !== "number") {
      res.status(400).json({ error: "Invalid workout id" });
      return;
    }

    const ownsWorkout = await checkWorkoutOwnership(userId, workoutId);

    if (!ownsWorkout) {
      res.status(403).json({ error: "You don't own this workout" });
      return;
    }

    const currentUser = await getUserById(userId);

    if (currentUser.main_workout_id === workoutId) {
      await updateUserMainWorkout(userId, null);
      res.json({ success: true, message: "Main workout unset" });
    } else {
      await updateUserMainWorkout(userId, workoutId);
      res.json({ success: true, message: "Main workout set" });
    }
  } catch (err) {
    console.error("Error setting main workout:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function adoptWorkout(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;
    const { workoutId } = req.body;

    if (!userId || typeof workoutId !== "number") {
      res.status(400).json({ error: "Missing or invalid workoutId or not authenticated" });
      return;
    }

    // 💥 Prevent adoption of already-adopted workouts
    const adopted = await isWorkoutAdopted(workoutId);
    if (adopted) {
      res.status(400).json({ error: "Cannot adopt a workout that is already adopted" });
      return;
    }

    const newWorkoutId = await adoptWorkoutPlan(userId, workoutId);
    res.status(201).json({ newWorkoutId });
  } catch (err) {
    console.error("Error adopting workout:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
