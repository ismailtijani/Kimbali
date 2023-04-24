import nodemailer from "nodemailer";
import Logger from "../library/logger";
import dotenv from "dotenv";

dotenv.config();

interface IOptions {
  email: string;
  message: string;
  subject: string;
}

const sendEmail = (options: IOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SENDGRID_KEY,
    },
  });

  const mailOptions = {
    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: "<b>Welcome to Kimbali API!</b>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) Logger.error(error);
    Logger.info("Mail sent successfully: " + info.response);
  });
};

export default sendEmail;
