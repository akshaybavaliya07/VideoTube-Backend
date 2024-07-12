import {} from "dotenv/config.js";
import { connectToDB } from "./db/DBconnection.js"
import app from "./app.js"

connectToDB()
.then(() => console.log("Database connected successfully"))
.catch((err) => {
    console.log("MongoDB Connection Failed... => ", err);
    process.exit(1);
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started...");
});