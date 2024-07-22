import { ApiError } from "../utils/ApiError";

 export const verifyJWT = async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) throw new ApiError(401, "Unauthorized request");
    
        const user = await verifyJWT(token, ACCESS_TOKEN_SECRET);
        req.user = user;
        next(); 
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    } 
};