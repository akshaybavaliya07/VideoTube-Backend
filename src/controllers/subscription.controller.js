import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse }from '../utils/ApiResponse.js'
import { Subscription } from '../models/subscription.model.js'
import mongoose from 'mongoose';

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    const isSubscribed = await Subscription.findOne({ subscriber: req.user.id, channel: channelId});
    if(isSubscribed) {
        await Subscription.deleteOne({ subscriber: req.user.id, channel: channelId});

        res.status(200).json( new ApiResponse(200, { subscribed: false} ,'Channel unsubscribed successfully!'));
    }
    
    await Subscription.create({
        subscriber: req.user.id,
        channel: channelId
    });

    res.status(201).json( new ApiResponse(201, { subscribed: true} ,'Channel subscribed successfully!'));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400, "Invalid channelId");

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avtarImage: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                subscriber: {
                    username: 1,
                    avatarImage: 1
                }
            }
        }
    ]);

    res.status(200).json( new ApiResponse( 200, subscribers, "subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid userId");

    const subscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channel',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avtarImage: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$channel'
        },
        {
            $project: {
                channel: {
                    username: 1,
                    avtarImage: 1
                }
            }
        }
    ]);

    res.status(200).json( new ApiResponse( 200, subscribed, "subscribed channel fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}