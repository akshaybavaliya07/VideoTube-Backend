import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { toggleVideoLike, toggleCommentLike, toggleTweetLike } from '../controllers/like.controller.js'

const route = Router();

route
.use(verifyJWT)
.post('/toggle/video/:videoId', toggleVideoLike)
.post('/toggle/comment/:commentId', toggleCommentLike)
.post('/toggle/tweet/:tweetId', toggleTweetLike)

export default route