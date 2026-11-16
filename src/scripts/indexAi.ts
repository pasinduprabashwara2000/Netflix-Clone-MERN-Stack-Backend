import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db";
import {reindexAll} from "../services/AiService";

// Run once (and after bulk imports) so AI search is ready before the first visitor:
//   npm run ai:index
async function main() {
    if (!process.env.MONGO_URI || !process.env.OPENAI_API_KEY) {
        throw new Error("MONGO_URI and OPENAI_API_KEY must be set in .env");
    }

    await connectDB();
    const count = await reindexAll();
    console.log(`Indexed ${count} titles`);
    await mongoose.disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
