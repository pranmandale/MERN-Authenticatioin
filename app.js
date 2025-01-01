import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.router.js"

dotenv.config({path: "./.env"});

const app = express();

// middlewares
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/user", userRouter)

// http://localhost:4000/api/v1/user/register

app.use(errorHandler)


export {app};