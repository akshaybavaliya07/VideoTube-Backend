import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse }from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { Tweet } from '../models/tweet.model.js'
import { Like } from '../models/like.model.js'
import { User } from '../models/user.model.js'
import mongoose from 'mongoose'

const createTweet = asyncHandler( async (req, res) => {
    const { content } = req.body;

    const tweet = await Tweet.create({
        content,
        owner: req.user.id
    });

    if (!tweet) throw new ApiError(500, "failed to create tweet please try again");

    res.status(201).json( new ApiResponse(201, tweet, "Tweet created successfully"));
});

const updateTweet = asyncHandler( async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    const updatedTweet = await Tweet.findByIdAndUpdate( tweetId,
        {
            $set: { content },
        },
        { new: true }
    );

    if(!updatedTweet) throw new ApiError(500, "Failed to edit tweet. please try again!!!");

    res.status(200).json( new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler( async (req, res) => {
    const { tweetId } = req.params;

    await Tweet.findByIdAndDelete(tweetId);

    await Like.deleteMany({ tweet: tweetId});

    res.status(200).json( new ApiResponse(200, "Tweet deleted successfully"))
});

const getUserTweets = asyncHandler( async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(req.user.id).select('username avatarImage');

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user.id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $project: {
                content: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    res.status(200).json(new ApiResponse(200, {...user, ...tweets}, "Tweets fetched successfully"));
});

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}