import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { Playlist } from '../models/playlist.model.js'
import mongoose from 'mongoose'

const createPlaylist = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const playlist = await Playlist.create({
        name,
        owner: req.user.id
    });

    if(!playlist) throw new ApiError(500, "failed to create playlist");

    res.status(201).json( new ApiResponse(201, playlist, "playlist created successfully"))
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
                owner: new mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'videos',
                foreignField: '_id',
                as: 'videos',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
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
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            owner: { username: 1 }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                name: 1,
                videos: 1,
                totalVideos: 1,
                totalViews: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name} = req.body
   
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId, 
        { $set: { name } },
        { new: true }
    );

    if (!updatedPlaylist) throw new ApiError(404, "Playlist not found!");

    res.status(200).json(new ApiResponse(200,updatedPlaylist ,"Playlist updated successfully!"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json(new ApiResponse(200, {}, "playlist removed successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'videos',
                foreignField: '_id',
                as: 'videos',
            }
        },
        {
            $addFields: {
                totalVideos: { $size: '$videos' },
                totalViews: { $sum: '$videos.views' }
            }
        },
        {
            $project: {
                name: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ]);

    res.status(200).json( new ApiResponse(200, playlists, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId ,{
        $addToSet: {
            videos: videoId
        }
    }, { new: true });

    if(!updatedPlaylist) throw new ApiError(500, "failed to add video into playlist. please try again!!!");

    res.status(200).json(new ApiResponse(200, updatedPlaylist, "video added to playlist successfully!"))
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId ,{
        $pull: {
            videos: videoId
        }
    }, { new: true });

    if (!updatedPlaylist) throw new ApiError(500, "Failed to remove video from playlist. Please try again!");

    res.status(200).json(new ApiResponse(200, updatedPlaylist, "video removed from playlist successfully!"))
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}