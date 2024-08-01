import { Router } from "express"
import { registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvtar, 
    updateUserCover, 
    getChannelProfile,
    getWatchHistory, 
    removeFromWatchHistory } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const route = Router();

route.post('/register', upload.fields([
    { name: 'avtarImage', maxCount: 1},
    { name: 'coverImage', maxCount: 1}
]) ,registerUser);

route
.post('/login', loginUser)
.post('/refresh-token', refreshAccessToken)
.use(verifyJWT)  // // Apply verifyJWT middleware to all subsequent routes
.post('/logout', logoutUser)
.get('/watch-history', getWatchHistory)
.delete('/:videoId', removeFromWatchHistory)
.post('/change-password', changeCurrentPassword)
.post('/current-user', getCurrentUser)
.patch('/update-avtar', upload.single('avtarImage'), updateUserAvtar)
.patch('/update-cover', upload.single('coverImage'), updateUserCover)
.get('/:username', getChannelProfile)

export default route