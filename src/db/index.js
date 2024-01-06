import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js'
import express from 'express'

const app = express();
async function  connectDB(){
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("ERROR",error);
            throw error
        })
      
        console.log("MONGODB IS CONNECTED");
    } catch (error) {
        console.error("ERROR : ",error)
        process.exit(1);
    }
}
export default connectDB;