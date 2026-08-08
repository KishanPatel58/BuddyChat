import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        mongoose.connection.on("connected", () => console.log("MongoDB Connected Successfully."));
        mongoose.connection.on("error", (error) => {
            console.error("MongoDB Connection Error:", error);
        });
        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB Disconnected.");
        });
        await mongoose.connect(process.env.MONGODB_URL as string)
    } catch (error) {
        throw new Error("Problem to connect with Database.")
    }
}

export default connectDB;