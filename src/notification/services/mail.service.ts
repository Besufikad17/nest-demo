import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { IMailInterface, IMailService } from "../interfaces";

@Injectable()
export class MailService implements IMailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendEmail(emailData: IMailInterface) {
    await this.mailerService.sendMail({
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.html
    });
  }
}
