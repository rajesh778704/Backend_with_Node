import mongoose from "mongoose";
import db_name from "../constants.js";

const connectDB=async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log("Database connected succesfuly...");
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
    console.log("Done...")
}
export default connectDB;