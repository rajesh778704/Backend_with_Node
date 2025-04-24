import mongoose, { Schema } from "mongoose";
import bcrypt from "bcypt";
import jwt from "jsonwebtoken";


const userSchema= new Schema({
    username:{
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
    fullName:{
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

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password=bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect= async function (password) {
    return  await bcrypt.compare(this.password,password);
}

userSchema.method.generateAccessToken=function(){
   return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};
userSchema.method.generateRefreshToken=function(){
   return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
    )
};

export const user=mongoose.model("User",userSchema);