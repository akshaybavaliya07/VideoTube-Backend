import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectToDB = async () => {
        await mongoose.connect(`${ process.env.MONGODB_URL}/${DB_NAME}`);
};

export { connectToDB }