import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller.js'

const route = Router();

route.use(verifyJWT)
.get('/stats', getChannelStats)
.get('/videos', getChannelVideos)

export default route