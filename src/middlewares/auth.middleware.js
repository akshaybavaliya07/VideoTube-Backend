import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'

export const verifyJWT = async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) throw new ApiError(401, "Unauthorized request");
    
        const userPayload = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = userPayload;
        next(); 
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    } 
};