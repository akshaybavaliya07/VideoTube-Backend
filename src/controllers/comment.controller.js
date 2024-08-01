import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Comment } from '../models/comment.model.js'
import { Like } from '../models/like.model.js'
import mongoose from 'mongoose';

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    const commentsAggregatePipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
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
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'comment',
                as: 'likes'
            }
        },
        {
            $addFields: {
                owner: {
                    $first: '$owner'
                },
                likes: {
                    $size: '$likes'
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user.id, '$likes.likedBy']},
                        then: true,
                        else: false
                    }
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
                content: 1,
                owner: 1,
                likes: 1,
                isLiked: 1,
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                }
            }
        }
    ]

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const videoComments = await Comment.aggregatePaginate(commentsAggregatePipeline, options);

    res.status(200).json( new ApiResponse(200, videoComments, "Comments fetched successfully!"))
});

const addComment = asyncHandler( async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params; 

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user.id
    });

    res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler( async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: { content }
        },
        { new: true }
    );

    if (!updatedComment) res.status(404).json(new ApiResponse(404, null, "Comment not found"));

    res.status(200).json( new ApiResponse(200, updatedComment, "Comment edited successfully"));
});

const deleteComment = asyncHandler( async (req, res) => {
    const { commentId } = req.params;

    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({ comment: commentId });

    res.status(200).json( new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});

export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}