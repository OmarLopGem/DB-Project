import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://j-omar:LOGjor1602@cluster0.rmdoztf.mongodb.net/NewPages");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;