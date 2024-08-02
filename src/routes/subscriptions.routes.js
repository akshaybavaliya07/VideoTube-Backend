import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const route = Router();

route
.get('/subscribers/:channelId', getUserChannelSubscribers)
.use(verifyJWT)
.post('/toggle/:channelId', toggleSubscription)
.get('/subscriptions/:userId', getSubscribedChannels)

export default route