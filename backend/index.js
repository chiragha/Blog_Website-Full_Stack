import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js"

const app = express()

// env use 
dotenv.config()
const port = process.env.PORT;

// calling mongodb 
const mongo_url = process.env.MONGO_URL;


// database code 
try {
    mongoose.connect(mongo_url);
    console.log("connected to mongo db");
} catch (error) {
    console.log(error)
}

// middleware 
app.use(express.json());

// for signup
app.use("/api/users", userRoute); 

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
