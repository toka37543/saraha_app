import nodemailer from "nodemailer";
import config from "../config.js";
import {ServiceUnavailableException} from "./errors.js";

export const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth:{
        user: config.smtpUser,
        pass: config.smtpPass,
    },
});

// user input (names, ...) must be escaped before putting it in an email html body
export const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const MailService = {
    send: async ({to, subject, html, text}) => {
        try {
            return await transporter.sendMail({
                from: config.mailFrom,
                to: to,
                subject: subject,
                html: html,
                text: text,
            });
        } catch (error) {
            console.error("Sending email failed:", error);
            throw new ServiceUnavailableException("Email could not be sent, please try again later", null, "EMAIL_NOT_SENT");
        }
    }
}
