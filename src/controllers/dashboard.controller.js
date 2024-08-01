import { asyncHandler } from '../utils/asyncHandler'
import { ApiResponse } from '../utils/ApiResponse'
import { Subscription } from '../models/subscription.model.js'
import { Video } from '../models/video.model.js'
import mongoose from 'mongoose'

const getChannelStats = asyncHandler(async (req, res) => {
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $count: "subscribersCount"
        }
    ]);

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as: 'likes'
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                totalVideos: 1,
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: "$totalVideos"},
                totalViews: { $sum: "$totalViews"},
                totalLikes: { $sum: "$totalLikes" }
            }
        }
    ]);

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalVideos: videos[0]?.totalVideos || 0,
        totalViews: videos[0]?.totalViews || 0,
        totalLikes: videos[0]?.totalLikes || 0
    }

    res.status(200).json( new ApiResponse(200, channelStats, "channel stats fetched successfully!"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                },
                isPublished: 1,
                likesCount: 1
            }
        }
    ]);

    res.status(200).json( new ApiResponse(200, videos, "All videos of the channel fetched successfully!"));
});

export {
    getChannelStats,
    getChannelVideos
}