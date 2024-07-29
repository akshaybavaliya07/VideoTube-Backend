import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import { publishVideo, deleteVideo, getVideoById } from '../controllers/video.controller.js'

const route = Router();
route.use(verifyJWT);

route.post('/upload-video', upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), publishVideo);

route
.post('/delete-video/:videoId', deleteVideo)
.get('/:videoId', getVideoById)

export default route