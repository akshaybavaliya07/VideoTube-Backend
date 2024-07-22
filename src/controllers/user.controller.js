import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../services/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { generateAccessnAndRefreshTokens } from '../services/tokenService.js'
import { COOKIE_OPTIONS } from '../constants.js'

const registerUser = asyncHandler( async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if([ fullName, email, username, password ].some((field) => field?.trim() === ''))
        throw new ApiError(400, 'All fieds required');

    const existedUser = await User.findOne({ $or: [{username}, {email}]});   
    if(existedUser) throw new ApiError(409, "User with email or username already exists");

    const avatarLocalpath = req.files?.avtarImage[0]?.path; 
    const coverLocalpath = req.files?.coverImage[0]?.path; 

    const avtarResponseFromClodinary = await uploadOnCloudinary(avatarLocalpath);
    const coverResponseFromClodinary = await uploadOnCloudinary(coverLocalpath);

    // console.log(avtarResponseFromClodinary);
    // console.log(coverResponseFromClodinary);

    const user = await User.create({
        fullName,
        email,
        username,
        avtarImage: avtarResponseFromClodinary ? avtarResponseFromClodinary?.secure_url : "",
        coverImage: coverResponseFromClodinary ? coverResponseFromClodinary?.secure_url : "",
        password
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
        $set: { refreshToken : undefined}
    });

    res.status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json( new ApiResponse(200, {}, "User logged out"))
});

export { 
    registerUser,
    loginUser,
    logoutUser,
}