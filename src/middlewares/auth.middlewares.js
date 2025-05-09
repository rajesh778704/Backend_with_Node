import { ApiError } from "../utils/ApiError.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandeler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"UnAuthorized Request");
        }
    
       const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
       const user = await User.findById(decodedToken?._id).select
       ("-password -refreshToken")
    
       if(!user){
            throw new ApiError(401,"Invalid Access Token");
       }
    
       req.user=user;
       next()
    } catch (error) {
        throw new ApiError(401,"Invalid access Token error");
    }
   
}) 