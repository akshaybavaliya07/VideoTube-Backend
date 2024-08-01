import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

// route import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import subscriptionRouter from './routes/subscriptions.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
 
// route declaration
app
.use('/api/user', userRouter)
.use('/api/video', videoRouter)
.use('/api/comment', commentRouter)
.use('/api/like', likeRouter)
.use('/api/subscription', subscriptionRouter)
.use('/api/playlist', playlistRouter)
.use('/api/tweet', tweetRouter)
.use('/api/dashboard', dashboardRouter)

export default app