export const sendToken = (user, statusCode, message, res) => {
    // this generate token function present in user.model.js file
    const token = user.generateToken();
    console.log(token)
    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }).json({
        success: true,
        message,
        token,
        user,
    })
}