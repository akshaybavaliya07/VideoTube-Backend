import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'

export const generateAccessnAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken(); 
        const refreshToken = user.generateRefreshToken(); 

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Failed to generate tokens");
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error?.message || error);
        throw new ApiError(500, "Something went wrong while generating Access and Refresh tokens");    
    }
}