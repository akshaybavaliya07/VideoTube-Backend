import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary, deleteFromCloudinary } from '../services/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { generateAccessnAndRefreshTokens } from '../services/tokenService.js'
import { COOKIE_OPTIONS } from '../constants.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const registerUser = asyncHandler( async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if([ fullName, email, username, password ].some((field) => field?.trim() === ''))
        throw new ApiError(400, 'All fieds required');

    const existedUser = await User.findOne({ $or: [{username}, {email}]});   
    if(existedUser) throw new ApiError(409, "User with email or username already exists");

    const avtarLocalpath = req.files?.avtarImage[0]?.path; 
    const coverLocalpath = req.files?.coverImage[0]?.path; 

    const avtarResponseFromClodinary = await uploadOnCloudinary(avtarLocalpath);
    const coverResponseFromClodinary = await uploadOnCloudinary(coverLocalpath);

    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avtarImage: avtarResponseFromClodinary ? avtarResponseFromClodinary?.secure_url : "",
        avtarImagePublicId: avtarResponseFromClodinary ? avtarResponseFromClodinary?.public_id: "",
        coverImage: coverResponseFromClodinary ? coverResponseFromClodinary?.secure_url : "",
        coverImagePublicId: coverResponseFromClodinary ? coverResponseFromClodinary?.public_id : "",
    });

    res.status(201).json(
        new ApiResponse(200, user, "New user created successfully")
    )
});

const loginUser = asyncHandler( async (req, res) => {
    const { usernameORemail, password } = req.body;
    if(!usernameORemail) throw new ApiError(400, "username or email is required");

    const user = await User.findOne({ $or: [{email: usernameORemail}, {username: usernameORemail}]});
    if(!user) throw new ApiError(401, "user not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(401, "Invalid password");

    const { accessToken, refreshToken } = await generateAccessnAndRefreshTokens(user._id);

    res.status(200)
    .cookie('accessToken', accessToken, COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .json( new ApiResponse(200, { user, accessToken, refreshToken }, "User logged In Successfully"))
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?.id, {
        $set: { refreshToken : null}
    });

    res.status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json( new ApiResponse(200, {}, "User logged out"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("refreshToken");
    if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");
    try {
        const decodedPayload = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedPayload?.id);
        if(!user) throw new ApiError(401, "Invalid refresh token");
        if(incomingRefreshToken !== user?.refreshToken) 
            throw new ApiError(401, "Refresh token is used or expired");

        const { accessToken, refreshToken } = await generateAccessnAndRefreshTokens(user?._id);

        res.status(201)
        .cookie('accessToken', accessToken, COOKIE_OPTIONS)
        .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
        .json( new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || error)
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid) throw new ApiError(400, "Invalid old password");

    user.password = newPassword;
    await user.save({ validateBeforeSave : false});

    res.status(201).json(new ApiResponse(200, {}, "Password updated successfully"))
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateUserProfile = asyncHandler( async (req, res) => {
  const { fullName } = req.body;
  if(!fullName) throw new ApiError(400, "Nothing new to change");

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
        $set: {
            fullName
        }
    },
    { new: true }
  ).select("username fullName email");

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json( new ApiResponse(200, user, "profile updated."));
});

const updateUserAvtar = asyncHandler( async (req, res) => {
    const avatarLocalpath = req.file?.path;
    if(!avatarLocalpath) throw new ApiError(400, "Avtart file is missing!");

    const user = await User.findById(req.user?.id);
    if(!user) throw new ApiError(404, "User not found");

    const oldAvtarImagePublicId = user.avtarImagePublicId;

    const avtarResponseFromClodinary = await uploadOnCloudinary(avatarLocalpath);
    if(!avtarResponseFromClodinary?.secure_url || !avtarResponseFromClodinary?.public_id) 
      throw new ApiError(500, "Something went wrong while uploading avtar");

    await deleteFromCloudinary(oldAvtarImagePublicId);

    user.avtarImage = avtarResponseFromClodinary.secure_url;
    user.avtarImagePublicId = avtarResponseFromClodinary.public_id;
    await user.save({ validateBeforeSave: false });

    res.status(201).json(new ApiResponse(201, {}, "Avtar file uploaded successfully"))
});

const updateUserCover = asyncHandler( async (req, res) => {
    const coverLocalpath = req.file?.path;
    if(!coverLocalpath) throw new ApiError(400, "Cover file is missing!")

    const user = await User.findById(req.user?.id);
    if (!user) throw new ApiError(404, "User not found");

    const oldCoverImagePublicId = user.coverImagePublicId;

    const coverResponseFromClodinary = await uploadOnCloudinary(coverLocalpath);
    if(!coverResponseFromClodinary?.secure_url || !coverResponseFromClodinary?.public_id) 
      throw new ApiError(500, "Something went wrong while uploading cover");

    await deleteFromCloudinary(oldCoverImagePublicId);

    user.coverImage = coverResponseFromClodinary.secure_url;
    user.coverImagePublicId = coverResponseFromClodinary.public_id;
    await user.save({ validateBeforeSave: false });

    res.status(201).json(new ApiResponse(201, {}, "Cover file uploaded successfully ✅"));
});

const getChannelProfile = asyncHandler( async (req, res) => {
    const { username } = req.params;
    if(!username) throw new ApiError(400, "username missing!");

    const channelInfo = await User.aggregate([
        {
          $match: {
            username: username
          }
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
          }
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribed"
          }
        },
        {
          $addFields: {
            subscribersCount: {
              $size: "$subscribers"
            },
            subscribedCount: {
              $size: "$subscribed"
            },
            isSubscribed: {
              $cond: {
                if: { $in: [new mongoose.Types.ObjectId(req.user?.id), "$subscribers.subscriber"]},
                then: true,
                else: false
              }
            }
          }
        },
        {
          $project: {
            fullName: 1,
            username: 1,
            avtarImage: 1,
            coverImage: 1,
            subscribersCount: 1,
            subscribedCount: 1,
            isSubscribed: 1
          }
        }
    ]);

    if(!channelInfo.length) throw new ApiError(400, "Channel not found");

    res.status(200).json( new ApiResponse(200, channelInfo[0], "Channel profile fetched successfully!"));
});

const getWatchHistory = asyncHandler( async (req, res) => {
  const response = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user.id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avtarImage: 1,
                    coverImage: 1
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
          }
        ]
      }
    },
    {
      $project: {
        username: 1, 
        fullName: 1,
        email: 1,
        avtarImage: 1,
        coverImage: 1,
        watchHistory: 1
      }
    }
  ]);

  res.status(200).json(new ApiResponse(200, response[0], "Watch History fetched successfully!"));
});

const removeFromWatchHistory = asyncHandler( async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid video ID");

  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { watchHistory: videoId } },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, {} , "Video removed from watch history successfully!"));
});

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
    updateUserAvtar,
    updateUserCover,
    getChannelProfile,
    getWatchHistory,
    removeFromWatchHistory
}