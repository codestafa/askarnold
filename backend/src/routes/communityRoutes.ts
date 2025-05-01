import express from 'express';
import { db } from '../db/db';
import { Request, Response, RequestHandler } from 'express';
import AWS from 'aws-sdk';

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

// GET /posts - fetch all posts with likedByUser
router.get('/posts', (async (req, res) => {
  try {
    const userId = Number((req.user as any)?.id);

    const posts = await db('posts')
      .leftJoin('likes', function () {
        this.on('posts.id', '=', 'likes.post_id')
            .andOn('likes.user_id', '=', db.raw('?', [userId || null]));
      })
      .select(
        'posts.*',
        db.raw('CASE WHEN likes.user_id IS NOT NULL THEN true ELSE false END AS "likedByUser"')
      )
      .orderBy('posts.created_at', 'desc');

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}) as RequestHandler);

// POST /posts - create a new post
router.post("/posts", (async (req, res) => {
  const user = req.user as { id: number } | undefined;

  if (!user || typeof user.id !== 'number') {
    return res.status(401).json({ error: "Not authenticated or invalid user ID" });
  }

  const { content, image_url } = req.body;
  const user_id = user.id;

  try {
    const [newPost] = await db('posts')
      .insert({ user_id, content, image_url })
      .returning('*');

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}) as RequestHandler);

// DELETE /posts/:id - delete a post and its image from S3 if present
router.delete('/posts/:id', (async (req, res) => {
  const { id } = req.params;

  try {
    const post = await db('posts').where({ id }).first();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await db('posts').where({ id }).del();

    if (post.image_url) {
      const imageKey = post.image_url.split('/').pop();
      await s3.deleteObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: imageKey!,
      }).promise();
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
}) as RequestHandler);

// POST /posts/:id/like - Like a post
router.post('/posts/:id/like', (async (req, res) => {
  const { id: post_id } = req.params;
  const { user_id } = req.body;

  try {
    await db('likes').insert({ post_id, user_id });
    res.status(201).json({ message: 'Post liked' });
  } catch (error) {
    if ((error as any).code === '23505') {
      return res.status(409).json({ message: 'Already liked' });
    }
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
}) as RequestHandler);

// DELETE /posts/:id/like
router.delete('/posts/:id/like', (async (req, res) => {
  const { id: post_id } = req.params;
  const { user_id } = req.body;

  try {
    await db('likes').where({ post_id, user_id }).del();
    res.status(200).json({ message: 'Post unliked' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
}) as RequestHandler);

export default router;