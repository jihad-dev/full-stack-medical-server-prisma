
import nodemailer from 'nodemailer';
import config from '../../../config';
const emailSender = async (email: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        service: 'gmail',
        secure: false, // true for 465
        auth: {
            user: config.email,
            pass: config.app_password, // must be App Password from Google
        },
    });
    await transporter.sendMail({
        from: `"PH Medical" <${config.email}>`,
        to: email,
        subject: "Reset Your Password",
        html, // dynamic html
    });

};

export default emailSender;
