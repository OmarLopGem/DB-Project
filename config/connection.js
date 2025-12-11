// Jorge Omar Lopez Gemigniani 9049992
// Daniel Garrido Quinde 9042293
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://j-omar:LOGjor1602@cluster0.rmdoztf.mongodb.net/NewPagesSystems_DB");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;