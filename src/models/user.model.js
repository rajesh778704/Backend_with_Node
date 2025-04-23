import mongoose, { Schema } from "mongoose";

const userSchema= new Schema({
    usernmae:{
        type:String,
        require:true,
        unique:true,
        index:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        trim:true
    },
    fullname:{
        type:String,
        require:true,
        index:true,
        trim:true
    },
    password:{
        type:String,
        require:[true,"Password is required"] 
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    avtar:{
        type:String,
        require:true
    },
    coverImage:{
        type:String
    },
    refreshToken:{
        type:String
    }

},{
    timestamps:true
})

export const user=mongoose.model("User",userSchema);