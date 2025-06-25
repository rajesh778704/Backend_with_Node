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
     const{ username , email , fullName , password, role}=req.body;
    console.log(req.body)
    //2. validation mandatory filed
     if(
        [username, email,fullName,password, role].some((field)=>{
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
        username: username.toLowerCase(),
        role: role
    })
    console.log(user)
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

const changeEmail = asyncHandeler(async(req,res)=>{
    const { email } = req.body;

    if(!email){
        throw new ApiError(401,"Eamil id is required");
    }
   const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
           .status(200)
           .json(
              new ApiResponse(200,user,"Email id changed successfully")
           )
}) 

const adminPannel= asyncHandeler(async(req,res)=>{

    const user= await User.findById(req.user?._id)
    const role=user.role.toLowerCase();
    if(role != 'admin'){
        throw new ApiError(401,"Only Admin can Access this page...")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,{},"Welcome to the Admin Pannel.")
    )

})

const searchUser = asyncHandeler(async(req,res)=>{
    let  {name='', page=1, limit=10}  = req.query;

    const user= await User.findById(req.user?._id);

    if(user.role.toLowerCase() != 'admin'){
        throw new ApiError(401,"Only Admin can Access this page...")
    }

      if (!name || !(name = name.trim())) {
       throw new ApiError(400, "Name is required to search user");
     }

     const skip= (parseInt(page)-1)*(parseInt(limit));

    const userDetails= await User.aggregate([
        {
            $match:{
                 fullName: { $regex: new RegExp(name, 'i') }
            }
        },
        {
            $project:{
                _id:0,
                fullName:1,
                email:1,
                username:1,
                role:1
            }
        },
        {$skip:skip},
        {$limit:parseInt(limit)}
    ])

    if(userDetails.length === 0 ){
        throw new ApiError(404,"No User Found with")
    }
    console.log(userDetails)
    return res
    .status(202)
    .json(
        new ApiResponse (202,userDetails,"User Details Fetch successfully")
    )

}) 



    export {
                registerUser , 
                loginUser , 
                logoutUser,
                changePassword,
                getCurrentUser,
                changeEmail,
                adminPannel,
                searchUser
           }