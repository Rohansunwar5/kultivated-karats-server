import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
import mongoose from "mongoose";

dotenv.config({
    path: "./.env",
});

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("🖥  Server running at PORT: "+process.env.PORT+", URL: http://localhost:8000/");
        console.log(mongoose.models);
    });
}).catch((err) => {
    console.log("☠️ MONGO DB CONNECTION failed !! ", err);
});