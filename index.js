import { app } from "./app.js";
import dotenv from "dotenv";
import { connection } from "./database/dbconnection.js";

dotenv.config({path: "./.env"});

const PORT = process.env.PORT || 0;

connection();
app.listen(PORT, () => {
    console.log(`server is listening on PORT ${PORT}`);
})
