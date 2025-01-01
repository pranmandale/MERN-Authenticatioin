import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
    console.error("Mongo URI is missing in environment variables!");
    process.exit(1);  // Exit the process if no URI is provided
}

const connection = async () => {
    try {
        console.log('Mongo URI:', MONGO_URI);  // Log the URI to verify it's correct

        // Wait for the connection to resolve
        await mongoose.connect(MONGO_URI, {
            dbName: "MERN_AUTHENTICATION",
        });

        console.log("MongoDB is connected successfully");
    } catch (err) {
        console.error(`DB connection error: ${err}`);
    }
};

export { connection };
