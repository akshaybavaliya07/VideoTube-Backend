import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(cookieParser());

// route import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import subscriptionRouter from './routes/subscriptions.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import tweetRouter from './routes/tweet.routes.js'
 
// route declaration
app
.use('/api/user', userRouter)
.use('/api/video', videoRouter)
.use('/api/comment', commentRouter)
.use('/api/like', likeRouter)
.use('/api/subscription', subscriptionRouter)
.use('/api/playlist', playlistRouter)
.use('/api/tweet', tweetRouter)

export default app