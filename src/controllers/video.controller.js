import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary, deleteFromCloudinary } from '../services/cloudinary.js'
import { ApiError } from '../utils/ApiError.js';
import { Video } from '../models/video.model.js'
import { User } from '../models/user.model.js'
import { Like } from '../models/like.model.js'
import { Comment } from '../models/comment.model.js'
import mongoose from 'mongoose'

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    if(query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query,
                    path: ["title", "description"]
                } 
            }
        });
    }

    if(userId) {
        if(!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid userId");
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }
    
    pipeline.push({ $match: { isPublished: true }});

    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1
            }
        });
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };
    
    const videos = await Video.aggregatePaginate(pipeline, options);

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishVideo = asyncHandler( async (req, res) => {
    const { title, description } = req.body;

    if([ title, description ].some((field) => field?.trim() === ''))
        throw new ApiError(400, 'All fieds required');

    const thumnailLocalPath = req.files?.thumbnail[0]?.path;
    const videoFileLocalPath = req.files?.videoFile[0]?.path; 
    if(!thumnailLocalPath) throw new ApiError(400, "thumbnail file is missing!");
    if(!videoFileLocalPath) throw new ApiError(400, "video file is missing!");

    const thumbnailResponseFromCloudinary = await uploadOnCloudinary(thumnailLocalPath);
    const videoFileResponseFromCloudinary = await uploadOnCloudinary(videoFileLocalPath);
    if(!thumbnailResponseFromCloudinary) throw new ApiError(400, "Something went wrong while uploading thumnail");
    if(!videoFileResponseFromCloudinary) throw new ApiError(400, "Something went wrong while uploading video");

    const video = await Video.create({
        videoFile: videoFileResponseFromCloudinary.secure_url,
        thumbnail: thumbnailResponseFromCloudinary.secure_url,
        title,
        description,
        duration: videoFileResponseFromCloudinary.duration,
        owner: req.user.id,
        thumbnailPublicId: thumbnailResponseFromCloudinary.public_id,
        videoFilePublicId: videoFileResponseFromCloudinary.public_id,
    });

    if (!video) throw new ApiError(500, "Video upload failed. Please try again !!!");

    res.status(201).json( new ApiResponse(201, video, "Video uploaded successfully!"));
});

const getVideoById = asyncHandler( async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid videoId");

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        }, 
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as: 'likes',
            }
        },
        {
            $addFields: {
                $size: "$likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    $if: { $in: [req.user.id, "$subscribers.subscriber"]},
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avtarImage: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'video',
                as: 'comments',
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
                              $first: "$owner"
                            }
                        }
                    },
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
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                },
                owner: 1,
                likes: 1,
                comments: 1
            }
        },
    ]);

    if (!video.length) throw new ApiError(404, "Video not found!");

    // increment views if video fetched 
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1} 
    });

    //add this video to user watch history
    await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { watchHistory : videoId}
    });

    res.status(200).json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const deleteVideo = asyncHandler( async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");
    
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(400, "Video not found!");
    
    await Video.findByIdAndDelete(videoId);

    await deleteFromCloudinary(video.thumbnailPublicId);
    await deleteFromCloudinary(video.videoFilePublicId, "video");
    
    await Like.deleteMany({ video: videoId });
    await Comment.deleteMany({ video: videoId })

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler( async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    );

    res.status(200).json( new ApiResponse(200, { isPublished: updatedVideo.isPublished },`Video publish status updated to ${updatedVideo.isPublished ? 'published' : 'unpublished'}.`));
});

export {
    getAllVideos,
    publishVideo,
    deleteVideo,
    getVideoById,
    togglePublishStatus
}