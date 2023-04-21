import nodemailer from "nodemailer";
import Logger from "../library/logger";

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
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) Logger.error(error);
    Logger.info("Email sent: " + info.response);
  });
};

export default sendEmail;
