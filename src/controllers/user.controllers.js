import {asyncHandeler} from "../utils/asyncHandler.js";

const resgisterUser= asyncHandeler( async(req, res)=>{
   await res.status(200).json({
        message:"User Created"
    })
})

const postUser= asyncHandeler( async(req,res)=>{
    await res.status(200).json({
        message:"Post method is called"
    })
})

export {resgisterUser, postUser}