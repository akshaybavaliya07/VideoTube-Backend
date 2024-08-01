import mongoose, { Schema } from "mongoose"

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Add indexes to optimize queries
likeSchema.index({ likedBy: 1, video: 1 }); // Index for video likes
likeSchema.index({ likedBy: 1, comment: 1 }); // Index for comment likes
likeSchema.index({ likedBy: 1, tweet: 1 }); // Index for tweet likes

export const Like = mongoose.model("Like", likeSchema);