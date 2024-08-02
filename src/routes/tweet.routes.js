import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { createTweet, updateTweet, deleteTweet, getUserTweets } from '../controllers/tweet.controller.js'

const route = Router();

route.use(verifyJWT)
.post('/', createTweet)
.patch('/:tweetId', updateTweet)
.delete('/:tweetId', deleteTweet)
.get('/user/:userId', getUserTweets)

export default route