import {asyncHandeler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User, Userser } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser= asyncHandeler( async(req, res)=>{

    //1. get user details from frontend
     const{ username , email , fullName , password}=req.body;
    
    //2. validation mandatory filed
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

    //3. check user is exists or not
   const user_Exist= await User.findOne({
        $or:[ {email} , {username} ]
    })
    if(user_Exist){
        throw new ApiError(409,"User Already exist..")
    }

    //4. check image present or not
    const avtarLocalPath=req.files?.avtar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400,"Avtar File is Required.");  
    }

     //5. upload on cloudnary
     const avtar = await uploadOnCloudinary(avtarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if(!avtar){
        throw new ApiError(400,"Avtar File is Required.");  
     }

      //6. create user object

     const user= await User.create({
            fullName,
            avtar:avtar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username : username.toLowerCase()
      })

       //7. remove password and refresh token from response
    const createdUser= User.findById(user._id).select(
        "-password -refreshToken"
    )

    //8.check user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong at the time of userCreation");
    }

    //9. give response

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Susseccfully")
    )
   
})



export {registerUser, postUser}