import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Comment } from '../models/comment.model.js'
import { Like } from '../models/like.model.js'

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
}