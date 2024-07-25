import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserAvtar, updateUserCover, getChannelProfile, subscribeChannel, unSubscribeChannel } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const route = Router();

route.post('/register', upload.fields([
    { name: 'avtarImage', maxCount: 1},
    { name: 'coverImage', maxCount: 1}
]) ,registerUser);

route
.post('/login', loginUser)
.post('/logout', verifyJWT, logoutUser)
.post('/refresh-token', refreshAccessToken)
.get('/:username', verifyJWT, getChannelProfile)
.post('/:username/subscribe', verifyJWT, subscribeChannel)
.post('/:username/unsubscribe', verifyJWT, unSubscribeChannel)
.post('/change-passowrd', verifyJWT, changeCurrentPassword)
.post('/current-user', verifyJWT, getCurrentUser)
.post('/update-avtar', verifyJWT, upload.single('avtarImage'), updateUserAvtar)
.post('/update-cover', verifyJWT, upload.single('coverImage'), updateUserCover)

export default route