import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import { publishVideo, deleteVideo, getVideoById, getAllVideos } from '../controllers/video.controller.js'

const route = Router();

route.get('/', getAllVideos);

route.use(verifyJWT);

route.post('/upload-video', upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), publishVideo);

route
.get('/:videoId', getVideoById)
.delete('/:videoId', deleteVideo)

export default route