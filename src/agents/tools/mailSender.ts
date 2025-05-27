import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export class MailSender {
  private emailAddress: string;
  private emailPassword: string;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.emailAddress = process.env.EMAIL_ADDRESS || "";
    this.emailPassword = process.env.EMAIL_PASSWORD || "";

    if (!this.emailAddress || !this.emailPassword) {
      throw new Error("Missing EMAIL_ADDRESS or EMAIL_PASSWORD in .env");
    }

    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: this.emailAddress,
        pass: this.emailPassword,
      },
    });
  }

  async sendMail(subject: string, recipient: string, body: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.emailAddress,
      to: recipient,
      subject,
      text: body,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }
}

export default MailSender