import { asyncHandler } from '../utils/asyncHandler'
import { ApiResponse } from '../utils/ApiResponse'
import { Like } from '../models/like.model'

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

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike
}