import { Router } from "express"
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js'
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

export default route