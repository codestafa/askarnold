import { db } from "../db/db";
import { Workout } from "../../types/workout";

/**
 * Fetch a page of workouts for a user, ordered newest first.
 */
export async function getWorkoutsByUser(
  userId: number,
  offset: number = 0,
  limit: number
): Promise<Workout[]> {
  return db("workout_plans")
    .select("id", "plan_text as planText", "created_at as createdAt")
    .where({ user_id: userId })
    .orderBy("created_at", "desc")
    .offset(offset)
    .limit(limit);
}
