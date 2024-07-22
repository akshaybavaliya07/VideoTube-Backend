import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../services/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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
        avtarImage: avtarResponseFromClodinary?.secure_url,
        coverImage: coverResponseFromClodinary?.secure_url,
        password
    });

    res.status(201).json(
        new ApiResponse(200, user, "New user created successfully")
    )
});

export { registerUser }