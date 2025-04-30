import { db } from "../db/db";
import { Workout } from "../../types/workout";

/**
 * Fetch workouts for a user — main workout first if exists.
 */
export async function getWorkoutsByUser(
  userId: number,
  offset: number = 0,
  limit: number
): Promise<Workout[]> {
  return db("workout_plans")
    .select(
      "workout_plans.id",
      "plan_text as planText",
      "workout_plans.created_at as createdAt",
      "workout_name as workoutName",
      "users.name as username"
    )
    .innerJoin("users", "workout_plans.user_id", "users.id")
    .where("workout_plans.user_id", userId)
    .andWhere("is_deleted", false)
    .orderByRaw(
      `CASE WHEN workout_plans.id = (SELECT main_workout_id FROM users WHERE id = ?) THEN 0 ELSE 1 END`,
      [userId]
    )
    .orderBy("workout_plans.created_at", "desc")
    .offset(offset)
    .limit(limit);
}

/**
 * Soft delete a workout (set is_deleted = true).
 */
export async function softDeleteWorkoutById(workoutId: number): Promise<boolean> {
  const result = await db("workout_plans")
    .where({ id: workoutId })
    .update({ is_deleted: true });
  return result > 0;
}

/**
 * Adopt a workout: copy it and increment original users_adopted.
 */
export async function adoptWorkoutPlan(
  adopterUserId: number,
  originalWorkoutId: number
): Promise<number> {
  const exists = await db("workout_plans")
    .where({ id: originalWorkoutId, is_deleted: false })
    .first();

  if (!exists) throw new Error("Workout plan not found.");

  const alreadyAdopted = await db("adopted_plans")
    .where({ user_id: adopterUserId, workout_plan_id: originalWorkoutId })
    .first();

  if (alreadyAdopted) return originalWorkoutId;

  await db("adopted_plans").insert({
    user_id: adopterUserId,
    workout_plan_id: originalWorkoutId,
    adopted_at: db.fn.now(),
  });

  await db("workout_plans")
    .where({ id: originalWorkoutId })
    .increment("users_adopted", 1);

  return originalWorkoutId;
}


/**
 * Get user info by ID.
 */
export async function getUserById(userId: number) {
  return db("users").where({ id: userId }).first();
}

/**
 * Update user's main workout.
 */
export async function updateUserMainWorkout(userId: number, workoutId: number | null): Promise<void> {
  await db("users")
    .where({ id: userId })
    .update({ main_workout_id: workoutId });
}

/**
 * Check if the workout belongs to the given user.
 */
export async function checkWorkoutOwnership(userId: number, workoutId: number): Promise<boolean> {
  // Check if user created it
  const owned = await db("workout_plans")
    .where({ id: workoutId, user_id: userId, is_deleted: false })
    .first();

  if (owned) return true;

  // Check if user adopted it
  const adopted = await db("adopted_plans")
    .where({ workout_plan_id: workoutId, user_id: userId })
    .first();

  return !!adopted;
}


/**
 * Fetch workouts for a user — main workout first if exists.
 */
export async function getWorkoutsForUser(
  userId: number,
  offset = 0,
  limit = 10
): Promise<Workout[]> {
  const own = db("workout_plans as wp")
    .select(
      "wp.id",
      "wp.plan_text as planText",
      "wp.created_at as created_at",
      "wp.workout_name as workoutName",
      "u.name as username",
      db.raw("false as adopted")
    )
    .innerJoin("users as u", "wp.user_id", "u.id")
    .where("wp.user_id", userId)
    .andWhere("wp.is_deleted", false);

  const adopted = db("adopted_plans as ap")
    .select(
      "wp.id",
      "wp.plan_text as planText",
      "ap.adopted_at as created_at",
      "wp.workout_name as workoutName",
      "u2.name as username",
      db.raw("true as adopted")
    )
    .innerJoin("workout_plans as wp", "ap.workout_plan_id", "wp.id")
    .innerJoin("users as u2", "wp.user_id", "u2.id")
    .where("ap.user_id", userId)
    .andWhere("wp.is_deleted", false);

  const workouts = db
    .with("all_workouts", db.raw(`(${own.unionAll(adopted).toQuery()})`))
    .select("*")
    .from("all_workouts")
    .orderByRaw(
      `CASE WHEN id = (SELECT main_workout_id FROM users WHERE id = ?) THEN 0 ELSE 1 END`,
      [userId]
    )
    .orderBy("created_at", "desc")
    .offset(offset)
    .limit(limit);

  return await workouts as Workout[];
}

/**
 * Remove an adopted_plans row and decrement the original's users_adopted.
 */
export async function unadoptWorkoutPlan(
  userId: number,
  workoutId: number
): Promise<boolean> {
  const deleted = await db("adopted_plans")
    .where({ user_id: userId, workout_plan_id: workoutId })
    .del();

  if (deleted > 0) {
    await db("workout_plans")
      .where({ id: workoutId })
      .decrement("users_adopted", 1);
    return true;
  }
  return false;
}

/**
 * Check whether the given user has adopted this plan.
 */
export async function isAdoptedByUser(
  userId: number,
  workoutId: number
): Promise<boolean> {
  const row = await db("adopted_plans")
    .where({ user_id: userId, workout_plan_id: workoutId })
    .first();
  return !!row;
}



