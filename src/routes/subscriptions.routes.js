import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const route = Router();

route
.get('/subscribers/:channelId', getUserChannelSubscribers)
.get('/subscriptions/:userId', getSubscribedChannels)
.use(verifyJWT)
.post('/toggle/:channelId', toggleSubscription)

export default route