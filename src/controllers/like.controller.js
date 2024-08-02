import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Like } from '../models/like.model.js'
import mongoose from 'mongoose';

const toggleVideoLike = asyncHandler( async (req, res) => {
    const { videoId } = req.params;

    const likedAlready = await Like.findOne({ video: videoId, likedBy: req.user.id });
    if(likedAlready) {
        await Like.findOneAndDelete({ video: videoId, likedBy: req.user.id });

        res.status(200).json( new ApiResponse(200, { isLiked: false}));
    }

    await Like.create({
        video: videoId,
        likedBy: req.user.id
    });

    res.status(200).json( new ApiResponse(200, { isLiked: true}));
});

const toggleCommentLike = asyncHandler( async (req, res) => {
    const { commentId } = req.params;

    const likedAlready = await Like.findOne({ comment: commentId, likedBy: req.user.id });
    if(likedAlready) {
        await Like.findOneAndDelete({ comment: commentId, likedBy: req.user.id });

        res.status(200).json( new ApiResponse(200, { isLiked: false}));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user.id
    });

    res.status(200).json( new ApiResponse(200, { isLiked: true}));
});

const toggleTweetLike = asyncHandler( async (req, res) => {
    const { tweetId } = req.params;

    const likedAlready = await Like.findOne({ tweet: tweetId, likedBy: req.user.id });
    if(likedAlready) {
        await Like.findOneAndDelete({ tweet: tweetId, likedBy: req.user.id });

        res.status(200).json( new ApiResponse(200, { isLiked: false}));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user.id
    });

    res.status(200).json( new ApiResponse(200, { isLiked: true}));
});

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video',
                pipeline: [
                    {
                       $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner'
                       } 
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            owner: {
                                username: 1
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: '$video'
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
                video: 1
            }
        }
    ]);

    res.status(200).json( new ApiResponse( 200, likedVideos, "liked videos fetched successfully"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}