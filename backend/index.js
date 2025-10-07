import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from 'cloudinary';

const app = express()

// env use 
dotenv.config()
const port = process.env.PORT;

// calling mongodb 
const mongo_url = process.env.MONGO_URI;

// middleware 
app.use(express.json());

app.use(
  fileUpload({
    useTempFiles:true,
    tempFileDir: "/tmp/",
  })
);


// database code 
try {
    mongoose.connect(mongo_url);
    console.log("connected to mongo db");
} catch (error) {
    console.log(error)
}


// ROUTES 

// for signup
app.use("/api/users", userRoute); 

// CLOUDINARY 
 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
    });

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
