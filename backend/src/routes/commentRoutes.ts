import { Router } from 'express';
import { fetchComments, postComment, removeComment } from '../controllers/OpenAi/commentController';

const router = Router();
router.get('/posts/:postId/comments', fetchComments);
router.post('/posts/:postId/comments', postComment);
router.delete('/comments/:commentId', removeComment);

export default router;
