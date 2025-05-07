import {asyncHandeler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken=async(userId)=>{
    try {
            const user= await User.findById(userId);
            const accessToken= user.generateAccessToken();
            const refreshToken=user.generateRefreshToken();

            user.refreshToken=refreshToken;
            await user.save({ValidateBeforeSave : false})

            return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"Error happen while creating Access & Refresh Token");
    }
}

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
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avtarLocalPath){
        throw new ApiError(400,"Avtar File is Required. 1");  
    }

     //5. upload on cloudnary
     console.log(avtarLocalPath);
     console.log(avtarLocalPath);
     const avtar = await uploadOnCloudinary(avtarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if(!avtar){
        throw new ApiError(400,"Avtar File is Required. 2");  
     }

      //6. create user object

      const user = await User.create({
        fullName,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
    //7. remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //8.  check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    //9. Return user response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

   
})

const loginUser= asyncHandeler( async(req,res)=>{
    //data from plyload
    //username or email
    //find user
    //password check
    //access and refresh token
    //send cookie

    const { email, username, password}= req.body;

    if(!(username || email)){
        throw new ApiError(400,"Username or email id is reqired");
    }

   const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"User not exist");
    }

    const isPasswordValid= await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid Password");
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select
    ("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
       new ApiResponse(
        200,
        {
            user:loggedInUser, accessToken, refreshToken
        },
        "User Logged in successfully"
       )
    )


})

const logoutUser = asyncHandeler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new:true
        }
    )

     const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            201,{},"User logged out successfully"
        )
    )

})

const changePassword= asyncHandeler(async(req,res)=>{
    const {oldPassword , newPassword} = req.body;

    const user= await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Incorrect Old Password")
    }

    user.password=newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(201,{}, "Password changed successfully")
    )


})

const getCurrentUser= asyncHandeler( async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(201,req.user,"User fetched successfully ")
    )
})



    export {
                registerUser , 
                loginUser , 
                logoutUser,
                changePassword,
                getCurrentUser 
           }