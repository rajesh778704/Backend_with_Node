import {asyncHandeler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Userser } from "../models/user.model.js";

const resgisterUser= asyncHandeler( async(req, res)=>{
    //check image present or not
    //upload on cloudnary
    //create user object
    //remove password and refresh token from response
    //check user creation
    // give response

    //get user details from frontend
     const{ username , email , fullName , password}=req.body;
    
    //validation mandatory filed
     if(
        [username, email,fullName,password].some((field)=>{
             return field?.trim()===""
        }
    )
    ){
        // console.log("Line executed1233")
        throw new ApiError(400," Please Enter data in the mandatory filed");
        
    }
    // console.log("Line executed")

    //check user is exists or not


   
})

const postUser= asyncHandeler( async(req,res)=>{
    await res.status(200).json({
        message:"Post method is called"
    })
})

export {resgisterUser, postUser}