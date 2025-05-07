import { db } from "../db/db";

export async function findUserWithMainWorkoutById(userId: number) {
  const user = await db('users as u')
    .select(
      'u.id',
      'u.name',
      'u.email',
      'u.picture',
      'u.created_at',
      'w.id as workout_id',
      'w.workout_name',
      'w.plan_text',
      'w.created_at as workout_created_at'
    )
    .leftJoin('workout_plans as w', 'u.main_workout_id', 'w.id')
    .where('u.id', userId)
    .first();

  return user;
}
