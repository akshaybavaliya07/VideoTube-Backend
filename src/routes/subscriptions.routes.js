import { Router } from "express"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const route = Router();

route.use(verifyJWT)
.post('/toggle/:channelId', toggleSubscription)
.get('/subscribers/:channelId', getUserChannelSubscribers)
.get('/subscriptions/:userId', getSubscribedChannels)

export default route