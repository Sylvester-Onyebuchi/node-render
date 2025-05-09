import nodemailer from 'nodemailer'
import { VERIFICATION_EMAIL_TEMPLATE, getPasswordResetEmailTemplate, RESET_PASSWORD_SUCCESS_TEMPLATE } from './template.js'
import dotenv from 'dotenv'
dotenv.config()


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})

export const sendVerificationEmail = async(email, token) => {
    const html = VERIFICATION_EMAIL_TEMPLATE(token)
    const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'Verify Your Account',
        html 
    }
    try {
        await transporter.sendMail(mailOptions)
        
console.log("Verification email sent")
    } catch (error) {
        console.error('Error sending email: ', error)
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'Account Verified',
        html: `<p>Your account has been successfully verified. Welcome ${name}!</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent');
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

export const sendPasswordResetEmail = async(email, resetURL) => {
    try {
        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject:'Reset Password',
            html: getPasswordResetEmailTemplate(resetURL)
        }
        await transporter.sendMail(mailOptions)
        console.log("Password reset email sent")
    }catch(err){
        console.error('Error sending welcome email:', err);
    }
}

export const sendResetPasswordSuccessEmail = async(email) => {
    try {
        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject: 'Password Reset Success',
            html: RESET_PASSWORD_SUCCESS_TEMPLATE
        }
        await transporter.sendMail(mailOptions)
        console.log("Password reset success email sent")
    }catch(err){
        console.error('Error sending success email:', err);
    }
}
