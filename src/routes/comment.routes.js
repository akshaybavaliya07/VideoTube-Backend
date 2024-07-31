import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { addComment, updateComment, deleteComment, getVideoComments } from '../controllers/comment.controller.js'

const route = Router();
route.use(verifyJWT);

route
.post('/:videoId', addComment)
.patch('/:commentId', updateComment)
.delete('/:commentId', deleteComment)
.get('/:videoId', getVideoComments)

export default route