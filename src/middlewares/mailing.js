import twilio from "twilio"
import nodemailer from "nodemailer"

const TWILIO_ACCOUNT_SID = process.env.twilio_account_sid
const TWILIO_AUTH_TOKEN = process.env.twilio_auth_token
const TWILIO_SMS_NUMBER = process.env.twilio_sms_number

export const client = () => { twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) }

export const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.email_user,
        pass: process.env.email_pass
    }
})
