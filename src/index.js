import dotenv from 'dotenv';
dotenv.config({ path: './env' });
import { app } from './app.js';
import connectDB from './db/index.js';


connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
       console.log(`The server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Database connection failed",err);
})



