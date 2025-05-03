import { Request, Response } from 'express';
import {
  getCommentsByPostId,
  createComment,
  deleteComment
} from '../../models/commentsModel';
import { db } from '../../db/db'; // Knex instance

/**
 * GET /api/posts/:postId/comments
 */
export async function fetchComments(req: Request, res: Response): Promise<void> {
  const postId = Number(req.params.postId);
  if (Number.isNaN(postId)) {
    res.status(400).json({ error: 'Missing or invalid postId' });
    return;
  }

  try {
    const comments = await getCommentsByPostId(postId);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

/**
 * POST /api/posts/:postId/comments
 */
export async function postComment(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId;
  const postId = Number(req.params.postId);
  const { content } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (Number.isNaN(postId) || !content) {
    res.status(400).json({ error: 'Missing or invalid fields' });
    return;
  }

  try {
    // Create the comment
    const newComment = await createComment(userId, postId, content);

    // Fetch user info to attach to the response
    const [user] = await db('users')
      .where('id', userId)
      .select('name', 'picture');

    if (!user) {
      res.status(500).json({ error: 'User not found after comment creation' });
      return;
    }

    // Return comment with user object
    res.status(201).json({
      ...newComment,
      user: {
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

/**
 * DELETE /api/comments/:commentId
 */
export async function removeComment(req: Request, res: Response): Promise<void> {
  const userId = req.session.userId;
  const commentId = Number(req.params.commentId);

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (Number.isNaN(commentId)) {
    res.status(400).json({ error: 'Invalid commentId' });
    return;
  }

  try {
    await deleteComment(commentId, userId);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}
