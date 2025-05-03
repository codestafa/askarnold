import { db } from '../db/db'; // your initialized Knex instance

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: Date;
  user: {
    name: string;
    picture?: string;
  };
}

/**
 * Fetch all comments for a given post, ordered oldest → newest.
 */
export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  const rows = await db('comments')
    .join('users', 'comments.user_id', 'users.id')
    .where('comments.post_id', postId)
    .orderBy('comments.created_at', 'asc')
    .select(
      'comments.id',
      'comments.user_id',
      'comments.post_id',
      'comments.content',
      'comments.created_at',
      'users.name as user_name',
      'users.picture as user_picture'
    );

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    post_id: row.post_id,
    content: row.content,
    created_at: row.created_at,
    user: {
      name: row.user_name,
      picture: row.user_picture,
    },
  }));
}

/**
 * Insert a new comment and return it.
 * (Just the raw comment — user info is fetched separately in the controller.)
 */
export async function createComment(
  userId: number,
  postId: number,
  content: string
): Promise<Omit<Comment, 'user'>> {
  const [comment] = await db('comments')
    .insert({ user_id: userId, post_id: postId, content })
    .returning(['id', 'user_id', 'post_id', 'content', 'created_at']);

  return comment;
}

/**
 * Delete a comment by its ID, only if it belongs to that user.
 */
export async function deleteComment(
  commentId: number,
  userId: number
): Promise<number> {
  return db('comments')
    .where({ id: commentId, user_id: userId })
    .del();
}
