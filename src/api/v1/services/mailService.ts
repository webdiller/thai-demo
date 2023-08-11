import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVICE_NAME,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
});

class MailService {
  async registrationByEmail(email: string, activationLink: string) {
    const handlebarOptions: hbs.NodemailerExpressHandlebarsOptions = {
      viewEngine: {
        partialsDir: path.resolve("./src/emailviews/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./src/emailviews/"),
    };

    transporter.use("compile", hbs(handlebarOptions));

    const mailData: object = {
      from: process.env.EMAIL_SERVICE_NAME,
      to: email,
      subject: `Заявка с сайта ${process.env.SITE_NAME}`,
      context: {
        url: `${process.env.WEBSITE_HOST}/auth/activateLinkByEmail/${activationLink}`,
      },
      template: "registration",
    };

    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        console.log("Error occurred:", error.message);
        console.log("Error occurred:", info);
        return { status: "error" };
      } else {
        console.log("Email sent:", info.messageId);
        return { status: "ok" };
      }
    });
  }

  async sendInvitationToResetPassword(
    email: string,
    resetPasswordLink: string
  ) {
    const handlebarOptions: hbs.NodemailerExpressHandlebarsOptions = {
      viewEngine: {
        partialsDir: path.resolve("./src/emailviews/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./src/emailviews/"),
    };

    transporter.use("compile", hbs(handlebarOptions));

    const mailData: object = {
      from: process.env.EMAIL_SERVICE_NAME,
      to: email,
      subject: `Заявка с сайта ${process.env.SITE_NAME}`,
      context: {
        resetPasswordLink: `${process.env.WEBSITE_HOST}/auth/resetEmailPassword/${resetPasswordLink}`,
      },
      template: "reset",
    };

    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        console.log("Error occurred:", error.message);
        return { status: "error" };
      } else {
        console.log("Email sent:", info.messageId);
        return { status: "ok" };
      }
    });
  }
}

export default new MailService();
