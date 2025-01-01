import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: [5, "Password must be at least 5 characters"],
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    accountVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: Number,
    },
    verificationCodeExpire: {
        type: Date
    },
    resetPasswordExpire: {
        type:Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


userSchema.pre("save", async function (next) {
    // if the password is not modified then call next()
    if (!this.isModified("password")) {
        next();
    }
    // if the password is modified or new user is registered
    this.password = await bcrypt.hash(this.password, 10);
})


// this function compares the database stored password i.e hashed password and user entered password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateVerificationCode = function () {
    function generateRandomFiveDigitNumber() {
        // math.random generate value in point format i.e 0.1, 0.6, 0.3..
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        const remainingDigit = Math.floor(Math.random() * 10000).toString().padStart(4, 0);
        return parseInt(firstDigit + remainingDigit);
    } 

    const verificationCode = generateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    // this code will expire in 5 minutes
    this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;


    return verificationCode;
}






export const User = mongoose.model("User", userSchema);