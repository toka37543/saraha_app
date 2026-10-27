import {escapeHtml} from "../../common/mail.js";

export const confirmEmailTemplate = ({name, token, validMinutes}) => ({
    subject: "Confirm your Saraha account",
    text: `Hi ${name},\n\nUse this code to confirm your email:\n${token}\n\nThe code is valid for ${validMinutes} minutes.`,
    html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for signing up to Saraha, use this code to confirm your email:</p>
        <p><code>${escapeHtml(token)}</code></p>
        <p>The code is valid for ${validMinutes} minutes. If you didn't create an account, ignore this email.</p>
    `,
});

export const resetPasswordTemplate = ({name, token, validMinutes}) => ({
    subject: "Reset your Saraha password",
    text: `Hi ${name},\n\nUse this code to reset your password:\n${token}\n\nThe code is valid for ${validMinutes} minutes.`,
    html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Use this code to reset your password:</p>
        <p><code>${escapeHtml(token)}</code></p>
        <p>The code is valid for ${validMinutes} minutes. If you didn't request a password reset, ignore this email.</p>
    `,
});
