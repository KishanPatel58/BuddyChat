import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const url = process.env.MONGODB_URL;
        await mongoose.connection.on("connected", async () => {
            console.log("MongoDB Connected.")
        })
        if(!url) throw new Error("Database URL not found.");
        await mongoose.connect(url);
    } catch (error) {
        throw new Error("Problem to Connect with Database.")
    }
}

export default connectDB;