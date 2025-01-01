
import nodeMailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMPT_HOST,
        service: process.env.SMTP_SERVICE,
        port: process.env.SMPT_PORT,
        auth: {
            // from which email the verification code will send
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const options = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html: message,
    };

    // Use sendMail() instead of send()
    await transporter.sendMail(options);
};

export { sendEmail };
