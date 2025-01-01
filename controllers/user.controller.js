// import {errorHandler } from "../middlewares/error.middleware.js";
import { catchAsyncError } from '../middlewares/catchAsyncError.js'
import { User } from "../models/user.models.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import ErrorHandler from '../middlewares/error.middleware.js';


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN,)

export const register = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, phone, password, verificationMethod } = req.body;
        if (!name || !email || !phone || !password || !verificationMethod) {
            return next(new ErrorHandler("All fields are required!", 400))
        }

        // to validate phone number country wise
        function validatePhoneNumber(phone) {
            const phoneRegex = /^\+91[6-9]\d{9}$/;
            return phoneRegex.test(phone);
        }

        if (!validatePhoneNumber(phone)) {
            return next(new ErrorHandler("Invalid Phone Number!", 400))
        }

        // check for user email or phone already exists in database
        const existingUser = await User.findOne({
            $or: [
                {
                    email,
                    accountVerified: true,
                },
                {
                    phone,
                    accountVerified: true,
                },
            ]
        });

        if (existingUser) {
            return next(new ErrorHandler("User already Exists!", 400))
        }

        // if user makes max 3 requests for email or phone then he/she will not be able to send request again
        const registeredAttemptsByUser = await User.find({
            $or: [
                {
                    phone,
                    accountVerified: false
                },
                {
                    email,
                    accountVerified: false
                },
            ]
        })

        if (registeredAttemptsByUser.length > 3) {
            return next(new errorHandler("You have exceeded the maximum number of attempts (3), please try again after 1 hour!", 400))
        }


        // now store data
        const UserData = {
            name,
            email,
            phone,
            password,
        };

        const user = await User.create(UserData);
        // this generateVerificationCode method is created in user model
        const verificationCode = await user.generateVerificationCode();
        await user.save();

        // this method requests the method of from which you get verification code ie. email or phone

        sendVerificationCode(verificationMethod, verificationCode, name, email, phone, res);
       

    } catch (error) {
        next(error);
    }
});


async function sendVerificationCode(verificationMethod, verificationCode, name, email, phone, res) {

    try {
        if (verificationMethod === "email") {
            // generateEmailTemplate method is created below 
            const message = generateEmailTemplate(verificationCode)
            // this sendEmail method is created in utils folder
            sendEmail({ email, subject: "Your Verification code", message });
            res.status(200)
                .json({
                    success: true,
                    message: `verification email successfully sent to ${name}`
                })
        }
        else if (verificationMethod === "phone") {
            // as code is generated as 78458 but actually code will send as 7 8 4 5 8 we have to add space
            const verificationCodeWithSpace = verificationCode
                .toString()
                .split("")
                .join(" ");

            await client.calls.create({
                twiml: `<Response><Say>Your Verification code is ${verificationCodeWithSpace}. 
            Your Verification code is ${verificationCodeWithSpace}</Response>`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone,
            })
            res.status(200)
                .json({
                    success: true,
                    message: `OTP sent`
                })
        }
        else {
            return res.status(500).json({
                success: false,
                message: "invalid verification method"
           })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "verification code failed to send"
        })
    }

    
}


// function generateEmailTemplate(verificationCode) {
//     return
//     `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Email Verification</title>
//         </head>
//         <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #333;">
//             <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
//                 <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
//                     <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
//                 </div>
//                 <div style="padding: 20px; text-align: center;">
//                     <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
//                     <p style="font-size: 16px; line-height: 1.5;">Thank you for signing up. Please use the verification code below to complete your registration:</p>
//                     <div style="display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 24px; font-weight: bold; color: #4CAF50; border: 1px dashed #4CAF50; border-radius: 4px; background: #f9fff9;">
//                         ${verificationCode}
//                     </div>
//                 </div>
//                 <div style="text-align: center; font-size: 14px; color: #777; margin-top: 20px;">
//                     <p>If you did not request this code, you can ignore this email.</p>
//                 </div>
//             </div>
//         </body>
//         </html>
//     `
// }

function generateEmailTemplate(verificationCode) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #333;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
                </div>
                <div style="padding: 20px; text-align: center;">
                    <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for signing up. Please use the verification code below to complete your registration:</p>
                    <div style="display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 24px; font-weight: bold; color: #4CAF50; border: 1px dashed #4CAF50; border-radius: 4px; background: #f9fff9;">
                        ${verificationCode}
                    </div>
                </div>
                <div style="text-align: center; font-size: 14px; color: #777; margin-top: 20px;">
                    <p>If you did not request this code, you can ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
