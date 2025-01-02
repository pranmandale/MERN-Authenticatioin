import express from "express"
import { register, verifyTOP } from "../controllers/user.controller.js"
const router = express.Router();


// this route is for user registration
router.post("/register", register)

// this route is for otp verification after user register this route will be encountered
router.post("/otp-verification", verifyTOP)

export default router;