import mongoose from "mongoose";

async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("MongoDB connected successfully");
    } catch (error: unknown) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

export default connectDB;
