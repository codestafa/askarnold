import { Request, Response } from 'express';
import { findUserWithMainWorkoutById } from '../../models/userModel';

export async function getUserById(req: Request, res: Response): Promise<void> {
  const userId = Number(req.params.userId);
  if (Number.isNaN(userId)) res.status(400).json({ error: 'Invalid user ID' }); // ✅

  try {
    const user = await findUserWithMainWorkoutById(userId);
    if (!user) res.status(400).json({ error: 'Invalid user ID' }); // ✅

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      created_at: user.created_at,
      main_workout: user.workout_id
        ? {
            id: user.workout_id,
            name: user.workout_name,
            plan_text: user.plan_text,
            created_at: user.workout_created_at,
          }
        : null,
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
